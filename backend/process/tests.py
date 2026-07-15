"""
Process module CRUD tests — run against mongomock, not the real Atlas cluster in .env.
"""
import mongoengine as me
import mongomock
import pytest
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient

from accounts.models import AuthToken, User, UserType
from inventory.models import Item, Pit, Supplier, Tray, Unit
from process.models import (
    CullingProcess,
    DryProcess,
    EggProcess,
    FrpStatusUpdate,
    FrpTrayProcess,
    Leachate,
    MaterialReceived,
    OvenProcess,
    PitStatus,
    StatusUpdate,
)


@pytest.fixture(autouse=True)
def mongomock_connection():
    me.disconnect()
    me.connect(db='zigma_erp_test', mongo_client_class=mongomock.MongoClient)
    yield
    UserType.drop_collection()
    User.drop_collection()
    AuthToken.drop_collection()
    Unit.drop_collection()
    Item.drop_collection()
    Tray.drop_collection()
    Pit.drop_collection()
    Supplier.drop_collection()
    MaterialReceived.drop_collection()
    CullingProcess.drop_collection()
    OvenProcess.drop_collection()
    DryProcess.drop_collection()
    Leachate.drop_collection()
    EggProcess.drop_collection()
    StatusUpdate.drop_collection()
    PitStatus.drop_collection()
    FrpTrayProcess.drop_collection()
    FrpStatusUpdate.drop_collection()
    me.disconnect()


def make_user(screens=''):
    ut = UserType(type_name='Tester').save()
    return User(user_name='tester', password_hash=make_password('pw'), user_type=ut, screens=screens).save()


def authed_client(user):
    client = APIClient()
    res = client.post('/api/auth/login', {'user_name': user.user_name, 'password': 'pw'}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Token {res.data['data']['access_token']}")
    return client


ALL_SCREENS = ','.join(
    f'{module}_{action}'
    for module in (
        'material_received', 'culling_process', 'oven_process', 'dry_process', 'leachate',
        'egg_process', 'status_update', 'pit_status', 'frp_tray_process', 'frp_status_update',
    )
    for action in ('view', 'create', 'edit', 'delete')
)


@pytest.fixture
def supplier():
    return Supplier(supplier_name='Acme Co', label='ABC').save()


@pytest.fixture
def unit():
    return Unit(unit_name='Kilogram').save()


@pytest.fixture
def egg_item(unit):
    return Item(item_name='Egg', item_code='IT-001', unit=unit).save()


@pytest.fixture
def generic_item(unit):
    return Item(item_name='Widget', item_code='IT-002', unit=unit).save()


@pytest.fixture
def pit():
    return Pit(pit_name='Pit 1', length=1, width=1, height=1).save()


@pytest.fixture
def tray():
    return Tray(tray_type='1', bin_name='Bin A').save()


@pytest.fixture
def batch(supplier, egg_item, unit):
    return MaterialReceived(
        date='2026-07-01', supplier=supplier, item=egg_item, qty=10, unit=unit, batch_id='EGG-ABC-00001',
    ).save()


# ── Material Received ──

def test_material_received_denied_without_screen(supplier, generic_item, unit):
    client = authed_client(make_user(screens=''))
    res = client.get('/api/material-received')
    assert res.status_code == 403


def test_material_received_create_generates_prefixed_batch_id(supplier, egg_item, unit):
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/material-received', {
        'date': '2026-07-01',
        'supplier': {'unique_id': supplier.unique_id},
        'item': {'unique_id': egg_item.unique_id},
        'qty': 5,
        'unit': {'unique_id': unit.unique_id},
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['batch_id'] == 'EGG-ABC-00001'
    assert res.data['data']['batch_status'] == 'pending'


def test_material_received_batch_id_prefix_for_non_egg_larvae_item(supplier, generic_item, unit):
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/material-received', {
        'date': '2026-07-01',
        'supplier': {'unique_id': supplier.unique_id},
        'item': {'unique_id': generic_item.unique_id},
        'qty': 5,
        'unit': {'unique_id': unit.unique_id},
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['batch_id'] == 'BAT-ABC-00001'


# ── Culling Process ──

def test_culling_process_auto_calculates_fuel_consumption():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/culling-process', {
        'entry_date': '2026-07-01', 'shift_type': '1', 'cylinder_type': '1', 'cylinder_no': 'C-1',
        'starting_weight': 10, 'ending_weight': 4, 'raw_material_weight': 20, 'final_larvae_weight': 15,
        'work_done': '1',
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['fuel_consumption'] == 6.0


def test_culling_process_compute_fuel():
    """Test that explicit 0.0 fuel_consumption is persisted, not overwritten by auto-calc."""
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/culling-process', {
        'entry_date': '2026-07-01', 'shift_type': '1', 'cylinder_type': '1', 'cylinder_no': 'C-1',
        'starting_weight': 10, 'ending_weight': 4, 'fuel_consumption': 0.0,
        'raw_material_weight': 20, 'final_larvae_weight': 15,
        'work_done': '1',
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['fuel_consumption'] == 0.0


def test_culling_process_others_remarks_required_when_work_done_others():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/culling-process', {
        'entry_date': '2026-07-01', 'shift_type': '1', 'cylinder_type': '1', 'cylinder_no': 'C-1',
        'starting_weight': 10, 'ending_weight': 4, 'raw_material_weight': 20, 'final_larvae_weight': 15,
        'work_done': '3',
    }, format='json')
    assert res.status_code == 400


def test_culling_process_duplicate_shift_cylinder_returns_400():
    client = authed_client(make_user(screens=ALL_SCREENS))
    payload = {
        'entry_date': '2026-07-01', 'shift_type': '1', 'cylinder_type': '1', 'cylinder_no': 'C-1',
        'starting_weight': 10, 'ending_weight': 4, 'raw_material_weight': 20, 'final_larvae_weight': 15,
        'work_done': '1',
    }
    client.post('/api/culling-process', payload, format='json')
    res = client.post('/api/culling-process', payload, format='json')
    assert res.status_code == 400


# ── Oven Process ──

def test_oven_process_auto_calculates_running_hours():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/oven-process', {
        'entry_date': '2026-07-01', 'starting_time': '08:00', 'closing_time': '14:30',
        'diesel_topup': 5, 'raw_larvae_process': 10, 'dried_larvae_production': 3, 'dried_larvae_stock': 3,
        'image_path': 'http://x/oven.jpg',
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['running_hours'] == 6.5
    assert res.data['data']['image_path'] == 'http://x/oven.jpg'


def test_oven_process_running_hours_handles_overnight_shift():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/oven-process', {
        'entry_date': '2026-07-01', 'starting_time': '22:00', 'closing_time': '02:00',
        'diesel_topup': 5, 'raw_larvae_process': 10, 'dried_larvae_production': 3, 'dried_larvae_stock': 3,
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['running_hours'] == 4.0


def test_oven_process_auto_calculates():
    """Test that explicit 0.0 running_hours is persisted, not overwritten by auto-calc."""
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/oven-process', {
        'entry_date': '2026-07-01', 'starting_time': '08:00', 'closing_time': '14:30',
        'running_hours': 0.0,
        'diesel_topup': 5, 'raw_larvae_process': 10, 'dried_larvae_production': 3, 'dried_larvae_stock': 3,
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['running_hours'] == 0.0


# ── Dry Process / Leachate (simple CRUD) ──

def test_dry_process_create_and_list():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/dry-process', {
        'date': '2026-07-01', 'type': '1', 'drying_method': '1', 'quantity': 10,
        'image_path': 'http://x/dry.jpg',
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['image_path'] == 'http://x/dry.jpg'
    assert client.get('/api/dry-process').data['data']['count'] == 1


def test_leachate_create_and_list():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/leachate', {
        'entry_date': '2026-07-01', 'qty_leachate': 3.5, 'image_path': 'http://x/lea.jpg',
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['image_path'] == 'http://x/lea.jpg'
    assert client.get('/api/leachate').data['data']['count'] == 1


# ── Egg Process ──

def test_egg_process_create_generates_entry_no_and_marks_batch_used(batch, supplier, tray):
    staff = make_user(screens=ALL_SCREENS)
    client = authed_client(staff)
    res = client.post('/api/egg-process', {
        'entry_date': '2026-07-01',
        'staff': {'unique_id': staff.unique_id},
        'supplier': {'unique_id': supplier.unique_id},
        'batch': {'unique_id': batch.unique_id},
        'tot_qty': 100,
        'tray_utilized': 1,
        'trays': [{'unique_id': tray.unique_id}],
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['entry_no'] == 'EPC-00001'
    assert MaterialReceived.objects.get(unique_id=batch.unique_id).batch_status == 'used'


def test_egg_process_create_against_used_batch_returns_400(batch, supplier, tray):
    staff = make_user(screens=ALL_SCREENS)
    client = authed_client(staff)
    payload = {
        'entry_date': '2026-07-01',
        'staff': {'unique_id': staff.unique_id},
        'supplier': {'unique_id': supplier.unique_id},
        'batch': {'unique_id': batch.unique_id},
        'tot_qty': 100,
        'tray_utilized': 1,
        'trays': [{'unique_id': tray.unique_id}],
    }
    res = client.post('/api/egg-process', payload, format='json')
    assert res.status_code == 201

    res2 = client.post('/api/egg-process', payload, format='json')
    assert res2.status_code == 400


def test_egg_process_trays_length_mismatch_returns_400(batch, supplier, tray):
    staff = make_user(screens=ALL_SCREENS)
    client = authed_client(staff)
    res = client.post('/api/egg-process', {
        'entry_date': '2026-07-01',
        'staff': {'unique_id': staff.unique_id},
        'supplier': {'unique_id': supplier.unique_id},
        'batch': {'unique_id': batch.unique_id},
        'tot_qty': 100,
        'tray_utilized': 2,
        'trays': [{'unique_id': tray.unique_id}],
    }, format='json')
    assert res.status_code == 400


def test_egg_process_delete_reverts_batch_to_pending(batch, supplier, tray):
    from datetime import date
    staff = make_user(screens=ALL_SCREENS)
    client = authed_client(staff)
    today = date.today().isoformat()
    created = client.post('/api/egg-process', {
        'entry_date': today,
        'staff': {'unique_id': staff.unique_id},
        'supplier': {'unique_id': supplier.unique_id},
        'batch': {'unique_id': batch.unique_id},
        'tot_qty': 100,
        'tray_utilized': 1,
        'trays': [{'unique_id': tray.unique_id}],
    }, format='json')
    egg_id = created.data['data']['unique_id']

    client.delete(f'/api/egg-process/{egg_id}')
    assert MaterialReceived.objects.get(unique_id=batch.unique_id).batch_status == 'pending'


# ── Status Update ──

def test_status_update_create_and_list(batch):
    staff = make_user(screens=ALL_SCREENS)
    client = authed_client(staff)
    res = client.post('/api/status-update', {
        'entry_date': '2026-07-02',
        'staff': {'unique_id': staff.unique_id},
        'batch': {'unique_id': batch.unique_id},
        'day': 1,
        'hatching_status': 'progressing',
    }, format='json')
    assert res.status_code == 201
    assert client.get('/api/status-update').data['data']['count'] == 1


# ── Pit Status ──

def test_pit_status_org_status_1_requires_feed_fields(pit):
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/pit-status', {
        'entry_date': '2026-07-01', 'pit': {'unique_id': pit.unique_id}, 'org_status': '1',
    }, format='json')
    assert res.status_code == 400


def test_pit_status_create_generates_form_batch_id(pit):
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/pit-status', {
        'entry_date': '2026-07-01', 'pit': {'unique_id': pit.unique_id}, 'org_status': '1',
        'feed_qty': 2.5, 'feed_count': 1,
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['form_batch_id'].startswith('PIT-')


def test_pit_status_org_status_2_requires_batch_and_trays(pit, batch, tray):
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/pit-status', {
        'entry_date': '2026-07-01', 'pit': {'unique_id': pit.unique_id}, 'org_status': '2',
        'larvae_qty_in': 5,
    }, format='json')
    assert res.status_code == 400

    res = client.post('/api/pit-status', {
        'entry_date': '2026-07-01', 'pit': {'unique_id': pit.unique_id}, 'org_status': '2',
        'batch': {'unique_id': batch.unique_id}, 'trays': [{'unique_id': tray.unique_id}], 'larvae_qty_in': 5,
    }, format='json')
    assert res.status_code == 201


@pytest.mark.parametrize('org_status,fields,required_field', [
    ('3', {'method': 'Machine'}, 'method'),
    ('4', {'measure_time': 'morning', 'temp_start': 25, 'temp_mid': 26, 'temp_end': 27,
           'humi_start': 50, 'humi_mid': 52, 'humi_end': 54}, 'measure_time'),
    ('5', {'larvae_qty': 5, 'qty_manure_1': 1, 'qty_manure_2': 1, 'qty_manure_3': 1,
           'qty_rejets': 0.5, 'harvest_comp': 'completed'}, 'harvest_comp'),
    ('6', {'larvae_qty': 4, 'qty_manure_1': 0.8, 'qty_manure_2': 0.6, 'qty_rejets': 0.2}, 'qty_rejets'),
    ('7', {'tippi_qty': 3.3}, 'tippi_qty'),
])
def test_pit_status_required_fields_per_org_status(pit, org_status, fields, required_field):
    client = authed_client(make_user(screens=ALL_SCREENS))
    base = {'entry_date': '2026-07-01', 'pit': {'unique_id': pit.unique_id}, 'org_status': org_status}

    res = client.post('/api/pit-status', {**base, **fields}, format='json')
    assert res.status_code == 201

    incomplete = {k: v for k, v in fields.items() if k != required_field}
    res = client.post('/api/pit-status', {**base, **incomplete}, format='json')
    assert res.status_code == 400


def test_pit_status_list_filters_by_org_status(pit):
    client = authed_client(make_user(screens=ALL_SCREENS))
    client.post('/api/pit-status', {
        'entry_date': '2026-07-01', 'pit': {'unique_id': pit.unique_id}, 'org_status': '1',
        'feed_qty': 2.5, 'feed_count': 1,
    }, format='json')
    client.post('/api/pit-status', {
        'entry_date': '2026-07-01', 'pit': {'unique_id': pit.unique_id}, 'org_status': '6',
        'larvae_qty': 3, 'qty_manure_1': 1, 'qty_manure_2': 1, 'qty_rejets': 0.5,
    }, format='json')

    res = client.get('/api/pit-status', {'org_status': '6'})
    assert res.data['data']['count'] == 1
    assert res.data['data']['results'][0]['org_status'] == '6'


# ── FRP Tray Process ──

def test_frp_tray_process_create_and_duplicate_batch_rejected(batch, tray):
    client = authed_client(make_user(screens=ALL_SCREENS))
    payload = {
        'entry_date': '2026-07-01', 'batch': {'unique_id': batch.unique_id}, 'frp_tray_count': 1,
        'trays': [{'unique_id': tray.unique_id}],
    }
    res = client.post('/api/frp-tray-process', payload, format='json')
    assert res.status_code == 201

    res = client.post('/api/frp-tray-process', payload, format='json')
    assert res.status_code == 400


def test_frp_tray_process_trays_length_mismatch(batch, tray):
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/frp-tray-process', {
        'entry_date': '2026-07-01', 'batch': {'unique_id': batch.unique_id}, 'frp_tray_count': 2,
        'trays': [{'unique_id': tray.unique_id}],
    }, format='json')
    assert res.status_code == 400


# ── FRP Status Update ──

def test_frp_status_update_create_and_list(batch, tray):
    staff = make_user(screens=ALL_SCREENS)
    client = authed_client(staff)
    frp = FrpTrayProcess(entry_date='2026-07-01', batch=batch, frp_tray_count=1, trays=[tray]).save()

    res = client.post('/api/frp-status-update', {
        'entry_date': '2026-07-02',
        'staff': {'unique_id': staff.unique_id},
        'batch': {'unique_id': frp.unique_id},
        'day': 1,
        'hatching_status': 'progressing',
        'image_path': 'http://x/frp.jpg',
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['entry_no'] == 'FRP-00001'
    assert res.data['data']['image_path'] == 'http://x/frp.jpg'

    # second create must increment, not repeat/reset — the one bit of novel logic here
    res2 = client.post('/api/frp-status-update', {
        'entry_date': '2026-07-03',
        'staff': {'unique_id': staff.unique_id},
        'batch': {'unique_id': frp.unique_id},
        'day': 2,
    }, format='json')
    assert res2.status_code == 201
    assert res2.data['data']['entry_no'] == 'FRP-00002'
    assert client.get('/api/frp-status-update').data['data']['count'] == 2
