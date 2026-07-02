import uuid

from django.utils import timezone
from mongoengine import BooleanField, DateTimeField, Document, ReferenceField, StringField


class Unit(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    unit_name = StringField(unique=True, required=True)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)

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
