import uuid

from django.db import models
from django.utils import timezone
from core.base import BaseModel

from accounts.models import User
from inventory.models import Item, Pit, Supplier, Tray, Unit


def _default_unique_id():
    return str(uuid.uuid4())


# ── Material Received ──

BATCH_STATUS_CHOICES = (('pending', 'Pending'), ('used', 'Used'), ('closed', 'Closed'))


class MaterialReceived(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    date = models.DateField()
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    item = models.ForeignKey(Item, on_delete=models.PROTECT)
    qty = models.FloatField()
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT)
    invoice_no = models.CharField(max_length=255, default='', blank=True)
    invoice_date = models.DateField(null=True, blank=True)
    batch_id = models.CharField(max_length=64, unique=True)
    batch_status = models.CharField(max_length=32, choices=BATCH_STATUS_CHOICES, default='pending')
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['-created_at'])]


# ── Culling Process ──

SHIFT_TYPE_CHOICES = (('1', 'Day'), ('2', 'Night'), ('3', 'General'))
CYLINDER_TYPE_CHOICES = (('1', 'O2'), ('2', 'LPG'), ('3', 'Other'))
WORK_DONE_CHOICES = (('1', 'Cutting'), ('2', 'Heating'), ('3', 'Others'))


class CullingProcess(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    shift_type = models.CharField(max_length=32, choices=SHIFT_TYPE_CHOICES)
    cylinder_type = models.CharField(max_length=32, choices=CYLINDER_TYPE_CHOICES)
    cylinder_no = models.CharField(max_length=255)
    starting_weight = models.FloatField()
    ending_weight = models.FloatField()
    fuel_consumption = models.FloatField(default=0)  # server-computed if omitted, see serializer
    raw_material_weight = models.FloatField()
    final_larvae_weight = models.FloatField()
    work_done = models.CharField(max_length=32, choices=WORK_DONE_CHOICES)
    others_remarks = models.TextField(default='', blank=True)  # required only when work_done == '3'
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['-created_at'])]
        constraints = [
            models.UniqueConstraint(
                fields=['entry_date', 'shift_type', 'cylinder_no'],
                name='cullingprocess_unique_entry_date_shift_type_cylinder_no',
            ),
        ]


# ── Oven Process ──

class OvenProcess(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    starting_time = models.CharField(max_length=8)  # 'HH:MM'
    closing_time = models.CharField(max_length=8)  # 'HH:MM'
    running_hours = models.FloatField(default=0)  # server-computed if omitted, see serializer
    diesel_topup = models.FloatField()
    raw_larvae_process = models.FloatField()
    dried_larvae_production = models.FloatField()
    dried_larvae_stock = models.FloatField()
    image_path = models.CharField(max_length=255, default='', blank=True)  # URL/path string, matching reports.RejectImage — no binary storage in this app
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['-created_at'])]
        constraints = [
            models.UniqueConstraint(
                fields=['entry_date', 'starting_time'],
                name='ovenprocess_unique_entry_date_starting_time',
            ),
        ]


# ── Dry Process ──

DRY_TYPE_CHOICES = (('1', 'In'), ('2', 'Out'))
DRYING_METHOD_CHOICES = (('1', 'Solar'), ('2', 'Electric'))


class DryProcess(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    date = models.DateField()
    type = models.CharField(max_length=32, choices=DRY_TYPE_CHOICES)
    drying_method = models.CharField(max_length=32, choices=DRYING_METHOD_CHOICES)
    quantity = models.FloatField()
    qty_manure = models.FloatField(default=0)
    image_path = models.CharField(max_length=255, default='', blank=True)  # URL/path string, matching reports.RejectImage — no binary storage in this app
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['-created_at'])]


# ── Leachate ──

class Leachate(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    qty_leachate = models.FloatField()
    image_path = models.CharField(max_length=255, default='', blank=True)  # URL/path string, matching reports.RejectImage — no binary storage in this app
    remarks = models.TextField(default='', blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['-created_at'])]


# ── Egg Process ──

ALLOWED_ADDON_ITEM_IDS = (
    '66a3467a54eed94471',  # Chick Feed (kg)
    '66a7954fcaf3b34759',  # Water (ltr)
)


class EggProcess(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    entry_no = models.CharField(max_length=64, unique=True)  # auto-generated: EPC-00001, ...
    staff = models.ForeignKey(User, on_delete=models.PROTECT)
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT)
    batch = models.ForeignKey(MaterialReceived, on_delete=models.PROTECT)
    tot_qty = models.FloatField()
    tray_utilized = models.IntegerField()
    trays = models.ManyToManyField(Tray, blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['entry_no']), models.Index(fields=['-created_at'])]


class EggProcessAddon(BaseModel):
    """Incubation item consumed for this batch (legacy: egg_process_addon table)."""
    egg_process = models.ForeignKey(EggProcess, related_name='addons', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.PROTECT)
    qty = models.FloatField()


# ── Status Update (egg hatching progress log) ──

HATCHING_STATUS_CHOICES = (('pending', 'Pending'), ('progressing', 'Progressing'), ('completed', 'Completed'))


class StatusUpdate(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    staff = models.ForeignKey(User, on_delete=models.PROTECT)
    batch = models.ForeignKey(MaterialReceived, on_delete=models.PROTECT)
    day = models.IntegerField()
    hatching_status = models.CharField(max_length=32, choices=HATCHING_STATUS_CHOICES, default='pending')
    remarks = models.TextField(default='', blank=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['-created_at'])]


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


class PitStatus(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    pit = models.ForeignKey(Pit, on_delete=models.PROTECT)
    org_status = models.CharField(max_length=32, choices=ORG_STATUS_CHOICES)
    notes = models.TextField(default='', blank=True)
    form_batch_id = models.CharField(max_length=64, unique=True)  # auto-generated: PIT-<suffix>-00001

    # org_status == '1' (Organic Waste Added)
    feed_qty = models.FloatField(null=True, blank=True)
    feed_count = models.IntegerField(null=True, blank=True)

    # org_status == '2' (Baby Larvae Added)
    batch = models.ForeignKey(MaterialReceived, on_delete=models.PROTECT, null=True, blank=True)
    trays = models.ManyToManyField(Tray, blank=True)
    larvae_qty_in = models.FloatField(null=True, blank=True)

    # org_status == '3' (Aeration Process)
    method = models.CharField(max_length=255, default='', blank=True)

    # org_status == '4' (Measurement)
    measure_time = models.CharField(max_length=32, choices=MEASURE_TIME_CHOICES, null=True, blank=True)
    temp_start = models.FloatField(null=True, blank=True)
    temp_mid = models.FloatField(null=True, blank=True)
    temp_end = models.FloatField(null=True, blank=True)
    humi_start = models.FloatField(null=True, blank=True)
    humi_mid = models.FloatField(null=True, blank=True)
    humi_end = models.FloatField(null=True, blank=True)

    # org_status == '5' (Harvest) / '6' (Vibro Screen)
    larvae_qty = models.FloatField(null=True, blank=True)
    qty_manure_1 = models.FloatField(null=True, blank=True)
    qty_manure_2 = models.FloatField(null=True, blank=True)
    qty_manure_3 = models.FloatField(null=True, blank=True)  # harvest only
    qty_rejets = models.FloatField(null=True, blank=True)
    harvest_comp = models.CharField(max_length=32, choices=HARVEST_COMP_CHOICES, null=True, blank=True)

    # org_status == '7' (Tippi)
    tippi_qty = models.FloatField(null=True, blank=True)

    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['unique_id']),
            models.Index(fields=['form_batch_id']),
            models.Index(fields=['pit']),
            models.Index(fields=['org_status']),
            models.Index(fields=['-created_at']),
        ]


# ── FRP Tray Process ──

FRP_BATCH_STATUS_CHOICES = (('pending', 'Pending'), ('in_process', 'In Process'))


class FrpTrayProcess(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_date = models.DateField()
    batch = models.ForeignKey(MaterialReceived, on_delete=models.PROTECT, unique=True)  # one FRP load per batch
    frp_tray_count = models.IntegerField()
    trays = models.ManyToManyField(Tray, blank=True)
    batch_status = models.CharField(max_length=32, choices=FRP_BATCH_STATUS_CHOICES, default='pending')
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['-created_at'])]


# ── FRP Status Update ──

class FrpStatusUpdate(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    entry_no = models.CharField(max_length=64, unique=True, null=True, blank=True)  # auto-generated: FRP-00001, ... (sparse: legacy docs may lack it)
    entry_date = models.DateField()
    staff = models.ForeignKey(User, on_delete=models.PROTECT)
    batch = models.ForeignKey(FrpTrayProcess, on_delete=models.PROTECT)
    day = models.IntegerField()
    hatching_status = models.CharField(max_length=32, choices=HATCHING_STATUS_CHOICES, default='pending')
    remarks = models.TextField(default='', blank=True)
    image_path = models.CharField(max_length=255, default='', blank=True)  # URL/path string, matching reports.RejectImage — no binary storage in this app
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [models.Index(fields=['unique_id']), models.Index(fields=['entry_no']), models.Index(fields=['-created_at'])]
