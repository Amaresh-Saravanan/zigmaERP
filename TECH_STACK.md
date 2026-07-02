# Zigma ERP — Technology Stack

**Version**: 1.0 | **Date**: 2026-07-02 | **Status**: Active

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel CDN / Edge                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────────┐
│               React 19 SPA (frontend/)                       │
│               Vite • React Router v7 • Axios                │
│               Dark theme • glassmorphism • ApexCharts       │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼────────────────────────────────────┐
│          Docker Container: Django Backend                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Django 4.2+ • Django REST Framework                │  │
│  │  Gunicorn/Uvicorn • CORS-enabled                    │  │
│  │  Token-based Auth (JWT / Session)                   │  │
│  │  Structure: accounts, inventory, process, reports   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ ODM (MongoEngine)
┌────────────────────────▼────────────────────────────────────┐
│                    MongoDB Atlas                             │
│         Cloud-hosted NoSQL Document Store                   │
│         (all environments — dev/staging/prod point to       │
│          separate Atlas clusters/databases, no local        │
│          Dockerized MongoDB required)                       │
│         Collections: users, items, trays, pits, ...         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Legacy PHP (legacy/) — Reference Only                      │
│  ❌ NOT deployed | ✅ Used for business logic understanding │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Stack

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Framework** | React 19 | UI library, component-based | 19.x |
| **Build Tool** | Vite | Fast dev server, optimized builds | 5.x+ |
| **Routing** | React Router v7 | Client-side navigation | 7.x |
| **HTTP Client** | Axios | REST API calls with interceptors | 1.6+ |
| **UI Framework** | Bootstrap 5 + Velzon | Responsive components, admin theme | 5.x |
| **Charts** | ApexCharts | Dashboard KPIs, process charts | 3.x+ |
| **Forms** | flatpickr | Date picker, form inputs | 4.6+ |
| **Notifications** | SweetAlert2 | Toast/modal notifications | 11.x+ |
| **Styling** | CSS Variables + darkmode.css | Design tokens, light/dark theme | Custom |
| **Icons** | Remixicon / Material Design | Icon library | Bundled |
| **Deployment** | Vercel | Serverless hosting, CI/CD | — |

**Key Dependencies** (frontend/package.json):
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "axios": "^1.6.0",
    "sweetalert2": "^11.0.0",
    "apexcharts": "^3.45.0",
    "react-apexcharts": "^1.4.0",
    "flatpickr": "^4.6.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "msw": "^2.0.0",
    "cypress": "^13.0.0"
  }
}
```

---

## Backend Stack

| Layer | Technology | Purpose | Version |
|-------|-----------|---------|---------|
| **Framework** | Django | Web framework, ORM, admin | 4.2+ |
| **API Layer** | Django REST Framework (DRF) | RESTful endpoints, serialization | 3.14+ |
| **ODM** | MongoEngine | MongoDB object mapping | 0.27+ |
| **Database Driver** | PyMongo | Direct MongoDB access | 4.5+ |
| **Auth** | DRF TokenAuthentication + JWT | Token-based or session auth | DRF built-in |
| **CORS** | django-cors-headers | Cross-origin requests (Vercel → backend) | 4.x+ |
| **Validation** | Pydantic / DRF validators | Input validation, serialization | Built-in |
| **Async** | Celery (optional) | Background tasks, async jobs | 5.x+ |
| **Server** | Gunicorn / Uvicorn | WSGI/ASGI application server | 21.x+ / 0.24.x+ |
| **Deployment** | Docker | Containerized backend | 24.x+ |

**Project Structure** (backend/):
```
backend/
├── manage.py
├── requirements/
│   ├── base.txt       # Core: Django, DRF, MongoEngine, django-cors-headers
│   ├── dev.txt        # Dev: pytest-django, pytest-mongodb
│   └── prod.txt       # Prod: Gunicorn, python-dotenv, sentry-sdk
├── config/
│   ├── settings.py    # Django settings, MongoDB connection, DRF config
│   ├── urls.py        # API router, DRF DefaultRouter
│   ├── wsgi.py        # Gunicorn entrypoint
│   └── asgi.py        # Uvicorn entrypoint (if async)
├── accounts/          # Users, roles, permissions
│   ├── models.py      # User, UserType, UserPermission (MongoEngine)
│   ├── serializers.py # UserSerializer, LoginSerializer
│   ├── views.py       # UserViewSet, LoginView, TokenObtainView
│   ├── urls.py        # Router patterns
│   └── tests.py       # pytest-django tests
├── inventory/         # Items, trays, pits, units, suppliers
│   ├── models.py      # Item, Tray, Pit, Unit, Supplier
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── tests.py
├── process/           # Screening, Egg, Culling, Oven, Dry, Leachate, etc.
├── reports/           # Logsheet, DC, Measurable, *_Report
├── core/              # Main Screen, Menu, shared utilities
└── Dockerfile         # Container definition
```

---

## Database Stack

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Type** | MongoDB (NoSQL document) | Flexible schema for process modules, native Python ODM |
| **Host** | **MongoDB Atlas** (all environments) | Managed cloud cluster — free/shared tier for dev, dedicated tier for prod. No local Dockerized MongoDB needed; every environment (dev/staging/prod) connects to its own Atlas cluster or database via `MONGODB_URI`, keeping data access patterns identical across environments. |
| **ODM** | MongoEngine | Pythonic interface, schema validation, migration helpers |
| **Collections** | One per entity type (users, items, trays, pits, etc.) | Relational-style organization, denormalization where needed |
| **Document ID** | `_id` (MongoDB default) | Preserve `unique_id` as indexed field for legacy compatibility during reference phase |
| **Soft Deletes** | `is_deleted: bool` field + custom QuerySet | Matches PHP legacy (`is_delete = 0` pattern) |
| **Indexing** | Compound indexes on `unique_id`, `user_id`, `created_at` | Query performance for list/search operations |
| **Connection** | Pymongo connection pool via MongoEngine | Automatic connection pooling, thread-safe |

**Example Collections (MongoEngine Schema)**:
```python
# accounts/models.py
class User(Document):
    unique_id = StringField(unique=True, required=True)
    user_name = StringField(unique=True, required=True)
    password_hash = StringField(required=True)  # bcrypt
    user_type = ReferenceField('UserType')
    user_image = StringField(default='')
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'users',
        'indexes': ['unique_id', 'user_name', '-created_at']
    }

# inventory/models.py
class Item(Document):
    unique_id = StringField(unique=True, required=True)
    item_code = StringField(unique=True, required=True)  # IT-001, IT-002
    item_name = StringField(required=True)
    unit = ReferenceField('Unit')
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'items',
        'indexes': ['unique_id', 'item_code', 'item_name']
    }
```

---

## Authentication & Authorization

| Aspect | Approach |
|--------|----------|
| **Auth Type** | Token-based (JWT or DRF TokenAuthentication) |
| **Token Issuance** | Login endpoint returns `access_token` + optional `refresh_token` |
| **Token Storage** | Frontend localStorage or httpOnly cookie (httpOnly preferred for security) |
| **Permission Model** | Role-based (`user_type`) + screen-level permissions (`screens` array in token claims or separate lookup) |
| **Server-side Enforcement** | DRF permission classes check `user.screens` before allowing resource access |
| **CORS** | django-cors-headers allows Vercel origin + localhost (dev) |
| **HTTPS** | Required in production; localhost in dev |

**Login Flow** (Django):
```python
POST /api/auth/login
{
  "user_name": "testuser",
  "password": "password123"
}

Response (success):
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "...",
  "user": {
    "id": "user_123",
    "user_name": "testuser",
    "user_type": "admin",
    "screens": ["item_view", "item_create", "item_delete", ...],
    "main_screens": ["ms_inventory", "ms_process", ...]
  }
}
```

---

## Deployment Architecture

### Development (Local)

> **No local MongoDB container needed.** Every environment — dev, staging, prod — connects to **MongoDB Atlas** (a free/shared "M0" cluster is enough for dev). This keeps query behavior, indexes, and Atlas-specific features (search, connection pooling limits) identical across environments and avoids "works locally, breaks on Atlas" surprises.

```bash
# One-time: create a free MongoDB Atlas cluster at https://cloud.mongodb.com,
# create a "dev" database inside it, and grab its connection string.

# Terminal 1: React Vite dev server
cd frontend
npm run dev        # http://localhost:5173

# Terminal 2: Django dev server
cd backend
# .env: MONGODB_URI=mongodb+srv://<user>:<pass>@<dev-cluster>.mongodb.net/zigma_erp_dev
python manage.py runserver  # http://localhost:8000
```

### Staging / Production (Docker + Vercel)

**Docker Compose** (backend + frontend containers; database is Atlas, not containerized):
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ['8000:8000']
    environment:
      DJANGO_SETTINGS_MODULE: config.settings.prod
      MONGODB_URI: ${MONGODB_URI}  # mongodb+srv://... Atlas connection string, injected via env/secret
      SECRET_KEY: ${SECRET_KEY}
      CORS_ALLOWED_ORIGINS: http://localhost:3000,https://zigma-erp.vercel.app

  frontend:
    build: ./frontend
    ports: ['3000:3000']
    environment:
      VITE_API_URL: http://localhost:8000/api
    depends_on:
      - backend
```

**Vercel Deployment** (frontend):
```bash
# Vercel automatically deploys on git push
# Environment variables:
# VITE_API_URL = https://api.zigma-erp.com  (or Django backend URL)
npm run build  # outputs frontend/dist/
```

**Backend Deployment** (Docker on server / cloud):
```bash
docker build -t zigma-backend ./backend
docker run -d -p 8000:8000 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/zigma_erp" \
  -e SECRET_KEY="..." \
  -e DEBUG=False \
  zigma-backend
```

---

## API Contract (Django REST)

All endpoints return JSON. Standard response shape:

```json
{
  "status": 1,
  "data": { ... } | [ ... ],
  "msg": "create" | "update" | "success_delete" | "already" | "error",
  "error": ""
}
```

**Sample Endpoints**:
- `POST /api/auth/login` — Token-based login
- `GET /api/items/` — List items (paginated, searchable)
- `POST /api/items/` — Create item
- `GET /api/items/{id}/` — Retrieve item
- `PUT /api/items/{id}/` — Update item
- `DELETE /api/items/{id}/` — Delete item (soft)

**Frontend Integration** (Axios):
```javascript
// src/api/client.js
const client = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

---

## Legacy PHP (Reference Only)

| Aspect | Detail |
|--------|--------|
| **Location** | `legacy/` folder (not deployed) |
| **Purpose** | Understand business logic, CRUD workflows, permission model |
| **DO NOT** | Migrate PHP code; Django models replace it entirely |
| **DO** | Copy business rules (duplicate checks, auto-code generation, soft deletes) into Django serializers/views |
| **Reference** | Use `legacy/folders/*/crud.php` to understand payload shapes; use `legacy/config/comfun.php` for UI helper logic |

**Example: Item Code Generation (PHP → Django)**
```php
// legacy/folders/item_creation/crud.php (PHP)
$item_code = "IT-" . str_pad($last_id + 1, 3, "0", STR_PAD_LEFT);
```

```python
# backend/inventory/serializers.py (Django)
from django.db.models import Max

class ItemSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        last_item = Item.objects.all().order_by('id').last()
        last_num = int(last_item.item_code.split('-')[1]) if last_item else 0
        validated_data['item_code'] = f"IT-{str(last_num + 1).zfill(3)}"
        return super().create(validated_data)
```

---

## Development Workflow

### Setup (First Time)

```bash
# Clone repo
git clone <repo-url>
cd erp

# Frontend
cd frontend
npm install
npm run dev

# Backend (new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver
# MONGODB_URI in backend/.env points at your MongoDB Atlas dev cluster —
# no local MongoDB container to start.

# Frontend should now connect to http://localhost:8000/api
```

### Testing

```bash
# Frontend
npm test              # Vitest
npm run test:coverage # Coverage report
npm run cy:open       # Cypress E2E (interactive)
npm run cy:run        # Cypress E2E (headless)

# Backend
pytest                # All tests
pytest accounts/      # Specific app
pytest -v --cov       # With coverage
```

### Building & Deploying

```bash
# Frontend (Vercel)
npm run build
# Push to main branch → Vercel auto-deploys

# Backend (Docker)
docker build -t zigma-backend .
docker run -d -p 8000:8000 zigma-backend
# Or push to registry (ECR, Docker Hub) → deploy to ECS/K8s/App Engine
```

---

## Environment Variables

**Frontend** (`.env` or Vercel):
```
VITE_API_URL=http://localhost:8000/api  # dev
VITE_API_URL=https://api.zigma-erp.com  # prod
```

**Backend** (`.env` or Docker):
```
DEBUG=False                                                        # prod only
SECRET_KEY=<django-secret>
MONGODB_URI=mongodb+srv://<user>:<pass>@<dev-cluster>.mongodb.net/zigma_erp_dev    # dev Atlas cluster
MONGODB_URI=mongodb+srv://<user>:<pass>@<prod-cluster>.mongodb.net/zigma_erp_prod  # prod Atlas cluster
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://zigma-erp.vercel.app
ALLOWED_HOSTS=localhost,127.0.0.1,api.zigma-erp.com
```

> Use separate Atlas databases (or clusters) per environment — `zigma_erp_dev`, `zigma_erp_staging`, `zigma_erp_prod` — never share one database across environments.

---

## Summary Table

| Component | Local Dev | Staging | Production |
|-----------|-----------|---------|------------|
| **Frontend** | `npm run dev` (Vite) | Docker / Vercel | Vercel CDN |
| **Backend** | `python manage.py runserver` | Docker | Docker / Kubernetes / App Engine |
| **Database** | MongoDB Atlas (dev cluster) | MongoDB Atlas (staging DB) | MongoDB Atlas (prod cluster) |
| **Auth** | Token (JWT) | Token (JWT) | Token (JWT) + HTTPS |
| **CORS** | localhost:3000 | Staging URL | Production URL |
| **API Base URL** | http://localhost:8000/api | https://staging-api.example.com | https://api.zigma-erp.com |

---

*End of Tech Stack. All sections align with the actual chosen technologies (React/Django/MongoDB/Docker/Vercel) and treat legacy PHP as reference only.*
