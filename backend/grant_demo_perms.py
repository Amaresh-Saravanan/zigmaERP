#!/usr/bin/env python
"""One-off: grant the demo user every screen + main-screen permission so all
modules are testable. Run: python grant_demo_perms.py"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User

# Every screen id enforced by the ViewSets (from /api/permission-catalog).
SCREENS = ','.join([
    'unit_view,unit_create,unit_edit,unit_delete',
    'item_view,item_create,item_edit,item_delete',
    'tray_view,tray_create,tray_edit,tray_delete',
    'pit_view,pit_create,pit_edit,pit_delete',
    'supplier_view,supplier_create,supplier_edit,supplier_delete',
    'user_view,user_create,user_edit,user_delete',
    'user_type_view,user_type_create,user_type_edit,user_type_delete',
    'main_screen_view,main_screen_create,main_screen_edit,main_screen_delete',
    'screen_view,screen_create,screen_edit,screen_delete',
    'material_received_view,material_received_create,material_received_edit,material_received_delete',
    'egg_process_view,egg_process_create,egg_process_edit,egg_process_delete',
    'status_update_view,status_update_create,status_update_edit,status_update_delete',
    'culling_process_view,culling_process_create,culling_process_edit,culling_process_delete',
    'oven_process_view,oven_process_create,oven_process_edit,oven_process_delete',
    'dry_process_view,dry_process_create,dry_process_edit,dry_process_delete',
    'leachate_view,leachate_create,leachate_edit,leachate_delete',
    'pit_status_view,pit_status_create,pit_status_edit,pit_status_delete',
    'frp_tray_process_view,frp_tray_process_create,frp_tray_process_edit,frp_tray_process_delete',
    'frp_status_update_view,frp_status_update_create,frp_status_update_edit,frp_status_update_delete',
    'measurable_view,measurable_create,measurable_edit,measurable_delete',
    'logsheet_view,logsheet_create,logsheet_edit,logsheet_delete',
    'dc_view,dc_create,dc_edit,dc_delete',
])

# Sidebar category ids (match DEMO_MENU in Sidebar.jsx).
MAIN_SCREENS = 'msm_admin,msm_settings,msm_hatching,msm_processing,msm_drying,msm_report'

user = User.objects(user_name='demo').first()
if not user:
    raise SystemExit("[FAIL] demo user not found - run create_demo_data.py first")

user.screens = SCREENS
user.main_screens = MAIN_SCREENS
user.save()
print(f"[OK] demo user granted {len(SCREENS.split(','))} screens + {len(MAIN_SCREENS.split(','))} main screens")
