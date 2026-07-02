# Django Backend — Getting Started

**Version**: 1.0 | **Date**: 2026-07-02 | **Status**: Ready to scaffold

---

## Quick Start (30 min)

### 1. Create Django Project Structure

```bash
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install Django==4.2 djangorestframework==3.14 mongoengine==0.27 django-cors-headers==4.3 python-dotenv==1.0
django-admin startproject config .
python manage.py startapp accounts
python manage.py startapp inventory
python manage.py startapp process
python manage.py startapp reports
python manage.py startapp core
```

### 2. Update `config/settings.py`

```python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.auth',
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
    'django.middleware.csrf.CsrfViewMiddleware',
]

CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000,http://localhost:5173'
).split(',')

DATABASES = {}  # Disable Django's default DB since we're using MongoDB Atlas

# MongoDB Atlas Connection via MongoEngine
# MONGODB_URI must be set in .env (mongodb+srv://... connection string from Atlas)
# — see step 3 above. There is no local fallback; Atlas is required in every environment.
import mongoengine as me
me.connect(host=os.environ['MONGODB_URI'])

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

AUTH_USER_MODEL = 'accounts.User'  # Use custom User model
ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

USE_TZ = True
TIME_ZONE = 'UTC'
```

### 3. Create a MongoDB Atlas Cluster (one-time, ~5 min)

1. Sign up / log in at https://cloud.mongodb.com
2. Create a free "M0" cluster (any region)
3. **Database Access** → add a user with a password
4. **Network Access** → add your IP (or `0.0.0.0/0` for dev-only convenience)
5. **Connect** → "Drivers" → copy the `mongodb+srv://...` connection string
6. In the connection string, replace `<password>` with your DB user's password and append a database name, e.g. `/zigma_erp_dev`

### 4. Create `.env` File

```bash
cat > .env << 'EOF'
DEBUG=True
SECRET_KEY=dev-secret-key-12345-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
MONGODB_URI=mongodb+srv://<user>:<password>@<your-cluster>.mongodb.net/zigma_erp_dev
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
```

> No local MongoDB install or Docker container needed — Atlas is used for every environment (dev, staging, prod), each pointing at its own cluster/database.

### 5. Create `accounts/models.py` (MongoEngine)

```python
from mongoengine import Document, StringField, BooleanField, DateTimeField, ReferenceField
from django.utils import timezone
import uuid

class UserType(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    type_name = StringField(unique=True, required=True)
    description = StringField(default='')
    created_at = DateTimeField(default=timezone.now)
    
    meta = {
        'collection': 'user_types',
        'indexes': ['unique_id']
    }

class User(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    user_name = StringField(unique=True, required=True)
    password_hash = StringField(required=True)
    user_type = ReferenceField(UserType, required=True)
    user_email = StringField(default='')
    user_image = StringField(default='')
    main_screens = StringField(default='')  # JSON array as string or separate collection
    screens = StringField(default='')       # JSON array as string or separate collection
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)
    
    meta = {
        'collection': 'users',
        'indexes': ['unique_id', 'user_name', '-created_at']
    }
```

### 6. Create `accounts/serializers.py`

```python
from rest_framework import serializers
from .models import User, UserType

class UserTypeSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    type_name = serializers.CharField()
    description = serializers.CharField(required=False)

class UserSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    user_name = serializers.CharField()
    user_email = serializers.CharField(required=False)
    user_type = UserTypeSerializer()
    screens = serializers.ListField(child=serializers.CharField(), required=False)
    main_screens = serializers.ListField(child=serializers.CharField(), required=False)
    is_active = serializers.BooleanField(default=True)

class LoginSerializer(serializers.Serializer):
    user_name = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        from django.contrib.auth.hashers import check_password
        user_name = data['user_name']
        password = data['password']
        
        try:
            user = User.objects.get(user_name=user_name, is_deleted=False)
            if not check_password(password, user.password_hash):
                raise serializers.ValidationError("Invalid credentials")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        
        data['user'] = user
        return data
```

### 7. Create `accounts/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.hashers import make_password, check_password
from .models import User
from .serializers import LoginSerializer, UserSerializer

@api_view(['POST'])
def login(request):
    """
    Login endpoint. Returns token + user profile.
    
    Request: { "user_name": "...", "password": "..." }
    Response (success): { "status": 1, "msg": "success_login", "data": { "access_token": "...", "user": {...} } }
    Response (fail): { "status": 0, "msg": "incorrect", "error": "Invalid credentials" }
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        
        user_data = {
            'unique_id': str(user.unique_id),
            'user_name': user.user_name,
            'user_type': str(user.user_type.unique_id),
            'user_email': user.user_email,
            'screens': user.screens.split(',') if user.screens else [],
            'main_screens': user.main_screens.split(',') if user.main_screens else [],
        }
        
        return Response({
            'status': 1,
            'msg': 'success_login',
            'data': {
                'access_token': token.key,
                'user': user_data
            },
            'error': ''
        }, status=status.HTTP_200_OK)
    
    return Response({
        'status': 0,
        'msg': 'incorrect',
        'data': None,
        'error': 'Invalid username or password'
    }, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for users.
    GET /api/users/ — list
    POST /api/users/ — create
    GET /api/users/{id}/ — retrieve
    PUT /api/users/{id}/ — update
    DELETE /api/users/{id}/ — delete (soft)
    """
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.filter(is_deleted=False)
    
    def perform_create(self, serializer):
        data = serializer.validated_data
        user = User(
            user_name=data['user_name'],
            user_email=data.get('user_email', ''),
            user_type_id=data['user_type_id'],
            password_hash=make_password(data.get('password', 'password123'))
        )
        user.save()
```

### 8. Create `config/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import login, UserViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login', login, name='login'),
]
```

### 9. Start Django

```bash
python manage.py runserver
# Connects to your MongoDB Atlas dev cluster via MONGODB_URI in .env
# Server runs at http://localhost:8000/api/
```

---

## Reference Implementation: Item Module

Once login works, create the first full CRUD module (Item) as a reference for all other modules.

### `inventory/models.py`

```python
from mongoengine import Document, StringField, BooleanField, ReferenceField, DateTimeField
from django.utils import timezone
import uuid

class Unit(Document):
    unique_id = StringField(unique=True, default=lambda: str(uuid.uuid4()))
    unit_name = StringField(unique=True, required=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    
    meta = {'collection': 'units', 'indexes': ['unique_id']}

class Item(Document):
    unique_id = StringField(unique=True, default=lambda: str(uuid.uuid4()))
    item_code = StringField(unique=True, required=True)  # IT-001, IT-002, ...
    item_name = StringField(required=True)
    unit = ReferenceField(Unit)
    description = StringField(default='')
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)
    
    meta = {'collection': 'items', 'indexes': ['unique_id', 'item_code', 'item_name']}
```

### `inventory/serializers.py`

```python
from rest_framework import serializers
from .models import Item, Unit

class UnitSerializer(serializers.Serializer):
    unique_id = serializers.CharField()
    unit_name = serializers.CharField()

class ItemSerializer(serializers.Serializer):
    unique_id = serializers.CharField(read_only=True)
    item_code = serializers.CharField(read_only=True)
    item_name = serializers.CharField()
    unit = UnitSerializer(required=False)
    is_active = serializers.BooleanField(default=True)
    
    def create(self, validated_data):
        # Auto-generate item_code: IT-001, IT-002, ...
        last_item = Item.objects.all().order_by('-created_at').first()
        last_num = 0
        if last_item and last_item.item_code:
            try:
                last_num = int(last_item.item_code.split('-')[1])
            except:
                pass
        
        item_code = f"IT-{str(last_num + 1).zfill(3)}"
        
        item = Item(
            item_name=validated_data['item_name'],
            item_code=item_code,
            is_active=validated_data.get('is_active', True)
        )
        if 'unit' in validated_data:
            item.unit_id = validated_data['unit'].get('unique_id')
        item.save()
        return item
    
    def update(self, instance, validated_data):
        instance.item_name = validated_data.get('item_name', instance.item_name)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.save()
        return instance
```

### `inventory/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    
    def get_queryset(self):
        return Item.objects.filter(is_deleted=False)
    
    def list(self, request, *args, **kwargs):
        # Support DataTable-like pagination
        start = int(request.query_params.get('start', 0))
        length = int(request.query_params.get('length', 20))
        search = request.query_params.get('search[value]', '')
        
        queryset = self.get_queryset()
        
        # Search filter
        if search:
            queryset = queryset.filter(
                Q(item_name__icontains=search) | Q(item_code__icontains=search)
            )
        
        total = queryset.count()
        items = queryset[start:start + length]
        
        return Response({
            'status': 1,
            'msg': '',
            'data': ItemSerializer(items, many=True).data,
            'recordsTotal': total,
            'recordsFiltered': total,
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save()
            return Response({
                'status': 1,
                'msg': 'create',
                'data': ItemSerializer(item).data,
                'error': ''
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 0,
            'msg': 'error',
            'data': None,
            'error': str(serializer.errors)
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        # Soft delete
        item = self.get_object()
        item.is_deleted = True
        item.save()
        
        return Response({
            'status': 1,
            'msg': 'success_delete',
            'data': None,
            'error': ''
        })
```

### `config/urls.py` (Updated)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from accounts.views import login, UserViewSet
from inventory.views import ItemViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'items', ItemViewSet, basename='item')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/login', login, name='login'),
]
```

---

## Test Example (pytest-django)

### `accounts/tests.py`

```python
import pytest
from accounts.models import User, UserType
from django.contrib.auth.hashers import make_password

@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, client):
        user_type = UserType.objects.create(type_name='Admin')
        User.objects.create(
            user_name='testuser',
            password_hash=make_password('password123'),
            user_type=user_type
        )
        
        response = client.post('/api/auth/login', {
            'user_name': 'testuser',
            'password': 'password123'
        }, format='json')
        
        assert response.status_code == 200
        assert response.data['status'] == 1
        assert response.data['msg'] == 'success_login'
        assert 'access_token' in response.data['data']
    
    def test_login_failure_wrong_password(self, client):
        user_type = UserType.objects.create(type_name='Admin')
        User.objects.create(
            user_name='testuser',
            password_hash=make_password('password123'),
            user_type=user_type
        )
        
        response = client.post('/api/auth/login', {
            'user_name': 'testuser',
            'password': 'wrongpassword'
        }, format='json')
        
        assert response.status_code == 401
        assert response.data['status'] == 0
        assert response.data['msg'] == 'incorrect'

@pytest.mark.django_db
class TestItemCRUD:
    def test_create_item(self, client):
        unit = Unit.objects.create(unit_name='Kilogram')
        
        response = client.post('/api/items/', {
            'item_name': 'Test Item',
            'unit': {'unique_id': str(unit.unique_id)}
        }, format='json')
        
        assert response.status_code == 201
        assert response.data['msg'] == 'create'
        assert response.data['data']['item_code'] == 'IT-001'
```

---

## Deployment Checklist

- [ ] Create `backend/requirements/base.txt` with all dependencies
- [ ] Create `backend/Dockerfile` and `docker-compose.yml`
- [ ] Set up CI/CD (GitHub Actions) to run tests
- [ ] Deploy to production (Cloud Run, AWS ECS, Heroku, etc.)
- [ ] Configure MongoDB Atlas for production
- [ ] Update `VITE_API_URL` in frontend `.env` to point to deployed Django backend
- [ ] Test end-to-end: React login → Django token → protected API calls

---

## Next Steps

1. **Run the quick-start setup above** (15 min)
2. **Test login endpoint** with curl:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"user_name":"testuser","password":"password123"}'
   ```
3. **Implement Item CRUD** (reference implementation above)
4. **Clone Item pattern** for Tray, Pit, Unit, Supplier (each ~15 min)
5. **Implement User module** (more complex due to permissions)
6. **Implement Process modules** (Screening, Egg, Culling, etc.)
7. **Wire frontend to Django** (update `src/api/client.js` base URL)

---

*For more detail on MongoEngine, DRF, or specific module implementation, refer to TECH_STACK.md and the legacy PHP reference in `legacy/`.*
