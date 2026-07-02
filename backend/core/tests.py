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


@pytest.fixture
def menu_fixture():
    inventory = MainScreen(screen_main_name='Inventory', icon_name='ri-box-line').save()
    admin = MainScreen(screen_main_name='Admin', icon_name='ri-settings-line').save()

    item_view = Screen(screen_name='Items', folder_name='item_creation', main_screen=inventory, order_no=1).save()
    Screen(screen_name='Suppliers', folder_name='supplier_creation', main_screen=inventory, order_no=2).save()
    Screen(screen_name='Users', folder_name='user', main_screen=admin, order_no=1).save()

    return {'inventory': inventory, 'admin': admin, 'item_view': item_view}


def authed_client(user, password):
    ut_client = APIClient()
    res = ut_client.post('/api/auth/login', {'user_name': user.user_name, 'password': password}, format='json')
    token = res.data['data']['access_token']
    ut_client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
    return ut_client


def test_menu_requires_auth(client):
    res = client.get('/api/menu')
    assert res.status_code == 401


def test_menu_empty_when_user_has_no_main_screens(menu_fixture):
    ut = UserType(type_name='Guest').save()
    user = User(user_name='guest1', password_hash=make_password('pw'), user_type=ut).save()

    res = authed_client(user, 'pw').get('/api/menu')
    assert res.status_code == 200
    assert res.data['data'] == []


def test_menu_returns_only_permitted_main_screens(menu_fixture):
    inventory = menu_fixture['inventory']
    ut = UserType(type_name='InventoryOnly').save()
    user = User(
        user_name='inv1',
        password_hash=make_password('pw'),
        user_type=ut,
        main_screens=inventory.unique_id,
    ).save()

    res = authed_client(user, 'pw').get('/api/menu')
    assert res.status_code == 200
    names = [m['screen_main_name'] for m in res.data['data']]
    assert names == ['Inventory']


def test_menu_filters_sub_screens_to_permitted_set(menu_fixture):
    inventory = menu_fixture['inventory']
    item_view = menu_fixture['item_view']
    ut = UserType(type_name='ItemViewerOnly').save()
    user = User(
        user_name='itemviewer',
        password_hash=make_password('pw'),
        user_type=ut,
        main_screens=inventory.unique_id,
        screens=item_view.unique_id,
    ).save()

    res = authed_client(user, 'pw').get('/api/menu')
    sub_screens = res.data['data'][0]['sub_screens']
    assert [s['folder_name'] for s in sub_screens] == ['item_creation']


def test_menu_excludes_inactive_and_deleted_screens(menu_fixture):
    inventory = menu_fixture['inventory']
    hidden = Screen(
        screen_name='Hidden', folder_name='hidden', main_screen=inventory,
        order_no=3, is_active=False,
    ).save()

    ut = UserType(type_name='Full').save()
    user = User(
        user_name='full1',
        password_hash=make_password('pw'),
        user_type=ut,
        main_screens=inventory.unique_id,
        screens=f"{menu_fixture['item_view'].unique_id},{hidden.unique_id}",
    ).save()

    res = authed_client(user, 'pw').get('/api/menu')
    folder_names = [s['folder_name'] for s in res.data['data'][0]['sub_screens']]
    assert 'hidden' not in folder_names
