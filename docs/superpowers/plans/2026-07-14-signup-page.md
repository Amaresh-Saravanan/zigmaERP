# Signup Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public self-registration ("Sign up") page that lets a visitor request an account; new accounts start inactive under a zero-permission role until an admin reviews and activates them through the existing User management screen.

**Architecture:** A new `POST /api/auth/signup` Django view (mirrors the existing `login` view's shape) creates a `User` document via a new `SignupSerializer`, always assigning a `UserType` named `Pending Signup` (auto-created once, zero screens) and `is_active=False`. The React side adds a `Signup.jsx` page that reuses the Login page's visual language via a newly-extracted shared stylesheet, and wires into the existing `djangoClient` axios instance the same way `Login.jsx` does.

**Tech Stack:** Django 4.2 + DRF (`accounts` app), MongoEngine (no schema migration needed — no model fields change, only a new classmethod), React 19 + react-router-dom v7, Vitest + React Testing Library, Cypress.

## Global Constraints

- **No new dependencies.** Everything needed (regex, DRF serializers, SweetAlert2, react-router-dom `Link`) is already installed.
- **Security decision — do not let the signup form choose a role.** This is an internal ERP where `screens`/`main_screens` gate real business data (inventory, financial reports, process data). Letting an anonymous visitor pick their own `UserType` (as `UserManageSerializer` does for admin-driven creation) would be a privilege-escalation hole. Self-registered accounts MUST be created with `is_active=False` and a fixed, zero-permission `UserType` (`Pending Signup`, `screens=''`, `main_screens=''`). An admin activates + assigns a real role later via the existing `/user/form` screen (`UserManageSerializer.update`) — no new admin-side code needed.
- **Password rule (enforced both client and server):** minimum 8 characters, at least one uppercase letter, one lowercase letter, one digit, one special character. Backend regex: `(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}`.
- **Response envelope matches existing convention:** `{ "status": 1|0, "msg": "...", "data": {...}|null, "error": "" }` (see `login` view in `backend/accounts/views.py:14`).
- **Passwords are hashed with `django.contrib.auth.hashers.make_password`** — same as every other user-creation path in this codebase (`backend/accounts/serializers.py:110`). Never store plaintext.
- **Test backend against `mongomock`**, following the existing `mongomock_connection` fixture in `backend/accounts/tests.py:14` — never against the real Atlas cluster.
- **Frontend API calls go through `djangoClient`** (`frontend/src/api/djangoClient.js`) with `{ suppressError: true }` so custom Swal messages can be shown, exactly like `Login.jsx:60-62`.

---

## File Structure

**Backend:**
- Modify: `backend/accounts/models.py` — add `UserType.get_or_create_pending()` classmethod
- Modify: `backend/accounts/serializers.py` — add `SignupSerializer`
- Modify: `backend/accounts/views.py` — add `signup` view
- Modify: `backend/config/urls.py` — register `POST /api/auth/signup`
- Modify: `backend/accounts/tests.py` — add model + endpoint tests

**Frontend:**
- Create: `frontend/src/pages/auth.css` — shared auth-page styles, extracted verbatim from `Login.jsx`'s inline `<style>` block, plus one new `.lp-field-error` rule
- Modify: `frontend/src/pages/Login.jsx` — import `auth.css` instead of an inline `<style>` block; "Sign up" link becomes a real `<Link to="/signup">`
- Create: `frontend/src/pages/Login.test.jsx` — RTL test asserting the Sign up link points to `/signup`
- Create: `frontend/src/pages/Signup.jsx` — new signup page (mirrors Login's split-hero layout)
- Create: `frontend/src/pages/Signup.test.jsx` — RTL tests (validation errors, successful submit, duplicate-username error)
- Modify: `frontend/src/routes.jsx` — add `{ path: '/signup', element: <Signup /> }`
- Create: `frontend/cypress/e2e/auth/signup.cy.js` — E2E happy path + duplicate-username path

---

### Task 1: Backend — `UserType.get_or_create_pending()` classmethod

**Files:**
- Modify: `backend/accounts/models.py:16-29` (the `UserType` class)
- Test: `backend/accounts/tests.py`

**Interfaces:**
- Produces: `UserType.get_or_create_pending() -> UserType` — idempotent; returns the same document on repeated calls; `type_name='Pending Signup'`, `screens=''`, `main_screens=''`.

- [ ] **Step 1: Write the failing test**

Add to `backend/accounts/tests.py` (after `test_user_type_gets_unique_id`, around line 44):

```python
def test_user_type_get_or_create_pending_is_idempotent():
    first = UserType.get_or_create_pending()
    second = UserType.get_or_create_pending()

    assert first.id == second.id
    assert first.type_name == 'Pending Signup'
    assert first.screens == ''
    assert first.main_screens == ''
    assert UserType.objects(type_name='Pending Signup').count() == 1
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest accounts/tests.py::test_user_type_get_or_create_pending_is_idempotent -v`
Expected: FAIL with `AttributeError: type object 'UserType' has no attribute 'get_or_create_pending'`

- [ ] **Step 3: Write minimal implementation**

In `backend/accounts/models.py`, add this classmethod inside the `UserType` class, right after the `meta = {...}` block (after line 29):

```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest accounts/tests.py::test_user_type_get_or_create_pending_is_idempotent -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/accounts/models.py backend/accounts/tests.py
git commit -m "feat(accounts): add UserType.get_or_create_pending for self-signup"
```

---

### Task 2: Backend — `SignupSerializer`

**Files:**
- Modify: `backend/accounts/serializers.py` (add `import re` at top; add new class after `LoginSerializer`, before the `# Management CRUD` comment on line 48)
- Test: `backend/accounts/tests.py`

**Interfaces:**
- Consumes: `UserType.get_or_create_pending()` (Task 1), `User` model (`backend/accounts/models.py:32-62`), `make_password` (already imported in `serializers.py:1`)
- Produces: `SignupSerializer` — a DRF `Serializer` with fields `user_name`, `user_email`, `password` (write-only), `confirm_password` (write-only), `first_name`, `last_name`. `.save()` returns a saved `User` with `is_active=False` and `user_type` set to the pending role.

- [ ] **Step 1: Write the failing test**

Add to `backend/accounts/tests.py`, after the `test_user_name_must_be_unique` test (around line 61):

```python
from accounts.serializers import SignupSerializer


def test_signup_serializer_creates_inactive_pending_user():
    serializer = SignupSerializer(data={
        'user_name': 'newuser1',
        'user_email': 'newuser1@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'New',
        'last_name': 'User',
    })
    assert serializer.is_valid(), serializer.errors

    user = serializer.save()

    assert user.is_active is False
    assert user.user_type.type_name == 'Pending Signup'
    assert check_password('Str0ng!Pass', user.password_hash)


def test_signup_serializer_rejects_duplicate_username():
    UserType.objects.create(type_name='Admin')
    User(user_name='taken', password_hash='x', user_type=UserType.objects.first()).save()

    serializer = SignupSerializer(data={
        'user_name': 'taken',
        'user_email': 'unique@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'A',
        'last_name': 'B',
    })
    assert not serializer.is_valid()
    assert 'user_name' in serializer.errors


def test_signup_serializer_rejects_duplicate_email():
    UserType.objects.create(type_name='Admin')
    User(user_name='other', password_hash='x', user_type=UserType.objects.first(),
         user_email='dupe@example.com').save()

    serializer = SignupSerializer(data={
        'user_name': 'brandnew',
        'user_email': 'dupe@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'A',
        'last_name': 'B',
    })
    assert not serializer.is_valid()
    assert 'user_email' in serializer.errors


def test_signup_serializer_rejects_weak_password():
    serializer = SignupSerializer(data={
        'user_name': 'weakpwuser',
        'user_email': 'weak@example.com',
        'password': 'weakpass',
        'confirm_password': 'weakpass',
        'first_name': 'Weak',
        'last_name': 'Pw',
    })
    assert not serializer.is_valid()
    assert 'password' in serializer.errors


def test_signup_serializer_rejects_password_mismatch():
    serializer = SignupSerializer(data={
        'user_name': 'mismatchuser',
        'user_email': 'mismatch@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Different!Pass1',
        'first_name': 'Mis',
        'last_name': 'Match',
    })
    assert not serializer.is_valid()
    assert 'confirm_password' in serializer.errors


def test_signup_serializer_rejects_invalid_username_characters():
    serializer = SignupSerializer(data={
        'user_name': 'bad name!',
        'user_email': 'badname@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'Bad',
        'last_name': 'Name',
    })
    assert not serializer.is_valid()
    assert 'user_name' in serializer.errors
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest accounts/tests.py -k signup_serializer -v`
Expected: FAIL with `ImportError: cannot import name 'SignupSerializer'`

- [ ] **Step 3: Write minimal implementation**

In `backend/accounts/serializers.py`, add `import re` as the first line of the file (before the existing `from django.contrib.auth.hashers import ...`):

```python
import re

from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers

from accounts.models import User, UserType
```

Then insert this class between `LoginSerializer` (ends at line 45) and the `# ── Management CRUD ...` comment (line 48):

```python
class SignupSerializer(serializers.Serializer):
    """Public self-registration. Accounts start is_active=False under the
    zero-permission 'Pending Signup' role until an admin reviews and assigns
    a real UserType via the existing User management screen."""
    user_name = serializers.CharField(min_length=3, max_length=50)
    user_email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)

    def validate_user_name(self, value):
        if not re.match(r'^[A-Za-z0-9_]+$', value):
            raise serializers.ValidationError(
                'Username may only contain letters, numbers, and underscores.'
            )
        if User.objects(user_name__iexact=value, is_deleted=False).first():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_user_email(self, value):
        if User.objects(user_email__iexact=value, is_deleted=False).first():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_password(self, value):
        rule = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$'
        if not re.match(rule, value):
            raise serializers.ValidationError(
                'Password must be at least 8 characters and include an uppercase '
                'letter, a lowercase letter, a number, and a special character.'
            )
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        pending_type = UserType.get_or_create_pending()
        return User(
            user_name=validated_data['user_name'],
            password_hash=make_password(validated_data['password']),
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            user_email=validated_data['user_email'],
            user_type=pending_type,
            is_active=False,
        ).save()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest accounts/tests.py -k signup_serializer -v`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/accounts/serializers.py backend/accounts/tests.py
git commit -m "feat(accounts): add SignupSerializer with pending-role validation"
```

---

### Task 3: Backend — `signup` view + URL route

**Files:**
- Modify: `backend/accounts/views.py` (add `signup` view after `login`, before `logout`)
- Modify: `backend/config/urls.py` (import + register route)
- Test: `backend/accounts/tests.py`

**Interfaces:**
- Consumes: `SignupSerializer` (Task 2)
- Produces: `POST /api/auth/signup` — success: `201` with `{status:1, msg:'signup_pending', data:{user_name}, error:''}`; validation failure: `400` with `{status:0, msg:'error', data:null, error:'<first message>'}`.

- [ ] **Step 1: Write the failing test**

Add to `backend/accounts/tests.py`, after `test_login_unknown_user_rejected` (end of file):

```python
def test_signup_endpoint_creates_pending_account(client):
    res = client.post('/api/auth/signup', {
        'user_name': 'newendpointuser',
        'user_email': 'endpoint@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'End',
        'last_name': 'Point',
    }, format='json')

    assert res.status_code == 201
    assert res.data['status'] == 1
    assert res.data['msg'] == 'signup_pending'
    assert res.data['data']['user_name'] == 'newendpointuser'

    created = User.objects.get(user_name='newendpointuser')
    assert created.is_active is False
    assert created.user_type.type_name == 'Pending Signup'


def test_signup_endpoint_rejects_duplicate_username(client, active_user):
    res = client.post('/api/auth/signup', {
        'user_name': 'admin1',
        'user_email': 'someoneelse@example.com',
        'password': 'Str0ng!Pass',
        'confirm_password': 'Str0ng!Pass',
        'first_name': 'Some',
        'last_name': 'One',
    }, format='json')

    assert res.status_code == 400
    assert res.data['status'] == 0
    assert res.data['error']
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest accounts/tests.py -k signup_endpoint -v`
Expected: FAIL with 404 (no such URL) — `assert 404 == 201`

- [ ] **Step 3: Write minimal implementation**

In `backend/accounts/views.py`, update the import on line 10 to include `SignupSerializer`:

```python
from accounts.serializers import LoginSerializer, SignupSerializer, UserManageSerializer, UserSerializer, UserTypeManageSerializer
```

Add `from mongoengine.errors import NotUniqueError` near the top (after the existing imports, line 11):

```python
from mongoengine.errors import NotUniqueError
```

Then add the `signup` view right after the `login` function (after line 44, before `def logout`):

```python
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Request: { "user_name", "user_email", "password", "confirm_password", "first_name", "last_name" }
    Response (success): { "status": 1, "msg": "signup_pending", "data": { "user_name": "..." } }
    Response (fail): { "status": 0, "msg": "error", "data": None, "error": "..." }

    New accounts start inactive under a zero-permission role; an admin must
    activate and assign a real UserType via the existing User management
    screen before the account can see any screens.
    """
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        errors = serializer.errors
        first_error = next(iter(errors.values()))
        message = first_error[0] if isinstance(first_error, list) else str(first_error)
        return Response({
            'status': 0,
            'msg': 'error',
            'data': None,
            'error': str(message),
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = serializer.save()
    except NotUniqueError:
        return Response({
            'status': 0,
            'msg': 'error',
            'data': None,
            'error': 'This username is already taken.',
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'status': 1,
        'msg': 'signup_pending',
        'data': {'user_name': user.user_name},
        'error': '',
    }, status=status.HTTP_201_CREATED)
```

In `backend/config/urls.py`, update the import block (lines 8-16) to include `signup`:

```python
from accounts.views import (
    UserTypeViewSet,
    UserViewSet,
    login,
    login_history_detail,
    login_history_report,
    logout,
    me,
    signup,
)
```

Add the route in `urlpatterns` (after line 93, `path('api/auth/login', ...)`):

```python
    path('api/auth/signup', signup, name='signup'),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest accounts/tests.py -v`
Expected: PASS (all tests, including the two new ones)

- [ ] **Step 5: Commit**

```bash
git add backend/accounts/views.py backend/config/urls.py backend/accounts/tests.py
git commit -m "feat(accounts): add POST /api/auth/signup endpoint"
```

---

### Task 4: Frontend — extract shared `auth.css` from `Login.jsx`

**Files:**
- Create: `frontend/src/pages/auth.css`
- Modify: `frontend/src/pages/Login.jsx:1-9` (imports), `frontend/src/pages/Login.jsx:265-875` (remove inline `<style>` block)

**Interfaces:**
- Produces: `auth.css` — all `.lp-*` classes currently defined inline in `Login.jsx`, importable by both `Login.jsx` and the new `Signup.jsx` (Task 5).

This is a pure refactor — no visual or behavioral change. There is no automated test for CSS in this codebase (no visual-regression tooling installed), so verification is a manual dev-server check plus the existing Vitest suite staying green (it doesn't test styles, but confirms the component still renders).

- [ ] **Step 1: Create `frontend/src/pages/auth.css`**

Copy the full contents of the `<style>{\`...\`}</style>` block currently in `Login.jsx` (starts `@import url('https://fonts.googleapis.com/css2?family=Inter...` and ends with the `@media (prefers-reduced-motion: reduce)` block) into this new file, as plain CSS (drop the JS template-literal wrapper). The file must start with:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.lp-root {
  min-height: 100vh;
  background: #e8edf2;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  overflow: hidden;
}
```

...and continue with every rule currently in `Login.jsx` lines 268-874 verbatim (all `.lp-*`, `[data-bs-theme=...]`, `.form-check*`, and `@media` blocks), ending with:

```css
@media (prefers-reduced-motion: reduce) {
  .lp-live-dot { animation: none; }
  .lp-submit { transition: none; }
}
```

- [ ] **Step 2: Update `Login.jsx` imports**

In `frontend/src/pages/Login.jsx`, change lines 1-8 from:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import djangoClient, { mapDjangoUser } from '../api/djangoClient';
import Swal from 'sweetalert2';
import heroBg from '../assets/images/auth-one-bg.jpg';
import zigflyLogo from '../assets/images/zigfly-logo-clean.png';
```

to:

```jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import djangoClient, { mapDjangoUser } from '../api/djangoClient';
import Swal from 'sweetalert2';
import heroBg from '../assets/images/auth-one-bg.jpg';
import zigflyLogo from '../assets/images/zigfly-logo-clean.png';
import './auth.css';
```

(The `Link` import is added now because Task 6 needs it — importing it here avoids a second edit to the same import line.)

- [ ] **Step 3: Remove the inline `<style>` block**

In `frontend/src/pages/Login.jsx`, delete the entire `<style>{\`...\`}</style>` block (the last child of the returned `<div className="lp-root">`, immediately before the closing `</div>`). The `return (...)` statement's JSX must end with:

```jsx
            <p className="lp-footer-text">
              Don't have an account?{' '}
              <a href="#" className="lp-link" onClick={(e) => e.preventDefault()}>Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

(i.e. no `<style>` element remains — its content now lives entirely in `auth.css`, imported in Step 2.)

- [ ] **Step 4: Verify no regression**

Run: `cd frontend && npm test`
Expected: PASS (existing test suite, e.g. `FormHeader.test.jsx`, is unaffected)

Run: `cd frontend && npm run dev`, open `http://localhost:5173/login` in a browser, confirm the page renders identically to before (hero panel, card, dark/light toggle).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/auth.css frontend/src/pages/Login.jsx
git commit -m "refactor(auth): extract Login page styles into shared auth.css"
```

---

### Task 5: Frontend — `Signup.jsx` page (test-first)

**Files:**
- Create: `frontend/src/pages/Signup.test.jsx`
- Create: `frontend/src/pages/Signup.jsx`
- Modify: `frontend/src/pages/auth.css` (append one rule)

**Interfaces:**
- Consumes: `djangoClient` (`frontend/src/api/djangoClient.js:7-12`, default export — `POST /auth/signup`), `auth.css` (Task 4, `.lp-*` classes)
- Produces: `Signup` — default-exported React component, mounted at `/signup` by Task 6.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/pages/Signup.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Signup from './Signup';
import djangoClient from '../api/djangoClient';

vi.mock('../api/djangoClient', () => ({
  default: { post: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => Promise.resolve()) },
}));

function renderSignup() {
  render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors and does not submit when fields are invalid', async () => {
    renderSignup();

    await userEvent.type(screen.getByLabelText(/username/i), 'ab');
    await userEvent.type(screen.getByLabelText(/^email/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/^password/i), 'weak');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(djangoClient.post).not.toHaveBeenCalled();
  });

  it('submits valid data and navigates to /login on success', async () => {
    djangoClient.post.mockResolvedValueOnce({
      data: { status: 1, msg: 'signup_pending', data: { user_name: 'gooduser' }, error: '' },
    });

    renderSignup();

    await userEvent.type(screen.getByLabelText(/username/i), 'gooduser');
    await userEvent.type(screen.getByLabelText(/^email/i), 'good@example.com');
    await userEvent.type(screen.getByLabelText(/first name/i), 'Good');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/^password/i), 'Str0ng!Pass');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Str0ng!Pass');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(djangoClient.post).toHaveBeenCalledWith(
        '/auth/signup',
        expect.objectContaining({ user_name: 'gooduser', user_email: 'good@example.com' }),
        { suppressError: true }
      );
    });
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('shows a server error message when the username is already taken', async () => {
    djangoClient.post.mockRejectedValueOnce({
      response: { data: { status: 0, msg: 'error', data: null, error: 'This username is already taken.' } },
    });

    const Swal = (await import('sweetalert2')).default;
    renderSignup();

    await userEvent.type(screen.getByLabelText(/username/i), 'dupeuser');
    await userEvent.type(screen.getByLabelText(/^email/i), 'dupe@example.com');
    await userEvent.type(screen.getByLabelText(/first name/i), 'Dupe');
    await userEvent.type(screen.getByLabelText(/last name/i), 'User');
    await userEvent.type(screen.getByLabelText(/^password/i), 'Str0ng!Pass');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'Str0ng!Pass');
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Signup failed', text: 'This username is already taken.' })
      );
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/Signup.test.jsx`
Expected: FAIL — `Failed to resolve import "./Signup"`

- [ ] **Step 3: Append the field-error style to `auth.css`**

Append to `frontend/src/pages/auth.css` (end of file, after the `@media (prefers-reduced-motion: reduce)` block added in Task 4):

```css
.lp-field-error {
  color: #ef4444;
  font-size: 0.78rem;
  margin-top: 4px;
}
```

- [ ] **Step 4: Write `Signup.jsx`**

Create `frontend/src/pages/Signup.jsx`:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import djangoClient from '../api/djangoClient';
import Swal from 'sweetalert2';
import heroBg from '../assets/images/auth-one-bg.jpg';
import zigflyLogo from '../assets/images/zigfly-logo-clean.png';
import './auth.css';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  user_name: '', user_email: '', password: '', confirm_password: '',
  first_name: '', last_name: '',
};

export default function Signup() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.user_name || form.user_name.length < 3) {
      errs.user_name = 'Username must be at least 3 characters.';
    } else if (!/^[A-Za-z0-9_]+$/.test(form.user_name)) {
      errs.user_name = 'Username may only contain letters, numbers, and underscores.';
    }
    if (!EMAIL_RULE.test(form.user_email)) {
      errs.user_email = 'Enter a valid email address.';
    }
    if (!PASSWORD_RULE.test(form.password)) {
      errs.password = 'Min 8 characters with uppercase, lowercase, number, and special character.';
    }
    if (form.confirm_password !== form.password) {
      errs.confirm_password = 'Passwords do not match.';
    }
    if (!form.first_name) errs.first_name = 'First name is required.';
    if (!form.last_name) errs.last_name = 'Last name is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await djangoClient.post('/auth/signup', form, { suppressError: true });
      if (res.data?.status === 1) {
        await Swal.fire({
          icon: 'success',
          title: 'Account created',
          text: 'An administrator will review and activate your account before you can sign in.',
          confirmButtonText: 'Go to Sign In',
        });
        navigate('/login');
        return;
      }
      Swal.fire({ icon: 'error', title: 'Signup failed', text: res.data?.error || 'Please try again.' });
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to reach the server. Please try again later.';
      Swal.fire({ icon: 'error', title: 'Signup failed', text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      <div className="lp-split">
        <div className="lp-hero" style={{ backgroundImage: `url(${heroBg})` }}>
          <div className="lp-hero-overlay" aria-hidden="true" />
          <div className="lp-hero-glow" aria-hidden="true" />
          <div className="lp-brand">
            <img src={zigflyLogo} alt="Zigfly" height="120" className="lp-brand-logo-full" />
          </div>
          <div className="lp-headline-wrap">
            <div className="lp-accent-bar" aria-hidden="true" />
            <h1 className="lp-headline">
              Sustainable Solutions<br />
              for a <em>Better Tomorrow</em>
            </h1>
            <p className="lp-hero-desc">
              Transforming organic waste into value through black soldier fly innovation.
            </p>
          </div>
          <p className="lp-copyright" style={{ position: 'relative', zIndex: 1 }}>
            <i className="ri-leaf-fill" aria-hidden="true" /> {new Date().getFullYear()} © Zigfly. All rights reserved.
          </p>
        </div>

        <div className="lp-form-side">
          <div className="lp-card">
            <svg className="lp-card-dots" aria-hidden="true" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              {Array.from({ length: 6 }, (_, row) =>
                Array.from({ length: 6 }, (_, col) => (
                  <circle key={`${row}-${col}`} cx={col * 14 + 5} cy={row * 14 + 5} r="1.5" fill="#25a96b" opacity="0.18" />
                ))
              )}
            </svg>

            <h2 className="lp-card-title">
              Create an <span>Account</span>
            </h2>
            <p className="lp-card-sub">Sign up to request access to Zigfly Admin Dashboard.</p>
            <div className="lp-card-rule" aria-hidden="true" />

            <form onSubmit={handleSubmit} autoComplete="off" noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="su_user">Username <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-user-line" aria-hidden="true" />
                  <input
                    className="form-control"
                    id="su_user"
                    name="user_name"
                    type="text"
                    placeholder="Choose a username"
                    value={form.user_name}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                {errors.user_name && <div className="lp-field-error">{errors.user_name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_email">Email <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-mail-line" aria-hidden="true" />
                  <input
                    className="form-control"
                    id="su_email"
                    name="user_email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.user_email}
                    onChange={handleChange}
                  />
                </div>
                {errors.user_email && <div className="lp-field-error">{errors.user_email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_first">First name <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <input
                    className="form-control"
                    id="su_first"
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </div>
                {errors.first_name && <div className="lp-field-error">{errors.first_name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_last">Last name <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <input
                    className="form-control"
                    id="su_last"
                    name="last_name"
                    type="text"
                    placeholder="Last name"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </div>
                {errors.last_name && <div className="lp-field-error">{errors.last_name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_pass">Password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    id="su_pass"
                    name="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="lp-pass-toggle"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    <i className={showPass ? 'ri-eye-off-line' : 'ri-eye-line'} aria-hidden="true" />
                  </button>
                </div>
                {errors.password && <div className="lp-field-error">{errors.password}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="su_confirm">Confirm password <span aria-label="required">*</span></label>
                <div className="lp-input-wrap">
                  <i className="ri-lock-2-line" aria-hidden="true" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    id="su_confirm"
                    name="confirm_password"
                    placeholder="Re-enter your password"
                    value={form.confirm_password}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirm_password && <div className="lp-field-error">{errors.confirm_password}</div>}
              </div>

              <button className="btn lp-submit w-100" type="submit" disabled={loading}>
                {loading ? 'Creating account…' : (
                  <><span>Sign Up</span><i className="ri-arrow-right-line" aria-hidden="true" /></>
                )}
              </button>
            </form>

            <div className="lp-divider" aria-hidden="true">
              <span className="lp-divider-line" />
              <i className="ri-shield-check-line" />
              <span className="lp-divider-line" />
            </div>

            <p className="lp-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="lp-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/Signup.test.jsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Signup.jsx frontend/src/pages/Signup.test.jsx frontend/src/pages/auth.css
git commit -m "feat(auth): add Signup page with client-side validation"
```

---

### Task 6: Frontend — wire `/signup` route + Login page link (test-first)

**Files:**
- Create: `frontend/src/pages/Login.test.jsx`
- Modify: `frontend/src/pages/Login.jsx:257-260` (the "Sign up" link)
- Modify: `frontend/src/routes.jsx`

**Interfaces:**
- Consumes: `Signup` (Task 5, default export from `./pages/Signup`)
- Produces: route `/signup` reachable in the router; `Login.jsx`'s footer link navigates to it instead of doing nothing.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/pages/Login.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';

describe('Login', () => {
  it('renders a Sign up link that points to /signup', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<div>Signup Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /sign up/i });
    expect(link).toHaveAttribute('href', '/signup');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/pages/Login.test.jsx`
Expected: FAIL — the current `<a href="#" onClick={preventDefault}>` has no `role="link"` name match on `href="/signup"` (it's `href="#"`)

- [ ] **Step 3: Update the Login.jsx link**

In `frontend/src/pages/Login.jsx`, change (lines 257-260):

```jsx
            <p className="lp-footer-text">
              Don't have an account?{' '}
              <a href="#" className="lp-link" onClick={(e) => e.preventDefault()}>Sign up</a>
            </p>
```

to:

```jsx
            <p className="lp-footer-text">
              Don't have an account?{' '}
              <Link to="/signup" className="lp-link">Sign up</Link>
            </p>
```

(`Link` is already imported from Task 4, Step 2.)

- [ ] **Step 4: Register the route**

In `frontend/src/routes.jsx`, add the import after the existing `import Login from './pages/Login';` (line 2):

```jsx
import Login from './pages/Login';
import Signup from './pages/Signup';
```

Add the route entry after the `/login` route (line 66):

```jsx
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend && npx vitest run src/pages/Login.test.jsx`
Expected: PASS

Run: `cd frontend && npm test`
Expected: PASS (full suite green)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Login.jsx frontend/src/pages/Login.test.jsx frontend/src/routes.jsx
git commit -m "feat(auth): wire /signup route and link it from the Login page"
```

---

### Task 7: Cypress E2E — signup flow

**Files:**
- Create: `frontend/cypress/e2e/auth/signup.cy.js`

**Interfaces:**
- Consumes: `/signup` route (Task 6), `POST /api/auth/signup` (Task 3)

- [ ] **Step 1: Write the E2E test**

Create `frontend/cypress/e2e/auth/signup.cy.js`:

```js
describe('E2E: Signup', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('creates a pending account and redirects to login', () => {
    cy.intercept('POST', '**/api/auth/signup', {
      statusCode: 201,
      body: { status: 1, msg: 'signup_pending', data: { user_name: 'e2enewuser' }, error: '' },
    }).as('signup');

    cy.get('#su_user').type('e2enewuser');
    cy.get('#su_email').type('e2enewuser@example.com');
    cy.get('#su_first').type('E2E');
    cy.get('#su_last').type('User');
    cy.get('#su_pass').type('Str0ng!Pass');
    cy.get('#su_confirm').type('Str0ng!Pass');
    cy.contains('button', 'Sign Up').click();

    cy.wait('@signup');
    cy.get('.swal2-title').should('contain', 'Account created');
    cy.get('.swal2-confirm').click();
    cy.url().should('include', '/login');
  });

  it('shows an error when the username is already taken', () => {
    cy.intercept('POST', '**/api/auth/signup', {
      statusCode: 400,
      body: { status: 0, msg: 'error', data: null, error: 'This username is already taken.' },
    }).as('signupDuplicate');

    cy.get('#su_user').type('admin');
    cy.get('#su_email').type('admin2@example.com');
    cy.get('#su_first').type('Admin');
    cy.get('#su_last').type('Two');
    cy.get('#su_pass').type('Str0ng!Pass');
    cy.get('#su_confirm').type('Str0ng!Pass');
    cy.contains('button', 'Sign Up').click();

    cy.wait('@signupDuplicate');
    cy.get('.swal2-title').should('contain', 'Signup failed');
    cy.url().should('include', '/signup');
  });

  it('does not submit when the password is too weak', () => {
    cy.get('#su_user').type('weakpassuser');
    cy.get('#su_email').type('weak@example.com');
    cy.get('#su_first').type('Weak');
    cy.get('#su_last').type('Pass');
    cy.get('#su_pass').type('weakpass');
    cy.get('#su_confirm').type('weakpass');
    cy.contains('button', 'Sign Up').click();

    cy.contains('Min 8 characters with uppercase, lowercase, number').should('be.visible');
  });
});
```

- [ ] **Step 2: Run the E2E test**

Run: `cd frontend && npx cypress run --spec "cypress/e2e/auth/signup.cy.js"`
Expected: PASS (3 tests) — requires the Vite dev server running at the Cypress `baseUrl` (`npm run dev` in a separate terminal, or however this repo's `cy:run` script starts it)

- [ ] **Step 3: Commit**

```bash
git add frontend/cypress/e2e/auth/signup.cy.js
git commit -m "test(e2e): add Cypress coverage for the signup flow"
```

---

## Post-Plan Manual Step (not code — flag to the user)

None of the tasks above create the very first `Pending Signup` `UserType` row until the first real signup happens (it's lazily created by `get_or_create_pending()`). No seed data or migration is required. After the first signup in a given environment, an admin should open `/user_type/list` and set a friendlier `description` if desired — optional, not part of this plan's scope.
