import uuid

from mongoengine import BooleanField, DictField, Document, IntField, ReferenceField, StringField


class MainScreen(Document):
    """Top-level sidebar category (legacy: user_screen_main table)."""
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    screen_main_name = StringField(required=True)
    screen_type = StringField(default='')  # ponytail: free-form; frontend offers menu/report placeholders, no enforced enum until the domain defines real types
    icon_name = StringField(default='')
    order_no = IntField(default=0)
    description = StringField(default='')
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
    description = StringField(default='')
    # ponytail: persists the create-form action checkboxes (add/update/list/delete/view/print) as UI state.
    # NOT permission enforcement — actual per-user grants live in user.screens / permission_catalog.
    actions = DictField(default=dict)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)

    meta = {
        'collection': 'screens',
        'indexes': ['unique_id', 'main_screen', 'order_no'],
    }
