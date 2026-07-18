import uuid

from django.db import models
from django.utils import timezone
from core.base import BaseModel


def _default_unique_id():
    return str(uuid.uuid4())


class MainScreen(BaseModel):
    """Top-level sidebar category (legacy: user_screen_main table)."""
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    screen_main_name = models.CharField(max_length=255)
    screen_type = models.CharField(max_length=64, default='', blank=True)  # ponytail: free-form; frontend offers menu/report placeholders, no enforced enum until the domain defines real types
    icon_name = models.CharField(max_length=128, default='', blank=True)
    order_no = models.IntegerField(default=0)
    description = models.CharField(max_length=1024, default='', blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'main_screens'


class Screen(BaseModel):
    """Sidebar sub-item under a MainScreen (legacy: user_screen table)."""
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    screen_name = models.CharField(max_length=255)
    folder_name = models.CharField(max_length=255)  # matches frontend route slug, e.g. 'item_creation'
    icon_name = models.CharField(max_length=128, default='', blank=True)
    main_screen = models.ForeignKey(MainScreen, on_delete=models.PROTECT)
    order_no = models.IntegerField(default=0)
    description = models.CharField(max_length=1024, default='', blank=True)
    # ponytail: persists the create-form action checkboxes (add/update/list/delete/view/print) as UI state.
    # NOT permission enforcement — actual per-user grants live in user.screens / permission_catalog.
    actions = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'screens'
