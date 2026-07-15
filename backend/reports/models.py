import uuid

from django.utils import timezone
from mongoengine import (
    BooleanField,
    DateField,
    DateTimeField,
    Document,
    EmbeddedDocument,
    EmbeddedDocumentListField,
    FloatField,
    IntField,
    StringField,
)


# ── Measurable (temperature/humidity readings) ──

class Measurable(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    location = StringField(required=True)
    temp = FloatField(required=True)
    humi = FloatField(required=True)
    remarks = StringField(default='')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'measurable',
        'indexes': ['unique_id', '-created_at'],
    }


# ── Logsheet ──
# ponytail: frontend LogsheetList.jsx is currently a static print template with no
# API calls at all (see generate_logsheet.py) — no real field contract exists yet.
# Minimal model so the route works; extend once the frontend actually consumes it.

class Logsheet(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    remarks = StringField(default='')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'logsheet',
        'indexes': ['unique_id', '-entry_date'],
    }


# ── DC (Delivery Challan) ──
# Field names match frontend/src/pages/DC/DCForm.jsx exactly — that form is the
# only real contract for this module (DCList.jsx: "Backend not connected yet").

class DCItem(EmbeddedDocument):
    desc = StringField(required=True)
    hsn = StringField(default='')
    qty = FloatField(default=0)
    unit = StringField(default='Kgs')
    rate = FloatField(default=0)
    amount = FloatField(default=0)


class DC(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    dc_number = StringField(unique=True, required=True)
    po_date = DateField(null=True)
    dispatch_date = DateField(null=True)
    challan_date = DateField(required=True)
    po_ref = StringField(default='')
    challan_type = StringField(default='Supply of Goods')
    bill_to_company = StringField(required=True)
    bill_to_address = StringField(default='')
    bill_to_gst = StringField(default='')
    tax_rate = FloatField(default=18)
    items = EmbeddedDocumentListField(DCItem)
    grand_total = FloatField(default=0)  # server-computed, see serializer
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'dc',
        'indexes': ['unique_id', 'dc_number', '-created_at'],
    }


# ── Reject (weigh-bridge ticket) ──

class Reject(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    ticket_no = StringField(unique=True, required=True)
    serial_no = StringField(default='')
    vehicle_no = StringField(required=True)
    vendor = StringField(required=True)
    date = DateField(required=True)
    time = StringField(default='')
    empty_weight = FloatField(default=0)
    loaded_weight = FloatField(default=0)
    net_weight = FloatField(default=0)  # server-computed if omitted
    empty_weight_date = DateField(null=True)
    empty_weight_time = StringField(default='')
    load_weight_date = DateField(null=True)
    load_weight_time = StringField(default='')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'reject',
        'indexes': ['unique_id', 'ticket_no', '-created_at'],
    }


# ── Reject Image Upload ──

class RejectImage(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    ticket_no = StringField(required=True)  # ponytail: string ref to Reject.ticket_no, not FK
    image_path = StringField(default='')
    upload_date = DateField(required=True)
    weigh_date = DateField(null=True)
    vehicle_no = StringField(default='')
    net_weight = FloatField(default=0)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'reject_image',
        'indexes': ['unique_id', 'ticket_no', '-created_at'],
    }
