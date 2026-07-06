#!/usr/bin/env python
import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from inventory.models import Pit, Tray, Supplier
from process.models import MaterialReceived, EggProcess, PitStatus

print("Generating additional random demo data for dashboard testing...")

demo_user = User.objects(user_name='demo').first()
batch1 = MaterialReceived.objects(batch_id='BAT-DEMO-001').first()
supplier = Supplier.objects(supplier_name='Demo Supplier').first()

pits = list(Pit.objects())
if len(pits) < 3:
    for i in range(2):
        pits.append(Pit(pit_name=f'Demo Pit {i+2}', length=10, width=5, height=1).save())

trays = list(Tray.objects(tray_type='1'))
if len(trays) < 5:
    for i in range(4):
        trays.append(Tray(bin_name=f'DEMO-TRAY-10{i+2}', tray_type='1').save())

for i in range(15):
    d = (datetime.now() - timedelta(days=random.randint(0, 30))).date()
    
    # 1. Create EggProcess
    EggProcess(
        entry_date=d,
        entry_no=f'EGG-DEMO-RND-{random.randint(1000, 9999)}',
        batch=batch1,
        staff=demo_user,
        supplier=supplier,
        tot_qty=random.uniform(50, 300),
        tray_utilized=random.randint(1, 5),
        trays=[random.choice(trays)]
    ).save()
    
    # 2. Create PitStatus feeding (org_status = 1)
    PitStatus(
        entry_date=d,
        pit=random.choice(pits),
        org_status='1',
        feed_qty=random.uniform(10, 100),
        feed_count=random.randint(500, 2000),
        form_batch_id=f'FORM-DEMO-RND-A-{random.randint(1000, 9999)}'
    ).save()
    
    # 3. Create PitStatus baby larvae (org_status = 2)
    PitStatus(
        entry_date=d,
        pit=random.choice(pits),
        org_status='2',
        larvae_qty_in=random.uniform(5, 40),
        form_batch_id=f'FORM-DEMO-RND-B-{random.randint(1000, 9999)}'
    ).save()
    
    # 4. Create PitStatus harvest/screen (org_status = 5 or 6)
    PitStatus(
        entry_date=d + timedelta(days=random.randint(1, 3)),
        pit=random.choice(pits),
        org_status=random.choice(['5', '6']),
        larvae_qty=random.uniform(100, 500),
        qty_manure_1=random.uniform(20, 100),
        qty_manure_2=random.uniform(10, 50),
        qty_rejets=random.uniform(1, 20),
        form_batch_id=f'FORM-DEMO-RND-C-{random.randint(1000, 9999)}'
    ).save()

print("[OK] Generated additional random demo data.")
