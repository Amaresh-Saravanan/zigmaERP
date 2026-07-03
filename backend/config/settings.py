"""
Django settings for config project — MongoEngine-backed, no relational DB.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import mongoengine as me

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
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
]

CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173'
).split(',')

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

# No relational DB — MongoEngine/Atlas is the only store.
DATABASES = {}

# ponytail: MONGODB_URI is required in every environment (dev/staging/prod),
# each pointing at its own Atlas cluster/database — no local Mongo fallback.
me.connect(host=os.environ['MONGODB_URI'])

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authentication.MongoTokenAuthentication',
    ],
    # No django.contrib.auth installed (no relational DB) — skip DRF's
    # AnonymousUser fallback, which otherwise imports contenttypes.
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
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
