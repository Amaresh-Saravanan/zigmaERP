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
    ListField,
    ReferenceField,
    StringField,
)

from accounts.models import User
from inventory.models import Item, Pit, Supplier, Tray, Unit

# ── Material Received ──

BATCH_STATUS_CHOICES = (('pending', 'Pending'), ('used', 'Used'))


class MaterialReceived(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    date = DateField(required=True)
    supplier = ReferenceField(Supplier, required=True)
    item = ReferenceField(Item, required=True)
    qty = FloatField(required=True)
    unit = ReferenceField(Unit, required=True)
    invoice_no = StringField(default='')
    invoice_date = DateField(null=True)
    batch_id = StringField(unique=True, required=True)
    batch_status = StringField(choices=BATCH_STATUS_CHOICES, default='pending')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'material_received',
        'indexes': ['unique_id', 'batch_id', '-created_at'],
    }


# ── Culling Process ──

SHIFT_TYPE_CHOICES = (('1', 'Day'), ('2', 'Night'), ('3', 'General'))
CYLINDER_TYPE_CHOICES = (('1', 'O2'), ('2', 'LPG'), ('3', 'Other'))
WORK_DONE_CHOICES = (('1', 'Cutting'), ('2', 'Heating'), ('3', 'Others'))


class CullingProcess(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    shift_type = StringField(required=True, choices=SHIFT_TYPE_CHOICES)
    cylinder_type = StringField(required=True, choices=CYLINDER_TYPE_CHOICES)
    cylinder_no = StringField(required=True)
    starting_weight = FloatField(required=True)
    ending_weight = FloatField(required=True)
    fuel_consumption = FloatField(default=0)  # server-computed if omitted, see serializer
    raw_material_weight = FloatField(required=True)
    final_larvae_weight = FloatField(required=True)
    work_done = StringField(required=True, choices=WORK_DONE_CHOICES)
    others_remarks = StringField(default='')  # required only when work_done == '3'
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'culling_process',
        'indexes': [
            'unique_id',
            '-created_at',
            {'fields': ('entry_date', 'shift_type', 'cylinder_no'), 'unique': True},
        ],
    }


# ── Oven Process ──

class OvenProcess(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    starting_time = StringField(required=True)  # 'HH:MM'
    closing_time = StringField(required=True)  # 'HH:MM'
    running_hours = FloatField(default=0)  # server-computed if omitted, see serializer
    diesel_topup = FloatField(required=True)
    raw_larvae_process = FloatField(required=True)
    dried_larvae_production = FloatField(required=True)
    dried_larvae_stock = FloatField(required=True)
    image_path = StringField(default='')  # URL/path string, matching reports.RejectImage — no binary storage in this app
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'oven_process',
        'indexes': [
            'unique_id',
            '-created_at',
            {'fields': ('entry_date', 'starting_time'), 'unique': True},
        ],
    }


# ── Dry Process ──

DRY_TYPE_CHOICES = (('1', 'In'), ('2', 'Out'))
DRYING_METHOD_CHOICES = (('1', 'Solar'), ('2', 'Electric'))


class DryProcess(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    date = DateField(required=True)
    type = StringField(required=True, choices=DRY_TYPE_CHOICES)
    drying_method = StringField(required=True, choices=DRYING_METHOD_CHOICES)
    quantity = FloatField(required=True)
    qty_manure = FloatField(default=0)
    image_path = StringField(default='')  # URL/path string, matching reports.RejectImage — no binary storage in this app
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'dry_process',
        'indexes': ['unique_id', '-created_at'],
    }


# ── Leachate ──

class Leachate(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    qty_leachate = FloatField(required=True)
    image_path = StringField(default='')  # URL/path string, matching reports.RejectImage — no binary storage in this app
    remarks = StringField(default='')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'leachate',
        'indexes': ['unique_id', '-created_at'],
    }


# ── Egg Process ──

class EggProcessAddon(EmbeddedDocument):
    """Incubation item consumed for this batch (legacy: egg_process_addon table)."""
    item = ReferenceField(Item, required=True)
    qty = FloatField(required=True)


class EggProcess(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    entry_no = StringField(unique=True, required=True)  # auto-generated: EPC-00001, ...
    staff = ReferenceField(User, required=True)
    supplier = ReferenceField(Supplier, required=True)
    batch = ReferenceField(MaterialReceived, required=True)
    tot_qty = FloatField(required=True)
    tray_utilized = IntField(required=True)
    trays = ListField(ReferenceField(Tray), default=list)
    addons = EmbeddedDocumentListField(EggProcessAddon, default=list)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'egg_process',
        'indexes': ['unique_id', 'entry_no', '-created_at'],
    }


# ── Status Update (egg hatching progress log) ──

HATCHING_STATUS_CHOICES = (('pending', 'Pending'), ('progressing', 'Progressing'), ('completed', 'Completed'))


class StatusUpdate(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    staff = ReferenceField(User, required=True)
    batch = ReferenceField(MaterialReceived, required=True)
    day = IntField(required=True)
    hatching_status = StringField(choices=HATCHING_STATUS_CHOICES, default='pending')
    remarks = StringField(default='')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'status_update',
        'indexes': ['unique_id', '-created_at'],
    }


# ── Pit Status (unified: org_status 1-7, '6' = legacy "Screening Process") ──

ORG_STATUS_CHOICES = (
    ('1', 'Organic Waste Added'),
    ('2', 'Baby Larvae Added'),
    ('3', 'Aeration Process'),
    ('4', 'Measurement'),
    ('5', 'Harvest'),
    ('6', 'Vibro Screen'),
    ('7', 'Tippi'),
)
MEASURE_TIME_CHOICES = (('morning', 'Morning'), ('evening', 'Evening'))
HARVEST_COMP_CHOICES = (('pending', 'Pending'), ('completed', 'Completed'))


class PitStatus(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    pit = ReferenceField(Pit, required=True)
    org_status = StringField(required=True, choices=ORG_STATUS_CHOICES)
    notes = StringField(default='')
    form_batch_id = StringField(unique=True, required=True)  # auto-generated: PIT-<suffix>-00001

    # org_status == '1' (Organic Waste Added)
    feed_qty = FloatField(null=True)
    feed_count = IntField(null=True)

    # org_status == '2' (Baby Larvae Added)
    batch = ReferenceField(MaterialReceived, null=True)
    trays = ListField(ReferenceField(Tray), default=list)
    larvae_qty_in = FloatField(null=True)

    # org_status == '3' (Aeration Process)
    method = StringField(default='')

    # org_status == '4' (Measurement)
    measure_time = StringField(choices=MEASURE_TIME_CHOICES, null=True)
    temp_start = FloatField(null=True)
    temp_mid = FloatField(null=True)
    temp_end = FloatField(null=True)
    humi_start = FloatField(null=True)
    humi_mid = FloatField(null=True)
    humi_end = FloatField(null=True)

    # org_status == '5' (Harvest) / '6' (Vibro Screen)
    larvae_qty = FloatField(null=True)
    qty_manure_1 = FloatField(null=True)
    qty_manure_2 = FloatField(null=True)
    qty_manure_3 = FloatField(null=True)  # harvest only
    qty_rejets = FloatField(null=True)
    harvest_comp = StringField(choices=HARVEST_COMP_CHOICES, null=True)

    # org_status == '7' (Tippi)
    tippi_qty = FloatField(null=True)

    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'pit_status',
        'indexes': ['unique_id', 'form_batch_id', 'pit', 'org_status', '-created_at'],
    }


# ── FRP Tray Process ──

FRP_BATCH_STATUS_CHOICES = (('pending', 'Pending'), ('in_process', 'In Process'))


class FrpTrayProcess(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_date = DateField(required=True)
    batch = ReferenceField(MaterialReceived, required=True, unique=True)  # one FRP load per batch
    frp_tray_count = IntField(required=True)
    trays = ListField(ReferenceField(Tray), default=list)
    batch_status = StringField(choices=FRP_BATCH_STATUS_CHOICES, default='pending')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'frp_tray_process',
        'indexes': ['unique_id', '-created_at'],
    }


# ── FRP Status Update ──

class FrpStatusUpdate(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    entry_no = StringField(unique=True, sparse=True)  # auto-generated: FRP-00001, ... (sparse: legacy docs may lack it)
    entry_date = DateField(required=True)
    staff = ReferenceField(User, required=True)
    batch = ReferenceField(FrpTrayProcess, required=True)
    day = IntField(required=True)
    hatching_status = StringField(choices=HATCHING_STATUS_CHOICES, default='pending')
    remarks = StringField(default='')
    image_path = StringField(default='')  # URL/path string, matching reports.RejectImage — no binary storage in this app
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'frp_status_update',
        'indexes': ['unique_id', 'entry_no', '-created_at'],
    }
