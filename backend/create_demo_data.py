#!/usr/bin/env python
"""
Standalone script to create demo data for testing.
Run: python create_demo_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.hashers import make_password
from accounts.models import User, UserType
from inventory.models import Unit, Item, Pit, Supplier, Tray
from process.models import MaterialReceived, EggProcess, PitStatus, FrpTrayProcess, FrpStatusUpdate
from datetime import datetime, timedelta

# Demo user
demo_user = User.objects(user_name='demo').first()
if not demo_user:
    admin_type = UserType.objects(type_name='Admin').first()
    if not admin_type:
        # Create Admin type with all screen permissions
        screens_list = ','.join([
            'unit_view,unit_create,unit_edit,unit_delete',
            'item_view,item_create,item_edit,item_delete',
            'pit_view,pit_create,pit_edit,pit_delete',
            'supplier_view,supplier_create,supplier_edit,supplier_delete',
            'tray_view,tray_create,tray_edit,tray_delete',
            'material_received_view,material_received_create,material_received_edit,material_received_delete',
            'egg_process_view,egg_process_create,egg_process_edit,egg_process_delete',
            'pit_status_view,pit_status_create,pit_status_edit,pit_status_delete',
            'frp_tray_process_view,frp_tray_process_create,frp_tray_process_edit,frp_tray_process_delete',
            'frp_status_update_view,frp_status_update_create,frp_status_update_edit,frp_status_update_delete',
        ])
        admin_type = UserType(type_name='Admin', screens=screens_list).save()

    demo_user = User(
        user_name='demo',
        password_hash=make_password('demo123'),
        user_type=admin_type,
        is_active=True
    ).save()
    print("[OK] Created demo user: demo / demo123")

# Unit
unit = Unit.objects(unit_name='Demo Unit').first()
if not unit:
    unit = Unit(unit_name='Demo Unit').save()
    print(f"[OK] Created Unit: {unit.unit_name}")

# Items
egg_item = Item.objects(item_name='Demo Egg').first()
if not egg_item:
    egg_item = Item(
        item_code='ITM-DEMO-001',
        item_name='Demo Egg',
        unit=unit
    ).save()
    print(f"[OK] Created Item (Egg): {egg_item.item_name}")

organic_item = Item.objects(item_name='Demo Organic').first()
if not organic_item:
    organic_item = Item(
        item_code='ITM-DEMO-002',
        item_name='Demo Organic',
        unit=unit
    ).save()
    print(f"[OK] Created Item (Organic): {organic_item.item_name}")

# Pit
pit = Pit.objects(pit_name='Demo Pit A').first()
if not pit:
    pit = Pit(
        pit_name='Demo Pit A',
        length=10.0,
        width=5.0,
        height=1.0
    ).save()
    print(f"[OK] Created Pit: {pit.pit_name} (vol: {pit.volume}m³)")

# Supplier
supplier = Supplier.objects(supplier_name='Demo Supplier').first()
if not supplier:
    supplier = Supplier(
        supplier_name='Demo Supplier',
        label='DS',
        address='123 Demo St',
        contact_no='9999999999',
        gst_no='12ABCDE1234F1Z5'
    ).save()
    print(f"[OK] Created Supplier: {supplier.supplier_name}")

# MaterialReceived (batch for Egg)
batch1 = MaterialReceived.objects(batch_id='BAT-DEMO-001').first()
if not batch1:
    batch1 = MaterialReceived(
        batch_id='BAT-DEMO-001',
        date=datetime.now().date(),
        item=egg_item,
        supplier=supplier,
        unit=unit,
        qty=1000
    ).save()
    print(f"[OK] Created MaterialReceived batch: {batch1.batch_id}")

# MaterialReceived (batch for FRP)
batch2 = MaterialReceived.objects(batch_id='BAT-FRP-DEMO-001').first()
if not batch2:
    batch2 = MaterialReceived(
        batch_id='BAT-FRP-DEMO-001',
        date=(datetime.now() - timedelta(days=7)).date(),
        item=organic_item,
        supplier=supplier,
        unit=unit,
        qty=500
    ).save()
    print(f"[OK] Created MaterialReceived batch (FRP): {batch2.batch_id}")

# Trays
tray1 = Tray.objects(bin_name='DEMO-TRAY-001').first()
if not tray1:
    tray1 = Tray(
        bin_name='DEMO-TRAY-001',
        tray_type='1'
    ).save()
    print(f"[OK] Created Tray (EGG): {tray1.bin_name}")

tray2 = Tray.objects(bin_name='DEMO-TRAY-002').first()
if not tray2:
    tray2 = Tray(
        bin_name='DEMO-TRAY-002',
        tray_type='2'
    ).save()
    print(f"[OK] Created Tray (FRP): {tray2.bin_name}")

# EggProcess
egg_process = EggProcess.objects(batch=batch1).first()
if not egg_process:
    egg_process = EggProcess(
        entry_date=datetime.now().date(),
        entry_no='EGG-DEMO-001',
        batch=batch1,
        staff=demo_user,
        supplier=supplier,
        tot_qty=100.0,
        tray_utilized=1,
        trays=[tray1]
    ).save()
    print(f"[OK] Created EggProcess: {egg_process.entry_no}")

# PitStatus (org_status 1 - feeding)
pit_status_1 = PitStatus.objects(pit=pit, org_status='1').first()
if not pit_status_1:
    pit_status_1 = PitStatus(
        entry_date=datetime.now().date(),
        pit=pit,
        org_status='1',
        feed_qty=50.0,
        feed_count=1000,
        form_batch_id='FORM-DEMO-001'
    ).save()
    print(f"[OK] Created PitStatus (org_status=1): {pit_status_1.form_batch_id}")

# PitStatus (org_status 6 - screening)
pit_status_6 = PitStatus.objects(pit=pit, org_status='6').first()
if not pit_status_6:
    pit_status_6 = PitStatus(
        entry_date=(datetime.now() - timedelta(days=1)).date(),
        pit=pit,
        org_status='6',
        larvae_qty=75.0,
        qty_manure_1=30.0,
        qty_manure_2=25.0,
        qty_rejets=5.0,
        form_batch_id='FORM-DEMO-002'
    ).save()
    print(f"[OK] Created PitStatus (org_status=6): {pit_status_6.form_batch_id}")

# FrpTrayProcess
frp_process = FrpTrayProcess.objects(batch=batch2).first()
if not frp_process:
    frp_process = FrpTrayProcess(
        entry_date=datetime.now().date(),
        batch=batch2,
        frp_tray_count=1,
        trays=[tray2]
    ).save()
    print(f"[OK] Created FrpTrayProcess: {frp_process.entry_date}")

# FrpStatusUpdate
frp_status = FrpStatusUpdate.objects(batch=frp_process).first()
if not frp_status:
    frp_status = FrpStatusUpdate(
        entry_date=datetime.now().date(),
        batch=frp_process,
        day=1,
        hatching_status='progressing',
        staff=demo_user
    ).save()
    print(f"[OK] Created FrpStatusUpdate: day {frp_status.day}")

print("\n=== Demo data setup complete! ===")
print("   Login with: demo / demo123")
print("   Access at: http://localhost:3000")
