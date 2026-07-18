"""
Creates an 'admin' and 'demo' login (both with every screen permission the app
knows about) and populates enough sample data across inventory/process/reports
for the dashboard and list pages to show real numbers instead of zeros.

Usage: python manage.py seed_demo
Safe to re-run — uses get_or_create / unique lookups throughout.
"""
import random
from datetime import date, timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed an admin + demo user (full permissions) and demo data for the dashboard.'

    def handle(self, *args, **options):
        self.stdout.write('Collecting every screen permission id from the router...')
        screens = self._all_screen_ids()
        self.stdout.write(f'  {len(screens)} screen ids found.')

        admin_type = self._make_full_access_user_type(screens)

        admin = self._make_user('admin', 'Admin123!', admin_type, 'Admin', 'User')
        demo = self._make_user('demo', 'Demo123!', admin_type, 'Demo', 'User')

        self.stdout.write('Seeding inventory (units, items, trays, pits, suppliers)...')
        units, items, trays, pits, suppliers = self._seed_inventory()

        self.stdout.write('Seeding process data (batches, egg process, pit status, etc.)...')
        batches = self._seed_process(admin, units, items, trays, pits, suppliers)

        self.stdout.write('Seeding reports data (measurable, DC, rejects)...')
        self._seed_reports()

        self.stdout.write('Seeding progress tracking (status updates, FRP processing)...')
        self._seed_progress_tracking(admin, batches, pits, trays)

        self.stdout.write(self.style.SUCCESS(
            '\nDone.\n'
            f'  admin  / Admin123!\n'
            f'  demo   / Demo123!\n'
            '  Both have every screen permission the app currently registers.'
        ))

    # ── permissions ──

    def _all_screen_ids(self):
        """Same derivation permission_catalog uses: every required_screens value
        across every registered ViewSet, so 'full access' can never drift out of
        sync with what the app actually enforces."""
        from config.urls import router
        ids = set()
        for _prefix, viewset, _basename in router.registry:
            required = getattr(viewset, 'required_screens', None)
            if required:
                ids.update(required.values())
        return sorted(ids)

    def _make_full_access_user_type(self, screens):
        """`screens` (individual action permissions, checked by has_screen()) gets
        every id. `main_screens` is a distinct, much smaller concept — the sidebar's
        top-level category ids — so it does NOT get the same full list; no
        MainScreen rows exist yet in this fresh DB, so it's left blank."""
        from accounts.models import UserType
        screens_csv = ','.join(screens)
        user_type, _ = UserType.objects.update_or_create(
            type_name='Admin',
            defaults={
                'description': 'Full access (seeded by seed_demo).',
                'screens': screens_csv,
                'main_screens': '',
                'is_active': True,
            },
        )
        return user_type

    def _make_user(self, user_name, password, user_type, first_name, last_name):
        from accounts.models import User
        user, created = User.objects.update_or_create(
            user_name=user_name,
            defaults={
                'password_hash': make_password(password),
                'first_name': first_name,
                'last_name': last_name,
                'user_type': user_type,
                'is_active': True,
                'is_deleted': False,
                'screens': user_type.screens,
                'main_screens': user_type.main_screens,
            },
        )
        self.stdout.write(f"  user '{user_name}' {'created' if created else 'updated'}")
        return user

    # ── inventory ──

    def _seed_inventory(self):
        from inventory.models import Item, Pit, Supplier, Tray, Unit

        units = {}
        for name in ('Kg', 'Ltr', 'Nos'):
            units[name], _ = Unit.objects.get_or_create(unit_name=name)

        items = {}
        for idx, (name, unit_name) in enumerate([
            ('Chick Feed', 'Kg'), ('Water', 'Ltr'), ('Kitchen Waste', 'Kg'), ('Fruit Waste', 'Kg'),
        ], start=1):
            item, created = Item.objects.get_or_create(
                item_name=name,
                defaults={'item_code': f'IT-{idx:03d}', 'unit': units[unit_name]},
            )
            items[name] = item

        trays = []
        for i in range(1, 11):
            tray, _ = Tray.objects.get_or_create(
                bin_name=f'EGG-TRAY-{i:02d}',
                defaults={'tray_type': '1'},
            )
            trays.append(tray)
        for i in range(1, 6):
            tray, _ = Tray.objects.get_or_create(
                bin_name=f'FRP-TRAY-{i:02d}',
                defaults={'tray_type': '2'},
            )
            trays.append(tray)

        pits = []
        for i, name in enumerate(['Pit A', 'Pit B', 'Pit C'], start=1):
            pit, _ = Pit.objects.get_or_create(
                pit_name=name,
                defaults={'location': f'Zone {i}', 'length': 10, 'width': 5, 'height': 2},
            )
            pits.append(pit)

        suppliers = []
        for name, label in [('Green Farms Ltd', 'GFL'), ('EcoWaste Suppliers', 'EWS')]:
            supplier, _ = Supplier.objects.get_or_create(
                supplier_name=name, defaults={'label': label, 'contact_no': '9876543210'}
            )
            suppliers.append(supplier)

        return units, items, trays, pits, suppliers

    # ── process ──

    def _seed_process(self, staff, units, items, trays, pits, suppliers):
        from process.models import (
            CullingProcess, DryProcess, EggProcess, Leachate, MaterialReceived,
            OvenProcess, PitStatus,
        )

        today = timezone.localdate()

        # Material batches this month, referenced by egg process / pit status below.
        batches = []
        for i in range(1, 4):
            batch, _ = MaterialReceived.objects.get_or_create(
                batch_id=f'BATCH-{today.strftime("%Y%m")}-{i:03d}',
                defaults={
                    'date': today - timedelta(days=i),
                    'supplier': suppliers[i % len(suppliers)],
                    'item': items['Chick Feed'],
                    'qty': 500 + i * 50,
                    'unit': units['Kg'],
                    'batch_status': 'used' if i == 1 else 'pending',
                },
            )
            batches.append(batch)

        # Egg process entries this month → feeds tray_status + KPI egg_hatching/egg_purchasing.
        for i, batch in enumerate(batches, start=1):
            egg, created = EggProcess.objects.get_or_create(
                entry_no=f'EPC-{i:05d}',
                defaults={
                    'entry_date': today - timedelta(days=i),
                    'staff': staff,
                    'supplier': batch.supplier,
                    'batch': batch,
                    'tot_qty': 1200 + i * 100,
                    'tray_utilized': 2,
                },
            )
            if created:
                egg.trays.set(trays[(i - 1) * 2:(i - 1) * 2 + 2])

        # Pit status progression this month → feeds pit_chart + KPI organic_waste/larvae/manure.
        for i, pit in enumerate(pits, start=1):
            batch_prefix = f'PIT-{i:03d}'  # Unique per pit: PIT-001, PIT-002, PIT-003
            PitStatus.objects.get_or_create(
                form_batch_id=f'{batch_prefix}-00001',
                defaults={
                    'entry_date': today - timedelta(days=5),
                    'pit': pit,
                    'org_status': '1',
                    'feed_qty': 300 + i * 20,
                },
            )
            PitStatus.objects.get_or_create(
                form_batch_id=f'{batch_prefix}-00002',
                defaults={
                    'entry_date': today - timedelta(days=3),
                    'pit': pit,
                    'org_status': '2',
                    'batch': batches[0],
                    'larvae_qty_in': 50 + i * 5,
                },
            )
            PitStatus.objects.get_or_create(
                form_batch_id=f'{batch_prefix}-00003',
                defaults={
                    'entry_date': today - timedelta(days=1),
                    'pit': pit,
                    'org_status': '5',
                    'larvae_qty': 800 + i * 50,
                    'qty_manure_1': 150 + i * 10,
                    'qty_manure_2': 60 + i * 5,
                    'qty_rejets': 20 + i,
                    'harvest_comp': 'completed',
                },
            )

        # A handful of rows in the other process modules so their list pages aren't empty.
        for i in range(1, 4):
            CullingProcess.objects.get_or_create(
                entry_date=today - timedelta(days=i),
                shift_type='1', cylinder_no=f'CYL-{i:02d}',
                defaults={
                    'cylinder_type': '1', 'starting_weight': 50, 'ending_weight': 30,
                    'raw_material_weight': 100 + i * 5, 'final_larvae_weight': 80 + i * 5,
                    'work_done': '1',
                },
            )
            OvenProcess.objects.get_or_create(
                entry_date=today - timedelta(days=i), starting_time='08:00',
                defaults={
                    'closing_time': '16:00', 'diesel_topup': 10, 'raw_larvae_process': 200 + i * 10,
                    'dried_larvae_production': 150 + i * 8, 'dried_larvae_stock': 500 + i * 20,
                },
            )
            DryProcess.objects.get_or_create(
                date=today - timedelta(days=i), type='1', drying_method=random.choice(('1', '2')),
                defaults={'quantity': 100 + i * 10, 'qty_manure': 20 + i},
            )
            Leachate.objects.get_or_create(
                entry_date=today - timedelta(days=i),
                defaults={'qty_leachate': 30 + i * 2, 'remarks': 'Routine collection'},
            )

        return batches

    # ── reports ──

    def _seed_reports(self):
        from reports.models import DC, Measurable, Reject, RejectImage

        today = timezone.localdate()

        for i in range(1, 4):
            Measurable.objects.get_or_create(
                entry_date=today - timedelta(days=i), location=f'Pit A - Zone {i}',
                defaults={'temp': 28 + i, 'humi': 60 + i, 'remarks': 'Routine reading'},
            )

        dc, created = DC.objects.get_or_create(
            dc_number='DC-0001',
            defaults={
                'challan_date': today, 'bill_to_company': 'Zigfly Client Pvt Ltd',
                'bill_to_address': 'Chennai, TN', 'tax_rate': 18,
            },
        )
        if created:
            dc.items.create(desc='Larvae Meal', hsn='2309', qty=100, unit='Kgs', rate=120, amount=12000)
            dc.items.create(desc='Frass Manure', hsn='3101', qty=50, unit='Kgs', rate=40, amount=2000)
            dc.grand_total = 14000 * 1.18
            dc.save()

        for i in range(1, 4):
            reject, created = Reject.objects.get_or_create(
                ticket_no=f'TKT-{i:04d}',
                defaults={
                    'vehicle_no': f'TN-{10+i}-AB-{1000+i}', 'vendor': 'Local Transport Co',
                    'date': today - timedelta(days=i), 'empty_weight': 5000, 'loaded_weight': 8000,
                    'net_weight': 3000, 'time': f'{9+i}:00',
                },
            )
            if created:
                RejectImage.objects.get_or_create(
                    ticket_no=f'TKT-{i:04d}',
                    defaults={
                        'upload_date': today - timedelta(days=i), 'vehicle_no': f'TN-{10+i}-AB-{1000+i}',
                        'net_weight': 3000, 'weigh_date': today - timedelta(days=i),
                    },
                )

    # ── progress tracking ──

    def _seed_progress_tracking(self, staff, batches, pits, trays):
        from process.models import (
            StatusUpdate, FrpTrayProcess, FrpStatusUpdate,
        )

        today = timezone.localdate()

        # Egg hatching progress (StatusUpdate) — tracks day-by-day incubation progress.
        for batch_idx, batch in enumerate(batches, start=1):
            for day in range(1, 4):
                StatusUpdate.objects.get_or_create(
                    entry_date=today - timedelta(days=4 - day),
                    staff=staff, batch=batch, day=day,
                    defaults={
                        'hatching_status': 'completed' if day == 3 else ('progressing' if day == 2 else 'pending'),
                        'remarks': f'Day {day} of incubation: {"eggs hardening" if day==1 else "embryo development" if day==2 else "chicks ready to hatch"}',
                    },
                )

        # FRP (Fiber Reinforced Plastic) tray processing — separate batch flow.
        for i in range(1, 3):
            frp_batch, created = FrpTrayProcess.objects.get_or_create(
                entry_date=today - timedelta(days=i),
                batch=batches[i % len(batches)],
                defaults={
                    'frp_tray_count': 5 + i,
                    'batch_status': 'in_process' if i == 1 else 'pending',
                },
            )
            if created:
                frp_batch.trays.set(trays[-5:])  # Last 5 trays are FRP trays

            # FRP progress tracking (day-by-day updates).
            for day in range(1, 3):
                FrpStatusUpdate.objects.get_or_create(
                    entry_date=today - timedelta(days=i - day),
                    staff=staff, batch=frp_batch, day=day,
                    defaults={
                        'entry_no': f'FRP-{i:05d}' if day == 1 else None,
                        'hatching_status': 'progressing' if day == 1 else 'completed',
                        'remarks': f'FRP batch {i}, day {day}: {"processing in trays" if day==1 else "ready for next stage"}',
                    },
                )
