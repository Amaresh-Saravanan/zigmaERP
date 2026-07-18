import secrets
import uuid

from django.db import models
from django.utils import timezone
from core.base import BaseModel


def _default_unique_id():
    return str(uuid.uuid4())


def _default_token_key():
    return secrets.token_hex(32)


class UserType(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    type_name = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255, default='', blank=True)
    main_screens = models.CharField(max_length=1024, default='', blank=True)  # comma-separated ids; role's default permission set
    screens = models.CharField(max_length=2048, default='', blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'user_types'

    @classmethod
    def get_or_create_pending(cls):
        """Zero-permission role auto-assigned to self-service signups until an
        admin reviews the account and assigns a real role."""
        existing = cls.objects.filter(type_name='Pending Signup', is_deleted=False).first()
        if existing:
            return existing
        return cls.objects.create(
            type_name='Pending Signup',
            description='Auto-assigned to self-registered accounts pending admin review.',
            screens='',
            main_screens='',
        )


class User(BaseModel):
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    emp_id = models.CharField(max_length=64, default='', blank=True)
    user_name = models.CharField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    first_name = models.CharField(max_length=150, default='', blank=True)
    last_name = models.CharField(max_length=150, default='', blank=True)
    user_type = models.ForeignKey(UserType, on_delete=models.PROTECT)
    user_email = models.CharField(max_length=255, default='', blank=True)
    user_image = models.CharField(max_length=255, default='', blank=True)
    main_screens = models.CharField(max_length=1024, default='', blank=True)  # comma-separated ids, mirrors legacy PHP
    screens = models.CharField(max_length=2048, default='', blank=True)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'users'

    # Minimal contract DRF's permission checks expect (request.user.is_authenticated).
    # Always True: this attribute only exists on a User fetched via a valid token.
    @property
    def is_authenticated(self):
        return True

    def has_screen(self, screen_id):
        """screens is stored comma-separated (mirrors legacy PHP's $_SESSION['screens'])."""
        return screen_id in (s.strip() for s in self.screens.split(',') if s.strip())


class AuthToken(BaseModel):
    """Session token — DRF's rest_framework.authtoken app isn't installed, so this
    is a plain table storing the same shape."""
    key = models.CharField(max_length=64, unique=True, default=_default_token_key)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'auth_tokens'

    @classmethod
    def for_user(cls, user):
        """One token per user — re-login reuses the existing token instead of piling up rows."""
        token = cls.objects.filter(user=user).first()
        return token or cls.objects.create(user=user)


class LoginHistory(BaseModel):
    """One row per login/logout event (legacy: user_login_details). The report
    groups these by user+date into first-login / last-logout / worked-hours."""
    unique_id = models.CharField(max_length=64, unique=True, default=_default_unique_id)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    sess_user_type = models.CharField(max_length=64, default='', blank=True)  # user_type unique_id at login time
    entry_date = models.DateField()
    entry_time = models.CharField(max_length=16)   # 'HH:MM:SS'
    log_type = models.IntegerField()        # 1 = login, 2 = logout, 3 = session logout, 4 = tab/window closed
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'user_login_details'

    @classmethod
    def record(cls, user, log_type):
        now = timezone.localtime()
        return cls.objects.create(
            user=user,
            sess_user_type=user.user_type.unique_id if user.user_type else '',
            entry_date=now.date(),
            entry_time=now.strftime('%H:%M:%S'),
            log_type=log_type,
        )
