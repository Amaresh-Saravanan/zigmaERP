import uuid

from django.utils import timezone
from mongoengine import BooleanField, DateTimeField, Document, FloatField, ReferenceField, StringField


class Unit(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    unit_name = StringField(unique=True, required=True)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'units',
        'indexes': ['unique_id', 'unit_name', '-created_at'],
    }


class Item(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    item_code = StringField(unique=True, required=True)  # auto-generated: IT-001, IT-002, ...
    item_name = StringField(required=True)
    unit = ReferenceField(Unit, required=True)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'items',
        'indexes': ['unique_id', 'item_code', 'item_name', '-created_at'],
    }


TRAY_TYPE_CHOICES = (('1', 'EGG Tray'), ('2', 'FRP Tray'))


class Tray(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    tray_type = StringField(required=True, choices=TRAY_TYPE_CHOICES)
    bin_name = StringField(required=True)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'trays',
        'indexes': ['unique_id', '-created_at'],
    }


class Pit(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    pit_name = StringField(unique=True, required=True)
    location = StringField(default='')
    length = FloatField(default=0)
    width = FloatField(default=0)
    height = FloatField(default=0)
    volume = FloatField(default=0)  # server-computed from length*width*height, never client-supplied
    description = StringField(default='')
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'pits',
        'indexes': ['unique_id', 'pit_name', '-created_at'],
    }

    def save(self, *args, **kwargs):
        self.volume = round(self.length * self.width * self.height, 2)
        return super().save(*args, **kwargs)


class Supplier(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    supplier_name = StringField(required=True)
    label = StringField(default='')  # short alpha code, e.g. 'ABC'
    address = StringField(default='')
    contact_no = StringField(default='')
    email = StringField(default='')
    gst_no = StringField(default='')
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'suppliers',
        'indexes': ['unique_id', '-created_at'],
    }
