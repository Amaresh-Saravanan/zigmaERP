"""
Model + API smoke tests — run against mongomock, not the real Atlas cluster in .env.
"""
import mongoengine as me
import mongomock
import pytest
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.test import APIClient, APIRequestFactory

from accounts.models import AuthToken, User, UserType
from accounts.permissions import HasScreenPermission


@pytest.fixture(autouse=True)
def mongomock_connection():
    me.disconnect()
    me.connect(db='zigma_erp_test', mongo_client_class=mongomock.MongoClient)
    yield
    UserType.drop_collection()
    User.drop_collection()
    AuthToken.drop_collection()
    me.disconnect()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def active_user():
    ut = UserType(type_name='Admin').save()
    return User(
        user_name='admin1',
        password_hash=make_password('correcthorse'),
        user_type=ut,
    ).save()


def test_user_type_gets_unique_id():
    ut = UserType(type_name='Admin').save()
    assert ut.unique_id
    assert UserType.objects.get(type_name='Admin').unique_id == ut.unique_id


def test_user_requires_type_and_defaults_active_not_deleted():
    ut = UserType(type_name='Operator').save()
    user = User(user_name='operator1', password_hash='hashed', user_type=ut).save()

    assert user.unique_id
    assert user.is_active is True
    assert user.is_deleted is False
    assert User.objects.get(user_name='operator1').user_type.type_name == 'Operator'


def test_user_name_must_be_unique():
    ut = UserType(type_name='Admin').save()
    User(user_name='dupe', password_hash='x', user_type=ut).save()
    with pytest.raises(me.NotUniqueError):
        User(user_name='dupe', password_hash='y', user_type=ut).save()


def test_user_type_get_or_create_pending_is_idempotent():
    first = UserType.get_or_create_pending()
    second = UserType.get_or_create_pending()

    assert first.id == second.id
    assert first.type_name == 'Pending Signup'
    assert first.screens == ''
    assert first.main_screens == ''
    assert UserType.objects(type_name='Pending Signup').count() == 1


from accounts.serializers import SignupSerializer


def test_signup_serializer_creates_inactive_pending_user():
    serializer = SignupSerializer(data={
        'user_name': 'newuser1',
        'user_email': 'newuser1@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'New',
        'last_name': 'User',
    })
    assert serializer.is_valid(), serializer.errors

    user = serializer.save()

    assert user.is_active is False
    assert user.user_type.type_name == 'Pending Signup'
    assert check_password('Str0ng!Pass', user.password_hash)


def test_signup_serializer_rejects_duplicate_username():
    UserType.objects.create(type_name='Admin')
    User(user_name='taken', password_hash='x', user_type=UserType.objects.first()).save()

    serializer = SignupSerializer(data={
        'user_name': 'taken',
        'user_email': 'unique@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'A',
        'last_name': 'B',
    })
    assert not serializer.is_valid()
    assert 'user_name' in serializer.errors


def test_signup_serializer_rejects_duplicate_email():
    UserType.objects.create(type_name='Admin')
    User(user_name='other', password_hash='x', user_type=UserType.objects.first(),
         user_email='dupe@example.com').save()

    serializer = SignupSerializer(data={
        'user_name': 'brandnew',
        'user_email': 'dupe@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'A',
        'last_name': 'B',
    })
    assert not serializer.is_valid()
    assert 'user_email' in serializer.errors


def test_signup_serializer_rejects_weak_password():
    serializer = SignupSerializer(data={
        'user_name': 'weakpwuser',
        'user_email': 'weak@example.com',
        'password': 'weakpass',
        'confirm_password': 'weakpass',
        'first_name': 'Weak',
        'last_name': 'Pw',
    })
    assert not serializer.is_valid()
    assert 'password' in serializer.errors


def test_signup_serializer_rejects_password_mismatch():
    serializer = SignupSerializer(data={
        'user_name': 'mismatchuser',
        'user_email': 'mismatch@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Different!Pass1',
        'first_name': 'Mis',
        'last_name': 'Match',
    })
    assert not serializer.is_valid()
    assert 'confirm_password' in serializer.errors


def test_signup_serializer_rejects_invalid_username_characters():
    serializer = SignupSerializer(data={
        'user_name': 'bad name!',
        'user_email': 'badname@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'Bad',
        'last_name': 'Name',
    })
    assert not serializer.is_valid()
    assert 'user_name' in serializer.errors


def test_login_success_returns_token_and_user(client, active_user):
    res = client.post('/api/auth/login', {'user_name': 'admin1', 'password': 'correcthorse'}, format='json')
    assert res.status_code == 200
    assert res.data['status'] == 1
    assert res.data['msg'] == 'success_login'
    assert res.data['data']['access_token']
    assert res.data['data']['user']['user_name'] == 'admin1'


def test_login_wrong_password_rejected(client, active_user):
    res = client.post('/api/auth/login', {'user_name': 'admin1', 'password': 'wrong'}, format='json')
    assert res.status_code == 401
    assert res.data['status'] == 0
    assert res.data['msg'] == 'incorrect'


def test_login_unknown_user_rejected(client):
    res = client.post('/api/auth/login', {'user_name': 'ghost', 'password': 'whatever'}, format='json')
    assert res.status_code == 401
    assert res.data['msg'] == 'incorrect'


def test_login_reuses_existing_token(client, active_user):
    first = client.post('/api/auth/login', {'user_name': 'admin1', 'password': 'correcthorse'}, format='json')
    second = client.post('/api/auth/login', {'user_name': 'admin1', 'password': 'correcthorse'}, format='json')
    assert first.data['data']['access_token'] == second.data['data']['access_token']
    assert AuthToken.objects(user=active_user).count() == 1


def test_me_requires_valid_token(client, active_user):
    res = client.get('/api/auth/me')
    assert res.status_code == 401

    login_res = client.post('/api/auth/login', {'user_name': 'admin1', 'password': 'correcthorse'}, format='json')
    token = login_res.data['data']['access_token']

    client.credentials(HTTP_AUTHORIZATION=f'Token {token}')
    res = client.get('/api/auth/me')
    assert res.status_code == 200
    assert res.data['data']['user_name'] == 'admin1'


def test_me_rejects_malformed_authorization_header(client, active_user):
    client.credentials(HTTP_AUTHORIZATION='Token')  # missing the key half
    res = client.get('/api/auth/me')
    assert res.status_code == 401

    client.credentials(HTTP_AUTHORIZATION='Token abc extra-part')  # too many parts
    res = client.get('/api/auth/me')
    assert res.status_code == 401

    client.credentials(HTTP_AUTHORIZATION='Token not-a-real-key')
    res = client.get('/api/auth/me')
    assert res.status_code == 401


def test_logout_revokes_token(client, active_user):
    login_res = client.post('/api/auth/login', {'user_name': 'admin1', 'password': 'correcthorse'}, format='json')
    token = login_res.data['data']['access_token']
    client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

    logout_res = client.post('/api/auth/logout')
    assert logout_res.status_code == 200

    me_res = client.get('/api/auth/me')
    assert me_res.status_code == 401


def _fake_request(user):
    request = APIRequestFactory().get('/')
    request.user = user
    return request


def test_screen_permission_denies_user_without_screen(active_user):
    view = type('View', (), {'required_screen': 'item_delete'})()
    assert HasScreenPermission().has_permission(_fake_request(active_user), view) is False


def test_screen_permission_allows_user_with_screen(active_user):
    active_user.screens = 'item_view,item_create'
    active_user.save()
    view = type('View', (), {'required_screen': 'item_create'})()
    assert HasScreenPermission().has_permission(_fake_request(active_user), view) is True


def test_screen_permission_action_map_for_viewsets(active_user):
    active_user.screens = 'item_view'
    active_user.save()
    view = type('View', (), {
        'required_screens': {'list': 'item_view', 'destroy': 'item_delete'},
        'action': 'destroy',
    })()
    assert HasScreenPermission().has_permission(_fake_request(active_user), view) is False

    view.action = 'list'
    assert HasScreenPermission().has_permission(_fake_request(active_user), view) is True


def test_screen_permission_open_when_view_declares_nothing(active_user):
    view = type('View', (), {})()
    assert HasScreenPermission().has_permission(_fake_request(active_user), view) is True


# ── UserType / User management CRUD (TASK-B07) ──

def authed_client(user):
    client = APIClient()
    res = client.post('/api/auth/login', {'user_name': user.user_name, 'password': 'correcthorse'}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Token {res.data['data']['access_token']}")
    return client


def manager_user(screens):
    ut = UserType(type_name='Manager').save()
    return User(
        user_name='manager1',
        password_hash=make_password('correcthorse'),
        user_type=ut,
        screens=screens,
    ).save()


def test_user_type_create_and_list():
    client = authed_client(manager_user('user_type_create,user_type_view'))
    res = client.post('/api/user-types', {'type_name': 'Operator'}, format='json')
    assert res.status_code == 201

    list_res = client.get('/api/user-types')
    # includes the 'Manager' type created by the fixture too
    names = [t['type_name'] for t in list_res.data['results']]
    assert 'Operator' in names


def test_user_create_hashes_password():
    manager = manager_user('user_create,user_view')
    client = authed_client(manager)

    res = client.post('/api/users', {
        'user_name': 'newhire',
        'password': 'plaintext123',
        'first_name': 'New',
        'last_name': 'Hire',
        'user_type': {'unique_id': manager.user_type.unique_id},
    }, format='json')

    assert res.status_code == 201
    assert 'password' not in res.data['data']

    created = User.objects.get(user_name='newhire')
    assert created.password_hash != 'plaintext123'
    assert check_password('plaintext123', created.password_hash)


def test_user_create_requires_password():
    manager = manager_user('user_create')
    client = authed_client(manager)
    res = client.post('/api/users', {
        'user_name': 'newhire',
        'user_type': {'unique_id': manager.user_type.unique_id},
    }, format='json')
    assert res.status_code == 400


def test_user_update_without_password_keeps_existing_hash():
    manager = manager_user('user_create,user_edit')
    client = authed_client(manager)

    created = client.post('/api/users', {
        'user_name': 'newhire',
        'password': 'original-pass',
        'user_type': {'unique_id': manager.user_type.unique_id},
    }, format='json')
    user_id = created.data['data']['unique_id']
    original_hash = User.objects.get(unique_id=user_id).password_hash

    update_res = client.put(f'/api/users/{user_id}', {
        'user_name': 'newhire',
        'first_name': 'Updated',
        'user_type': {'unique_id': manager.user_type.unique_id},
    }, format='json')

    assert update_res.status_code == 200
    assert update_res.data['data']['first_name'] == 'Updated'
    assert User.objects.get(unique_id=user_id).password_hash == original_hash


def test_user_create_rejects_unknown_user_type():
    manager = manager_user('user_create')
    client = authed_client(manager)
    res = client.post('/api/users', {
        'user_name': 'newhire',
        'password': 'pw',
        'user_type': {'unique_id': 'ghost'},
    }, format='json')
    assert res.status_code == 400


def test_user_delete_is_soft_and_revokes_access():
    manager = manager_user('user_create,user_delete,user_view')
    client = authed_client(manager)

    created = client.post('/api/users', {
        'user_name': 'newhire',
        'password': 'pw12345',
        'user_type': {'unique_id': manager.user_type.unique_id},
    }, format='json')
    new_user = User.objects.get(unique_id=created.data['data']['unique_id'])

    new_client = authed_client_for_password(new_user, 'pw12345')
    assert new_client.get('/api/auth/me').status_code == 200

    client.delete(f"/api/users/{created.data['data']['unique_id']}")
    assert User.objects.get(unique_id=new_user.unique_id).is_deleted is True

    # Existing token for the now-deleted user must stop working.
    assert new_client.get('/api/auth/me').status_code == 401


def authed_client_for_password(user, password):
    client = APIClient()
    res = client.post('/api/auth/login', {'user_name': user.user_name, 'password': password}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Token {res.data['data']['access_token']}")
    return client


def test_user_type_permission_fields_round_trip():
    manager = manager_user('user_type_create,user_type_edit,user_type_view')
    client = authed_client(manager)

    created = client.post('/api/user-types', {
        'type_name': 'Operator',
        'main_screens': 'main1,main2',
        'screens': 'item_view,item_create',
    }, format='json')
    assert created.status_code == 201
    assert created.data['data']['screens'] == 'item_view,item_create'

    ut_id = created.data['data']['unique_id']
    updated = client.put(f'/api/user-types/{ut_id}', {
        'type_name': 'Operator',
        'main_screens': 'main1',
        'screens': 'item_view',
    }, format='json')
    assert updated.status_code == 200
    assert updated.data['data']['screens'] == 'item_view'
    assert UserType.objects.get(unique_id=ut_id).main_screens == 'main1'


def test_user_inherits_screens_from_user_type_when_not_specified():
    manager = manager_user('user_create,user_type_create')
    client = authed_client(manager)

    role = UserType(type_name='Operator', screens='item_view,item_create', main_screens='main1').save()

    created = client.post('/api/users', {
        'user_name': 'roleuser',
        'password': 'pw12345',
        'user_type': {'unique_id': role.unique_id},
    }, format='json')

    assert created.status_code == 201
    new_user = User.objects.get(unique_id=created.data['data']['unique_id'])
    assert new_user.screens == 'item_view,item_create'
    assert new_user.main_screens == 'main1'


def test_user_explicit_screens_override_user_type_defaults():
    manager = manager_user('user_create,user_type_create')
    client = authed_client(manager)

    role = UserType(type_name='Operator', screens='item_view,item_create', main_screens='main1').save()

    created = client.post('/api/users', {
        'user_name': 'roleuser2',
        'password': 'pw12345',
        'user_type': {'unique_id': role.unique_id},
        'screens': 'unit_view',
    }, format='json')

    assert created.status_code == 201
    new_user = User.objects.get(unique_id=created.data['data']['unique_id'])
    assert new_user.screens == 'unit_view'
