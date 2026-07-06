#!/usr/bin/env python
"""Smoke test: create one record in every Django-backed section and report
PASS/FAIL. Pure HTTP against the running server (no django import needed).
Run while `manage.py runserver` is up:  python smoke_test.py"""
import json
import urllib.request
import urllib.error
import datetime

BASE = 'http://127.0.0.1:8000/api'
TAG = datetime.datetime.now().strftime('%H%M%S')
TODAY = datetime.date.today().isoformat()


def req(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method)
    r.add_header('Content-Type', 'application/json')
    if token:
        r.add_header('Authorization', f'Token {token}')
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status, json.loads(resp.read().decode() or '{}')
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode() or '{}')


def find(obj):
    """Every dict carrying a unique_id, anywhere in the payload."""
    out = []
    if isinstance(obj, dict):
        if 'unique_id' in obj:
            out.append(obj)
        for v in obj.values():
            out += find(v)
    elif isinstance(obj, list):
        for v in obj:
            out += find(v)
    return out


_, login = req('POST', '/auth/login', body={'user_name': 'demo', 'password': 'demo123'})
TOKEN = login['data']['access_token']
STAFF = login['data']['user']['unique_id']


def pick(path, pred=lambda d: True):
    _, j = req('GET', path, TOKEN)
    for d in find(j):
        if pred(d):
            return d['unique_id']
    return None


UNIT = pick('/units')
ITEM = pick('/items')
SUP = pick('/suppliers')
PIT = pick('/pits')
EGG_TRAY = pick('/trays', lambda d: d.get('tray_type') == '1')
FRP_TRAY = pick('/trays', lambda d: d.get('tray_type') == '2')

results = []


def test(name, path, body):
    st, j = req('POST', path, TOKEN, body)
    ok = st in (200, 201) and (j.get('status') != 0)
    results.append((name, ok, '' if ok else f'[{st}] {json.dumps(j)[:220]}'))
    hits = find(j)
    return hits[0]['unique_id'] if ok and hits else None


# ── Settings ──
test('Unit Creation', '/units', {'unit_name': f'Unit-{TAG}'})
test('Item Creation', '/items', {'item_name': f'Item-{TAG}', 'unit': {'unique_id': UNIT}})
test('Tray Creation', '/trays', {'tray_type': '1', 'bin_name': f'TRAY-{TAG}'})
test('Pit Creation', '/pits', {'pit_name': f'Pit-{TAG}', 'length': 12, 'width': 6, 'height': 1.5})
test('Supplier Creation', '/suppliers', {'supplier_name': f'Sup-{TAG}', 'label': 'GF',
                                          'contact_no': '9876543210', 'gst_no': '29ABCDE1234F1Z5'})

# ── Material Received (fresh batches: egg-process consumes one, frp needs a unique one) ──
mr = {'date': TODAY, 'supplier': {'unique_id': SUP}, 'item': {'unique_id': ITEM}, 'unit': {'unique_id': UNIT}}
B_EGG = test('Material Received', '/material-received', {**mr, 'qty': 500})
B_FRP = test('Material Received (frp batch)', '/material-received', {**mr, 'qty': 300})
B_STAT = test('Material Received (status batch)', '/material-received', {**mr, 'qty': 100})

# ── Hatching ──
test('Egg Process', '/egg-process', {'entry_date': TODAY, 'staff': {'unique_id': STAFF},
     'supplier': {'unique_id': SUP}, 'batch': {'unique_id': B_EGG}, 'tot_qty': 100,
     'tray_utilized': 1, 'trays': [{'unique_id': EGG_TRAY}]})
test('Culling Process', '/culling-process', {'entry_date': TODAY, 'shift_type': '1',
     'cylinder_type': '1', 'cylinder_no': f'CYL-{TAG}', 'starting_weight': 50, 'ending_weight': 30,
     'raw_material_weight': 100, 'final_larvae_weight': 40, 'work_done': '1'})

# ── Processing ──
test('Status Update', '/status-update', {'entry_date': TODAY, 'staff': {'unique_id': STAFF},
     'batch': {'unique_id': B_STAT}, 'day': 1, 'hatching_status': 'progressing'})
test('Pit Status', '/pit-status', {'entry_date': TODAY, 'pit': {'unique_id': PIT},
     'org_status': '1', 'feed_qty': 50, 'feed_count': 1000})
FRP = test('FRP Tray Process', '/frp-tray-process', {'entry_date': TODAY, 'batch': {'unique_id': B_FRP},
           'frp_tray_count': 1, 'trays': [{'unique_id': FRP_TRAY}]})
if FRP:
    test('FRP Status Update', '/frp-status-update', {'entry_date': TODAY, 'staff': {'unique_id': STAFF},
         'batch': {'unique_id': FRP}, 'day': 1, 'hatching_status': 'progressing'})

# ── Drying ──
test('Oven Process', '/oven-process', {'entry_date': TODAY, 'starting_time': '08:00',
     'closing_time': '12:00', 'diesel_topup': 10, 'raw_larvae_process': 100,
     'dried_larvae_production': 30, 'dried_larvae_stock': 25})
test('Dry Process', '/dry-process', {'date': TODAY, 'type': '1', 'drying_method': '1', 'quantity': 50, 'qty_manure': 10})
test('Leachate', '/leachate', {'entry_date': TODAY, 'qty_leachate': 15})

# ── Reports ──
test('Measurable', '/measurable', {'entry_date': TODAY, 'location': 'Shed A', 'temp': 30, 'humi': 65})
test('Logsheet', '/logsheet', {'entry_date': TODAY, 'remarks': 'daily log'})
test('DC', '/dc', {'dc_number': f'DC-{TAG}', 'challan_date': TODAY, 'bill_to_company': 'ABC Traders',
     'items': [{'desc': 'Dried Larvae', 'hsn': '2309', 'qty': 100, 'rate': 50}]})

# ── Admin ──
UT = test('User Type', '/user-types', {'type_name': f'Type-{TAG}'})
if UT:
    test('User', '/users', {'user_name': f'test-{TAG}', 'password': 'test123', 'user_type': {'unique_id': UT}})
MS = test('Main Screen', '/main-screens', {'screen_main_name': f'MS-{TAG}', 'icon_name': 'ri-file-list-3-fill'})
if MS:
    test('User Screen', '/screens', {'screen_name': f'Scr-{TAG}', 'folder_name': 'item_creation',
         'main_screen': {'unique_id': MS}})

# ── Report ──
passed = sum(1 for _, ok, _ in results if ok)
print(f'\n=== SMOKE TEST: {passed}/{len(results)} passed ===\n')
for name, ok, err in results:
    print(f'{"PASS" if ok else "FAIL"}  {name}')
    if err:
        print(f'      {err}')
