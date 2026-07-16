"""
Menu endpoint tests — run against mongomock, not the real Atlas cluster in .env.
"""
import mongoengine as me
import mongomock
import pytest
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient

from accounts.models import AuthToken, User, UserType
from core.models import MainScreen, Screen


@pytest.fixture(autouse=True)
def mongomock_connection():
    me.disconnect()
    me.connect(db='zigma_erp_test', mongo_client_class=mongomock.MongoClient)
    yield
    UserType.drop_collection()
    User.drop_collection()
    AuthToken.drop_collection()
    MainScreen.drop_collection()
    Screen.drop_collection()
    me.disconnect()


@pytest.fixture
def client():
    return APIClient()


def authed_client(user, password):
    ut_client = APIClient()
    res = ut_client.post('/api/auth/login', {'user_name': user.user_name, 'password': password}, format='json')
    token = res.data['data']['access_token']
    ut_client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
    return ut_client


# ── MainScreen / Screen management CRUD (TASK-B07) ──

def manager_user(screens):
    ut = UserType(type_name='Manager').save()
    return User(user_name='manager1', password_hash=make_password('pw'), user_type=ut, screens=screens).save()


def test_main_screen_create_denied_without_screen():
    client = authed_client(manager_user(''), 'pw')
    res = client.post('/api/main-screens', {'screen_main_name': 'Reports'}, format='json')
    assert res.status_code == 403


def test_main_screen_create_and_list():
    client = authed_client(manager_user('main_screen_create,main_screen_view'), 'pw')
    res = client.post('/api/main-screens', {
        'screen_main_name': 'Reports', 'icon_name': 'ri-file-line',
        'screen_type': 'report', 'order_no': 5, 'description': 'All reports',
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['screen_type'] == 'report'
    assert res.data['data']['order_no'] == 5
    assert res.data['data']['description'] == 'All reports'

    list_res = client.get('/api/main-screens')
    assert list_res.data['data']['count'] == 1


def test_screen_create_rejects_unknown_main_screen():
    client = authed_client(manager_user('screen_create'), 'pw')
    res = client.post('/api/screens', {
        'screen_name': 'New Screen',
        'folder_name': 'new_screen',
        'main_screen': {'unique_id': 'ghost'},
    }, format='json')
    assert res.status_code == 400


def test_screen_create_and_update():
    client = authed_client(manager_user('screen_create,screen_view,screen_edit,main_screen_create'), 'pw')
    main = client.post('/api/main-screens', {'screen_main_name': 'Reports'}, format='json').data['data']

    created = client.post('/api/screens', {
        'screen_name': 'Sales Report',
        'folder_name': 'sales_report',
        'main_screen': {'unique_id': main['unique_id']},
        'order_no': 1,
        'description': 'Sales figures',
        'actions': {'add': True, 'update': False, 'list': True, 'delete': False, 'view': True, 'print': False},
    }, format='json')
    assert created.status_code == 201
    assert created.data['data']['description'] == 'Sales figures'
    assert created.data['data']['actions']['add'] is True
    assert created.data['data']['actions']['delete'] is False
    screen_id = created.data['data']['unique_id']

    update_res = client.put(f'/api/screens/{screen_id}', {
        'screen_name': 'Sales Report V2',
        'folder_name': 'sales_report',
        'main_screen': {'unique_id': main['unique_id']},
        'order_no': 2,
    }, format='json')
    assert update_res.status_code == 200
    assert update_res.data['data']['screen_name'] == 'Sales Report V2'
    assert update_res.data['data']['order_no'] == 2


# ── Permission catalog (drives the User Permission admin UI) ──

def test_permission_catalog_requires_auth(client):
    res = client.get('/api/permission-catalog')
    assert res.status_code == 401


def test_permission_catalog_lists_every_registered_module():
    client = authed_client(manager_user(''), 'pw')
    res = client.get('/api/permission-catalog')
    assert res.status_code == 200
    catalog = res.data['data']
    # Spot-check a couple of modules rather than the full ~20-entry list -
    # this just proves the router-derived catalog actually reflects real ViewSets.
    assert catalog['items'] == ['item_create', 'item_delete', 'item_edit', 'item_view']
    assert catalog['user-types'] == ['user_type_create', 'user_type_delete', 'user_type_edit', 'user_type_view']
