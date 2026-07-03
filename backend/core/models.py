import uuid

from mongoengine import BooleanField, Document, IntField, ReferenceField, StringField


class MainScreen(Document):
    """Top-level sidebar category (legacy: user_screen_main table)."""
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    screen_main_name = StringField(required=True)
    icon_name = StringField(default='')
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)

    meta = {
        'collection': 'main_screens',
        'indexes': ['unique_id'],
    }


class Screen(Document):
    """Sidebar sub-item under a MainScreen (legacy: user_screen table)."""
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    screen_name = StringField(required=True)
    folder_name = StringField(required=True)  # matches frontend route slug, e.g. 'item_creation'
    icon_name = StringField(default='')
    main_screen = ReferenceField(MainScreen, required=True)
    order_no = IntField(default=0)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)

    meta = {
        'collection': 'screens',
        'indexes': ['unique_id', 'main_screen', 'order_no'],
    }
