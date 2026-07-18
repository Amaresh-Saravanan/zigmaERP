"""
Django settings for config project — MariaDB-backed via the Django ORM.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# ponytail: same fail-loud pattern as the DB_* vars below — a real key is required
# outside DEBUG so production can never silently run on the insecure placeholder.
SECRET_KEY = os.getenv('SECRET_KEY') or ('dev-secret-key-change-in-production' if DEBUG else None)
if SECRET_KEY is None:
    raise RuntimeError('SECRET_KEY must be set via environment when DEBUG=False.')

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'rest_framework',
    'corsheaders',
    'accounts',
    'inventory',
    'process',
    'reports',
    'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # Clickjacking defense-in-depth. No CsrfViewMiddleware/SessionMiddleware here —
    # auth is a bearer token in the Authorization header (accounts.authentication),
    # never a cookie, so there's no ambient credential for CSRF to protect.
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Only bite once actually served over HTTPS (Phase 4 deployment) — off by default
# so local `runserver` over plain HTTP keeps working.
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'
SECURE_HSTS_SECONDS = int(os.getenv('SECURE_HSTS_SECONDS', '0'))

CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173'
).split(',')

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

# ponytail: DB_* vars are required in every environment (dev/staging/prod),
# each pointing at its own MariaDB instance — no sqlite/local-file fallback.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ['DB_NAME'],
        'USER': os.environ['DB_USER'],
        'PASSWORD': os.environ['DB_PASSWORD'],
        'HOST': os.environ['DB_HOST'],
        'PORT': os.environ['DB_PORT'],
        'OPTIONS': {'charset': 'utf8mb4'},
    }
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.AuthTokenAuthentication',
    ],
    # No django.contrib.auth installed — skip DRF's AnonymousUser fallback,
    # which otherwise imports contenttypes.
    'UNAUTHENTICATED_USER': None,
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

USE_TZ = True
TIME_ZONE = 'UTC'