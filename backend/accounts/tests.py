"""
Model + API smoke tests — run against mongomock, not the real Atlas cluster in .env.
"""
import mongoengine as me
import mongomock
import pytest
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient

from accounts.models import AuthToken, User, UserType


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


def test_logout_revokes_token(client, active_user):
    login_res = client.post('/api/auth/login', {'user_name': 'admin1', 'password': 'correcthorse'}, format='json')
    token = login_res.data['data']['access_token']
    client.credentials(HTTP_AUTHORIZATION=f'Token {token}')

    logout_res = client.post('/api/auth/logout')
    assert logout_res.status_code == 200

    me_res = client.get('/api/auth/me')
    assert me_res.status_code == 401
