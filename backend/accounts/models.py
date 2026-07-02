import secrets
import uuid

from django.utils import timezone
from mongoengine import BooleanField, DateTimeField, Document, ReferenceField, StringField


class UserType(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    type_name = StringField(unique=True, required=True)
    description = StringField(default='')
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'user_types',
        'indexes': ['unique_id'],
    }


class User(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    user_name = StringField(unique=True, required=True)
    password_hash = StringField(required=True)
    user_type = ReferenceField(UserType, required=True)
    user_email = StringField(default='')
    user_image = StringField(default='')
    main_screens = StringField(default='')  # comma-separated ids, mirrors legacy PHP
    screens = StringField(default='')
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'users',
        'indexes': ['unique_id', 'user_name', '-created_at'],
    }

    # Minimal contract DRF's permission checks expect (request.user.is_authenticated).
    # Always True: this attribute only exists on a User fetched via a valid token.
    @property
    def is_authenticated(self):
        return True


class AuthToken(Document):
    """MongoEngine-backed session token — DRF's rest_framework.authtoken needs a
    relational table, which this project doesn't have (DATABASES = {})."""
    key = StringField(unique=True, required=True, default=lambda: secrets.token_hex(32))
    user = ReferenceField(User, required=True, unique=True)
    created_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'auth_tokens',
        'indexes': ['key', 'user'],
    }

    @classmethod
    def for_user(cls, user):
        """One token per user — re-login reuses the existing token instead of piling up rows."""
        token = cls.objects(user=user).first()
        return token or cls(user=user).save()
