import uuid

from django.db import models
from django.utils import timezone
from core.base import BaseModel


def _default_unique_id():
    return str(uuid.uuid4())


# ── Measurable (temperature/humidity readings) ──

class Measurable(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    location = models.CharField(max_length=255)
    temp = models.FloatField()
    humi = models.FloatField()
    remarks = models.CharField(max_length=1024, default='', blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'measurable'


# ── Logsheet ──
# ponytail: frontend LogsheetList.jsx is currently a static print template with no
# API calls at all (see generate_logsheet.py) — no real field contract exists yet.
# Minimal model so the route works; extend once the frontend actually consumes it.

class Logsheet(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    remarks = models.CharField(max_length=1024, default='', blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'logsheet'


# ── DC (Delivery Challan) ──
# Field names match frontend/src/pages/DC/DCForm.jsx exactly — that form is the
# only real contract for this module (DCList.jsx: "Backend not connected yet").

class DC(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    dc_number = models.CharField(max_length=64, unique=True)
    po_date = models.DateField(null=True, blank=True)
    dispatch_date = models.DateField(null=True, blank=True)
    challan_date = models.DateField()
    po_ref = models.CharField(max_length=255, default='', blank=True)
    challan_type = models.CharField(max_length=64, default='Supply of Goods')
    bill_to_company = models.CharField(max_length=255)
    bill_to_address = models.CharField(max_length=1024, default='', blank=True)
    bill_to_gst = models.CharField(max_length=32, default='', blank=True)
    tax_rate = models.FloatField(default=18)
    grand_total = models.FloatField(default=0)  # server-computed, see serializer
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)
    # NOTE: 'items' is a reverse FK relation from DCItem (see below), not a field here.

    class Meta:
        db_table = 'dc'


class DCItem(BaseModel):
    dc = models.ForeignKey(DC, related_name='items', on_delete=models.CASCADE)
    desc = models.CharField(max_length=255)
    hsn = models.CharField(max_length=64, default='', blank=True)
    qty = models.FloatField(default=0)
    unit = models.CharField(max_length=32, default='Kgs')
    rate = models.FloatField(default=0)
    amount = models.FloatField(default=0)

    class Meta:
        db_table = 'dc_item'


# ── Reject (weigh-bridge ticket) ──

class Reject(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    ticket_no = models.CharField(max_length=64, unique=True)
    serial_no = models.CharField(max_length=64, default='', blank=True)
    vehicle_no = models.CharField(max_length=64)
    vendor = models.CharField(max_length=255)
    date = models.DateField()
    time = models.CharField(max_length=32, default='', blank=True)
    empty_weight = models.FloatField(default=0)
    loaded_weight = models.FloatField(default=0)
    net_weight = models.FloatField(default=0)  # server-computed if omitted
    empty_weight_date = models.DateField(null=True, blank=True)
    empty_weight_time = models.CharField(max_length=32, default='', blank=True)
    load_weight_date = models.DateField(null=True, blank=True)
    load_weight_time = models.CharField(max_length=32, default='', blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'reject'


# ── Reject Image Upload ──

class RejectImage(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    ticket_no = models.CharField(max_length=64)  # ponytail: string ref to Reject.ticket_no, not FK
    image_path = models.CharField(max_length=1024, default='', blank=True)
    upload_date = models.DateField()
    weigh_date = models.DateField(null=True, blank=True)
    vehicle_no = models.CharField(max_length=64, default='', blank=True)
    net_weight = models.FloatField(default=0)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'reject_image'
