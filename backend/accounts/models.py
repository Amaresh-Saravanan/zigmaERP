import secrets
import uuid

from django.utils import timezone
from mongoengine import (
    BooleanField,
    DateField,
    DateTimeField,
    Document,
    IntField,
    ReferenceField,
    StringField,
)


class UserType(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    type_name = StringField(unique=True, required=True)
    description = StringField(default='')
    main_screens = StringField(default='')  # comma-separated ids; role's default permission set
    screens = StringField(default='')
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'user_types',
        'indexes': ['unique_id'],
    }

    @classmethod
    def get_or_create_pending(cls):
        """Zero-permission role auto-assigned to self-service signups until an
        admin reviews the account and assigns a real role."""
        existing = cls.objects(type_name='Pending Signup', is_deleted=False).first()
        if existing:
            return existing
        return cls(
            type_name='Pending Signup',
            description='Auto-assigned to self-registered accounts pending admin review.',
            screens='',
            main_screens='',
        ).save()


class User(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    emp_id = StringField(default='')
    user_name = StringField(unique=True, required=True)
    password_hash = StringField(required=True)
    first_name = StringField(default='')
    last_name = StringField(default='')
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

    def has_screen(self, screen_id):
        """screens is stored comma-separated (mirrors legacy PHP's $_SESSION['screens'])."""
        return screen_id in (s.strip() for s in self.screens.split(',') if s.strip())


class AuthToken(Document):
    """MongoEngine-backed session token — DRF's rest_framework.authtoken needs a
    relational table, which this project doesn't have (DATABASES = {})."""
    key = StringField(unique=True, required=True, default=lambda: secrets.token_hex(32))
    user = ReferenceField(User, required=True, unique=True)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'auth_tokens',
        'indexes': ['key', 'user'],
    }

    @classmethod
    def for_user(cls, user):
        """One token per user — re-login reuses the existing token instead of piling up rows."""
        token = cls.objects(user=user).first()
        return token or cls(user=user).save()


class LoginHistory(Document):
    """One row per login/logout event (legacy: user_login_details). The report
    groups these by user+date into first-login / last-logout / worked-hours."""
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    user = ReferenceField(User, required=True)
    sess_user_type = StringField(default='')  # user_type unique_id at login time
    entry_date = DateField(required=True)
    entry_time = StringField(required=True)   # 'HH:MM:SS'
    log_type = IntField(required=True)        # 1 = login, 2 = logout, 3 = session logout, 4 = tab/window closed
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

    meta = {
        'collection': 'user_login_details',
        'indexes': ['unique_id', 'user', 'entry_date', '-created_at'],
    }

    @classmethod
    def record(cls, user, log_type):
        now = timezone.localtime()
        return cls(
            user=user,
            sess_user_type=user.user_type.unique_id if user.user_type else '',
            entry_date=now.date(),
            entry_time=now.strftime('%H:%M:%S'),
            log_type=log_type,
        ).save()
