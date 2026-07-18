import uuid

from django.db import models
from django.utils import timezone
from core.base import BaseModel


def _uid():
    return str(uuid.uuid4())


class Unit(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_uid)
    unit_name = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'units'


class Item(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_uid)
    item_code = models.CharField(max_length=32, unique=True)
    item_name = models.CharField(max_length=255)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'items'


TRAY_TYPE_CHOICES = (('1', 'EGG Tray'), ('2', 'FRP Tray'))


class Tray(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_uid)
    tray_type = models.CharField(max_length=8, choices=TRAY_TYPE_CHOICES)
    bin_name = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'trays'


class Pit(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_uid)
    pit_name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, default='', blank=True)
    length = models.FloatField(default=0)
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)
    volume = models.FloatField(default=0)
    description = models.CharField(max_length=1024, default='', blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'pits'

    def save(self, *args, **kwargs):
        self.volume = round(self.length * self.width * self.height, 2)
        return super().save(*args, **kwargs)


class Supplier(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_uid)
    supplier_name = models.CharField(max_length=255)
    label = models.CharField(max_length=32, default='', blank=True)
    address = models.CharField(max_length=1024, default='', blank=True)
    contact_no = models.CharField(max_length=32, default='', blank=True)
    email = models.CharField(max_length=255, default='', blank=True)
    gst_no = models.CharField(max_length=32, default='', blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'suppliers'
