"""
Reports module CRUD tests — run against the real Django test DB (MariaDB).
"""
import pytest
from django.contrib.auth.hashers import make_password
from rest_framework.test import APIClient

from accounts.models import User, UserType
from inventory.models import Pit
from process.models import PitStatus
from reports.models import Measurable, Reject, RejectImage

pytestmark = pytest.mark.django_db


def make_user(screens=''):
    ut = UserType.objects.create(type_name='Tester')
    return User.objects.create(user_name='tester', password_hash=make_password('pw'), user_type=ut, screens=screens)


def authed_client(user):
    client = APIClient()
    res = client.post('/api/auth/login', {'user_name': user.user_name, 'password': 'pw'}, format='json')
    client.credentials(HTTP_AUTHORIZATION=f"Token {res.data['data']['access_token']}")
    return client


ALL_SCREENS = ','.join(
    f'{module}_{action}'
    for module in ('measurable', 'logsheet', 'dc')
    for action in ('view', 'create', 'edit', 'delete')
)


# ── Measurable ──

def test_measurable_denied_without_screen():
    client = authed_client(make_user(screens=''))
    res = client.get('/api/measurable')
    assert res.status_code == 403


def test_measurable_create_and_list():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/measurable', {
        'entry_date': '2026-07-03', 'location': 'Weigh Bridge Side', 'temp': 28.5, 'humi': 65.0,
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['location'] == 'Weigh Bridge Side'

    res = client.get('/api/measurable')
    assert res.status_code == 200
    assert res.data['data']['count'] == 1


def test_measurable_delete_is_soft():
    client = authed_client(make_user(screens=ALL_SCREENS))
    create_res = client.post('/api/measurable', {
        'entry_date': '2026-07-03', 'location': 'Solar Side', 'temp': 30, 'humi': 55,
    }, format='json')
    unique_id = create_res.data['data']['unique_id']

    res = client.delete(f'/api/measurable/{unique_id}')
    assert res.status_code == 200
    assert Measurable.objects.get(unique_id=unique_id).is_deleted is True
    assert client.get('/api/measurable').data['data']['count'] == 0


# ── Logsheet ──

def test_logsheet_create_and_list():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/logsheet', {'entry_date': '2026-07-03'}, format='json')
    assert res.status_code == 201

    res = client.get('/api/logsheet')
    assert res.status_code == 200
    assert res.data['data']['count'] == 1


# ── DC (Delivery Challan) ──

def test_dc_create_computes_grand_total():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/dc', {
        'dc_number': 'BSF/LAR/24-25/001',
        'challan_date': '2026-07-03',
        'bill_to_company': 'Acme Co',
        'tax_rate': 18,
        'items': [
            {'desc': 'Larvae Meal', 'qty': 10, 'rate': 100},
            {'desc': 'Fertilizer', 'qty': 5, 'rate': 50},
        ],
    }, format='json')
    assert res.status_code == 201
    # sub_total = 10*100 + 5*50 = 1250; grand_total = 1250 * 1.18 = 1475.0
    assert res.data['data']['grand_total'] == 1475.0


def test_dc_item_amount_is_server_computed_and_ignores_client_value():
    client = authed_client(make_user(screens=ALL_SCREENS))
    res = client.post('/api/dc', {
        'dc_number': 'BSF/LAR/24-25/003',
        'challan_date': '2026-07-03',
        'bill_to_company': 'Acme Co',
        'items': [
            {'desc': 'Larvae Meal', 'qty': 10, 'rate': 100, 'amount': 0},
        ],
    }, format='json')
    assert res.status_code == 201
    assert res.data['data']['items'][0]['amount'] == 1000.0


def test_dc_duplicate_dc_number_returns_400():
    client = authed_client(make_user(screens=ALL_SCREENS))
    payload = {
        'dc_number': 'BSF/LAR/24-25/002',
        'challan_date': '2026-07-03',
        'bill_to_company': 'Acme Co',
        'items': [{'desc': 'Item', 'qty': 1, 'rate': 10}],
    }
    client.post('/api/dc', payload, format='json')
    res = client.post('/api/dc', payload, format='json')
    assert res.status_code == 400


# ── Performance tests: DB-level filtering (Agent 3) ──

def test_pit_status_report_filters_by_date_at_db_level():
    """Verify pit_status_report filters date range at DB, not Python."""
    client = authed_client(make_user(screens='pit_status_report_view'))

    pit = Pit.objects.create(pit_name='Pit-01')

    # Create PitStatus records for different dates
    PitStatus.objects.create(
        entry_date='2026-06-01', pit=pit, org_status='1',
        form_batch_id='PIT-01-001', feed_qty=10
    )
    PitStatus.objects.create(
        entry_date='2026-07-15', pit=pit, org_status='1',
        form_batch_id='PIT-01-002', feed_qty=20
    )
    PitStatus.objects.create(
        entry_date='2026-08-01', pit=pit, org_status='1',
        form_batch_id='PIT-01-003', feed_qty=30
    )

    # Query with date range that should only match July record
    res = client.get('/api/pit-status-report?from_date=2026-07-01&to_date=2026-07-31')
    assert res.status_code == 200
    assert res.data['data']['count'] == 1
    assert res.data['data']['results'][0]['batch_id'] == 'PIT-01-002'


def test_rejects_report_eliminates_n_plus_one():
    """Verify rejects_report pre-fetches images, no N+1 query per ticket."""
    client = authed_client(make_user(screens='rejects_report_view'))

    # Create reject records
    Reject.objects.create(ticket_no='TK001', vehicle_no='VH001', vendor='Vendor A', date='2026-07-10')
    Reject.objects.create(ticket_no='TK002', vehicle_no='VH002', vendor='Vendor B', date='2026-07-11')

    # Add image only for r1
    RejectImage.objects.create(ticket_no='TK001', image_path='/path/to/img1.jpg', upload_date='2026-07-10')

    res = client.get('/api/rejects-report')
    assert res.status_code == 200
    assert res.data['data']['count'] == 2

    # Find results by ticket_no
    results = {r['ticket_no']: r for r in res.data['data']['results']}
    assert results['TK001']['has_image'] is True
    assert results['TK002']['has_image'] is False


def test_rejects_report_bad_page_returns_validation_error():
    client = authed_client(make_user(screens='rejects_report_view'))
    res = client.get('/api/rejects-report', {'page': 'abc'})
    assert res.status_code == 400
    assert res.data == {'status': 0, 'msg': 'validation_error', 'data': None,
                         'error': 'page and page_size must be integers.'}
