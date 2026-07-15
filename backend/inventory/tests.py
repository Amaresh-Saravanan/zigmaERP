"""
Item/Unit CRUD tests — run against mongomock, not the real Atlas cluster in .env.
"""
import time
import mongoengine as me
import mongomock
import pytest
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient

from accounts.models import AuthToken, User, UserType
from inventory.models import Item, Pit, Supplier, Tray, Unit


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
    me.disconnect()


def make_user(screens=''):
    ut = UserType(type_name='Tester').save()
    return User(user_name='tester', password_hash=make_password('pw'), user_type=ut, screens=screens).save()


def authed_client(user):
    client = APIClient()
    res = client.post('/api/auth/login', {'user_name': user.user_name, 'password': 'pw'}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Token {res.data['data']['access_token']}")
    return client


# ── Unit ──

def test_unit_list_denied_without_screen():
    client = authed_client(make_user(screens=''))
    res = client.get('/api/units')
    assert res.status_code == 403


def test_unit_create_and_list_with_screens():
    client = authed_client(make_user(screens='unit_view,unit_create'))

    create_res = client.post('/api/units', {'unit_name': 'Kilogram'}, format='json')
    assert create_res.status_code == 201
    assert create_res.data['data']['unit_name'] == 'Kilogram'

    list_res = client.get('/api/units')
    assert list_res.status_code == 200
    assert list_res.data['data']['count'] == 1


def test_unit_create_denied_without_create_screen():
    client = authed_client(make_user(screens='unit_view'))
    res = client.post('/api/units', {'unit_name': 'Kilogram'}, format='json')
    assert res.status_code == 403


def test_unit_name_duplicate_returns_400():
    client = authed_client(make_user(screens='unit_create'))
    client.post('/api/units', {'unit_name': 'Kilogram'}, format='json')
    res = client.post('/api/units', {'unit_name': 'Kilogram'}, format='json')
    assert res.status_code == 400
    assert res.data['status'] == 0


# ── Item ──

@pytest.fixture
def unit():
    return Unit(unit_name='Kilogram').save()


def test_item_create_auto_generates_sequential_codes(unit):
    client = authed_client(make_user(screens='item_create'))

    res1 = client.post('/api/items', {'item_name': 'Widget', 'unit': {'unique_id': unit.unique_id}}, format='json')
    res2 = client.post('/api/items', {'item_name': 'Gadget', 'unit': {'unique_id': unit.unique_id}}, format='json')

    assert res1.data['data']['item_code'] == 'IT-001'
    assert res2.data['data']['item_code'] == 'IT-002'


def test_item_create_rejects_unknown_unit(unit):
    client = authed_client(make_user(screens='item_create'))
    res = client.post('/api/items', {'item_name': 'Widget', 'unit': {'unique_id': 'ghost'}}, format='json')
    assert res.status_code == 400


def test_item_retrieve_update_delete_lifecycle(unit):
    client = authed_client(make_user(screens='item_create,item_view,item_edit,item_delete'))

    created = client.post('/api/items', {'item_name': 'Widget', 'unit': {'unique_id': unit.unique_id}}, format='json')
    item_id = created.data['data']['unique_id']

    get_res = client.get(f'/api/items/{item_id}')
    assert get_res.status_code == 200
    assert get_res.data['data']['item_name'] == 'Widget'

    update_res = client.put(
        f'/api/items/{item_id}',
        {'item_name': 'Widget V2', 'unit': {'unique_id': unit.unique_id}, 'is_active': False},
        format='json',
    )
    assert update_res.status_code == 200
    assert update_res.data['data']['item_name'] == 'Widget V2'
    assert update_res.data['data']['is_active'] is False

    delete_res = client.delete(f'/api/items/{item_id}')
    assert delete_res.status_code == 200

    # Soft-deleted: no longer visible via list/retrieve
    assert client.get(f'/api/items/{item_id}').status_code == 404
    assert Item.objects.get(unique_id=item_id).is_deleted is True


def test_item_retrieve_missing_returns_404(unit):
    client = authed_client(make_user(screens='item_view'))
    res = client.get('/api/items/does-not-exist')
    assert res.status_code == 404


def test_item_search_filters_by_name(unit):
    client = authed_client(make_user(screens='item_create,item_view'))
    client.post('/api/items', {'item_name': 'Widget', 'unit': {'unique_id': unit.unique_id}}, format='json')
    client.post('/api/items', {'item_name': 'Gadget', 'unit': {'unique_id': unit.unique_id}}, format='json')

    res = client.get('/api/items', {'search': 'widg'})
    assert res.data['data']['count'] == 1
    assert res.data['data']['results'][0]['item_name'] == 'Widget'


def test_item_update():
    """Test that updated_at is set on every item update."""
    client = authed_client(make_user(screens='item_create,item_view,item_edit'))
    unit = Unit(unit_name='Kilogram').save()

    created = client.post('/api/items', {'item_name': 'Widget', 'unit': {'unique_id': unit.unique_id}}, format='json')
    item_id = created.data['data']['unique_id']

    before = Item.objects.get(unique_id=item_id).updated_at

    # Sleep to ensure time delta is measurable
    time.sleep(0.01)

    client.put(
        f'/api/items/{item_id}',
        {'item_name': 'Widget V2', 'unit': {'unique_id': unit.unique_id}},
        format='json',
    )

    after = Item.objects.get(unique_id=item_id).updated_at
    assert after > before, 'updated_at should be set to current time on update'


# ── Tray ──

def test_tray_create_rejects_invalid_type():
    client = authed_client(make_user(screens='tray_create'))
    res = client.post('/api/trays', {'tray_type': '9', 'bin_name': 'Bin A'}, format='json')
    assert res.status_code == 400


def test_tray_create_and_list():
    client = authed_client(make_user(screens='tray_create,tray_view'))
    res = client.post('/api/trays', {'tray_type': '1', 'bin_name': 'Bin A'}, format='json')
    assert res.status_code == 201
    assert res.data['data']['tray_type'] == '1'

    list_res = client.get('/api/trays')
    assert list_res.data['data']['count'] == 1


# ── Pit ──

def test_pit_volume_is_server_computed_and_ignores_client_value():
    client = authed_client(make_user(screens='pit_create'))
    res = client.post(
        '/api/pits',
        {'pit_name': 'Pit 1', 'length': 2, 'width': 3, 'height': 4, 'volume': 999},
        format='json',
    )
    assert res.status_code == 201
    assert res.data['data']['volume'] == 24.0


def test_pit_name_must_be_unique():
    client = authed_client(make_user(screens='pit_create'))
    client.post('/api/pits', {'pit_name': 'Pit 1', 'length': 1, 'width': 1, 'height': 1}, format='json')
    res = client.post('/api/pits', {'pit_name': 'Pit 1', 'length': 1, 'width': 1, 'height': 1}, format='json')
    assert res.status_code == 400


def test_pit_dimensions_reject_negative_values():
    """Test that negative pit dimensions are rejected with 400 validation error."""
    client = authed_client(make_user(screens='pit_create'))

    # Negative length
    res = client.post('/api/pits', {'pit_name': 'Bad Pit 1', 'length': -1, 'width': 1, 'height': 1}, format='json')
    assert res.status_code == 400

    # Negative width
    res = client.post('/api/pits', {'pit_name': 'Bad Pit 2', 'length': 1, 'width': -1, 'height': 1}, format='json')
    assert res.status_code == 400

    # Negative height
    res = client.post('/api/pits', {'pit_name': 'Bad Pit 3', 'length': 1, 'width': 1, 'height': -1}, format='json')
    assert res.status_code == 400


# ── Supplier ──

def test_supplier_create_normalizes_label_contact_and_gst():
    client = authed_client(make_user(screens='supplier_create'))
    res = client.post('/api/suppliers', {
        'supplier_name': 'Acme Co',
        'label': 'a1b2c',
        'contact_no': '(98) 765-4321 0',
        'gst_no': '33aaaaa0000a1z5',
    }, format='json')

    assert res.status_code == 201
    assert res.data['data']['label'] == 'ABC'
    assert res.data['data']['contact_no'] == '9876543210'
    assert res.data['data']['gst_no'] == '33AAAAA0000A1Z5'


def test_supplier_delete_is_soft():
    client = authed_client(make_user(screens='supplier_create,supplier_delete,supplier_view'))
    created = client.post('/api/suppliers', {'supplier_name': 'Acme Co'}, format='json')
    supplier_id = created.data['data']['unique_id']

    client.delete(f'/api/suppliers/{supplier_id}')
    assert Supplier.objects.get(unique_id=supplier_id).is_deleted is True
    assert client.get(f'/api/suppliers/{supplier_id}').status_code == 404
