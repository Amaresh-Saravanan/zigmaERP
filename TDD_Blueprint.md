# Test-Driven Development (TDD) Blueprint
## Zigma ERP React SPA Migration

**Document Version**: 1.0 | **Last Updated**: 2026-06-25 | **Status**: Ready for Implementation

---

## Executive Summary

TDD strategy for migrating Zigma ERP from PHP/jQuery to a React SPA.

**Key Metrics**:
- Unit Test Coverage: **80%+**
- Integration Test Coverage: **90%+ for critical paths**
- E2E Test Coverage: **All user journeys + error cases**
- Unit suite < 5 min, E2E suite < 15 min
- A11y: **0 blocking violations**

> **Adaptation**: Auth uses PHP sessions (not JWT). AuthContext stores user profile from the login response JSON.
> See `PRD_React_Migration.md` Section 2.2 for the session-cookie model.

---

## Table of Contents

1. Context & Objectives
2. Test Structure & Architecture
3. Unit Test Specifications
4. Integration Test Specifications
5. End-to-End Test Specifications
6. Accessibility Testing
7. Mock & Fixture Strategy
8. Test Execution Strategy
9. Test Maintenance & Best Practices
10. Success Metrics & KPIs
11. Risk Assessment & Mitigation
12. CI/CD Pipeline Configuration
13. Appendix

---

## 1. Context & Objectives

### Legacy System
- **Architecture**: SSR PHP + jQuery DOM manipulation
- **Auth**: Session-based (`$_SESSION`) — PHP sets cookies; React reads same-origin session cookie
- **Routing**: `index.php?file=folder/action`
- **API Pattern**: `POST folders/*/crud.php` with `action` field; response shape: `{status, data, error, msg}`

### Target System
- **Architecture**: React 19 SPA + React Router v7
- **Auth**: PHP session cookie (same-origin); no JWT
- **API Client**: Axios (`withCredentials: true`); interceptor maps `msg` field to SweetAlert2 toasts

### Objectives
1. Catch regressions early
2. Tests as living documentation
3. Automate repetitive scenarios
4. WCAG 2.1 AA compliance

---

## 2. Test Structure & Architecture

### Directory Layout

```
frontend/
├── __tests__/
│   ├── unit/
│   │   ├── components/Auth/Login.test.jsx
│   │   ├── components/Layout/{Header,Sidebar,Footer}.test.jsx
│   │   ├── components/Shared/{DataTable,FormInput,ActionButton}.test.jsx
│   │   ├── hooks/{useAuth,usePermission,useForm}.test.js
│   │   └── utils/{permissionChecker,formatters}.test.js
│   ├── integration/
│   │   ├── auth/{login,logout}.test.js
│   │   ├── items/{itemCRUD,itemPermissions}.test.js
│   │   └── forms/{formSubmission,formValidation}.test.js
│   ├── a11y/*.a11y.test.jsx
│   ├── fixtures/{users,items,trays}.json
│   └── mocks/
│       ├── handlers.js     ← MSW handlers for folders/*/crud.php
│       ├── server.js
│       └── factories/{userFactory,itemFactory}.js
├── cypress/
│   ├── e2e/auth/login.cy.js
│   ├── e2e/items/{itemCreate,itemEdit,itemDelete}.cy.js
│   ├── e2e/permissions/accessControl.cy.js
│   ├── e2e/errorRecovery/networkErrors.cy.js
│   ├── e2e/a11y/accessibility.cy.js
│   └── support/commands.js
├── vitest.config.js
└── vitest.setup.js
```

> **Tooling**: Use **Vitest** (not Jest) — project is Vite-based. Syntax is identical to Jest.
> `npm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom msw cypress cypress-axe jest-axe`

### MSW Handlers for `crud.php` Endpoints

```js
// __tests__/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Login
  http.post('*/folders/login/crud.php', async ({ request }) => {
    const body = await request.formData();
    if (body.get('action') === 'login') {
      return body.get('user_name') === 'testuser'
        ? HttpResponse.json({ status: 1, data: 1, error: 0, msg: 'success_login' })
        : HttpResponse.json({ status: 0, data: 1, error: 0, msg: 'incorrect' });
    }
  }),

  // Item CRUD
  http.post('*/folders/item_creation/crud.php', async ({ request }) => {
    const body = await request.formData();
    switch (body.get('action')) {
      case 'datatable':
        return HttpResponse.json({
          draw: 1, recordsTotal: 3, recordsFiltered: 3,
          data: [
            [1, 'IT-001', 'Item A', 'Kg', 1, 'uid-1'],
            [2, 'IT-002', 'Item B', 'Kg', 1, 'uid-2'],
            [3, 'IT-003', 'Item C', 'Kg', 0, 'uid-3'],
          ]
        });
      case 'createupdate':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'create' });
      case 'delete':
        return HttpResponse.json({ status: 1, data: '', error: '', msg: 'success_delete' });
    }
  }),
];
```

### Fixtures

**`__tests__/fixtures/users.json`**:
```json
[
  {
    "unique_id": "uid-admin",
    "user_name": "testuser",
    "password": "password123",
    "user_type_unique_id": "5f97fc3257f2525529",
    "main_screens": ["ms_inventory", "ms_process", "ms_admin"],
    "screens": ["item_create", "item_edit", "item_delete", "tray_view", "user_create"]
  },
  {
    "unique_id": "uid-limited",
    "user_name": "limiteduser",
    "password": "password123",
    "user_type_unique_id": "6213273aa04b228161",
    "main_screens": ["ms_inventory"],
    "screens": ["item_view"]
  }
]
```

**`__tests__/fixtures/items.json`**:
```json
[
  { "unique_id": "uid-1", "item_code": "IT-001", "item_name": "Item A", "unit": "kg-uid", "is_active": 1, "is_delete": 0 },
  { "unique_id": "uid-2", "item_code": "IT-002", "item_name": "Item B", "unit": "kg-uid", "is_active": 1, "is_delete": 0 },
  { "unique_id": "uid-3", "item_code": "IT-003", "item_name": "Item C", "unit": "kg-uid", "is_active": 0, "is_delete": 0 }
]
```

---

## 3. Unit Test Specifications

### `useAuth()` Hook

```js
// ponytail: no JWT — PHP session cookie handles auth state server-side
describe('useAuth hook', () => {
  beforeEach(() => vi.clearAllMocks());

  test('sets user in context on successful login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => { await result.current.login('testuser', 'password123'); });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.userName).toBe('testuser');
    expect(Array.isArray(result.current.user.screens)).toBe(true);
  });

  test('remains unauthenticated on failed login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => { await result.current.login('wronguser', 'wrongpass'); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test('clears user context on logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => { await result.current.login('testuser', 'password123'); });
    act(() => { result.current.logout(); });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test('populates mainScreens and screens from login response', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => { await result.current.login('testuser', 'password123'); });
    expect(result.current.user.mainScreens.length).toBeGreaterThan(0);
    expect(result.current.user.screens.length).toBeGreaterThan(0);
  });
});
```

### `usePermission(screenId)` Hook

```js
describe('usePermission hook', () => {
  const wrap = (screens) => ({ children }) => (
    <AuthContext.Provider value={{ user: { screens } }}>{children}</AuthContext.Provider>
  );

  test('returns true when user has screen ID', () => {
    const { result } = renderHook(() => usePermission('item_create'), { wrapper: wrap(['item_create']) });
    expect(result.current).toBe(true);
  });

  test('returns false when user lacks screen ID', () => {
    const { result } = renderHook(() => usePermission('item_delete'), { wrapper: wrap(['item_view']) });
    expect(result.current).toBe(false);
  });

  test('returns false when no user is authenticated', () => {
    const { result } = renderHook(
      () => usePermission('item_create'),
      { wrapper: ({ children }) => <AuthContext.Provider value={{ user: null }}>{children}</AuthContext.Provider> }
    );
    expect(result.current).toBe(false);
  });
});
```

### `useForm()` Hook

```js
describe('useForm hook', () => {
  const initial = { item_name: '', unit: '' };
  const validate = (v) => {
    const e = {};
    if (!v.item_name) e.item_name = 'Item name is required';
    if (!v.unit)      e.unit = 'Unit is required';
    return e;
  };

  test('initializes with provided values', () => {
    const { result } = renderHook(() => useForm(initial, validate));
    expect(result.current.values).toEqual(initial);
    expect(result.current.errors).toEqual({});
  });

  test('updates value on handleChange', () => {
    const { result } = renderHook(() => useForm(initial, validate));
    act(() => { result.current.handleChange({ target: { name: 'item_name', value: 'Widget' } }); });
    expect(result.current.values.item_name).toBe('Widget');
  });

  test('shows error on blur of empty required field', () => {
    const { result } = renderHook(() => useForm(initial, validate));
    act(() => { result.current.handleBlur({ target: { name: 'item_name' } }); });
    expect(result.current.errors.item_name).toBe('Item name is required');
  });

  test('resets to initial values', () => {
    const { result } = renderHook(() => useForm(initial, validate));
    act(() => {
      result.current.handleChange({ target: { name: 'item_name', value: 'Widget' } });
      result.current.reset();
    });
    expect(result.current.values).toEqual(initial);
  });

  test('calls onSubmit with values when form is valid', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({ item_name: 'Widget', unit: 'kg-uid' }, validate, onSubmit)
    );
    await act(async () => { await result.current.handleSubmit({ preventDefault: () => {} }); });
    expect(onSubmit).toHaveBeenCalledWith({ item_name: 'Widget', unit: 'kg-uid' });
  });
});
```

### `Login.jsx` Component

```js
describe('Login Component', () => {
  test('renders username, password fields and submit button', () => {
    render(<Login />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('does not submit when fields are empty', async () => {
    const mockLogin = vi.fn();
    render(<Login onLogin={mockLogin} />);
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('calls login with credentials on submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    render(<Login onLogin={mockLogin} />);
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123'));
  });

  test('disables submit button while logging in', async () => {
    const mockLogin = vi.fn(() => new Promise(() => {}));
    render(<Login onLogin={mockLogin} />);
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  test('toggles password visibility', async () => {
    render(<Login />);
    const pwd = screen.getByLabelText(/password/i);
    expect(pwd).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: /toggle password/i }));
    expect(pwd).toHaveAttribute('type', 'text');
  });

  test('submits on Enter key (from login.js line 307)', async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    render(<Login onLogin={mockLogin} />);
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123{Enter}');
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123'));
  });
});
```

### `DataTable.jsx` Component

```js
describe('DataTable Component', () => {
  const cols = [
    { key: 'item_code', label: 'Item Code' },
    { key: 'item_name', label: 'Item Name' },
  ];

  test('renders column headers', () => {
    render(<DataTable columns={cols} ajaxUrl="" ajaxAction="datatable" />);
    expect(screen.getByText('Item Code')).toBeInTheDocument();
  });

  test('shows rows fetched from backend', async () => {
    render(<DataTable columns={cols} ajaxUrl="folders/item_creation/crud.php" ajaxAction="datatable" />);
    await waitFor(() => {
      expect(screen.getByText('Item A')).toBeInTheDocument();
      expect(screen.getByText('IT-001')).toBeInTheDocument();
    });
  });

  test('filters on search input', async () => {
    render(<DataTable columns={cols} ajaxUrl="folders/item_creation/crud.php" ajaxAction="datatable" searchable />);
    await screen.findByText('Item A');
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'Item A');
    await waitFor(() => expect(screen.queryByText('Item B')).not.toBeInTheDocument());
  });

  test('calls onEdit with uniqueId on edit click', async () => {
    const onEdit = vi.fn();
    render(<DataTable columns={cols} ajaxUrl="folders/item_creation/crud.php" ajaxAction="datatable" onEdit={onEdit} />);
    await screen.findByText('Item A');
    await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    expect(onEdit).toHaveBeenCalledWith('uid-1');
  });
});
```

### `ActionButton.jsx` Component

```js
describe('ActionButton Component', () => {
  test('renders with label', () => {
    render(<ActionButton label="Edit Item" />);
    expect(screen.getByRole('button', { name: /edit item/i })).toBeInTheDocument();
  });

  test('is disabled when user lacks required permission', () => {
    render(<ActionButton label="Delete" requiredPermission="item_delete" userScreens={['item_view']} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeDisabled();
  });

  test('is enabled when user has permission', () => {
    render(<ActionButton label="Delete" requiredPermission="item_delete" userScreens={['item_delete']} />);
    expect(screen.getByRole('button', { name: /delete/i })).not.toBeDisabled();
  });

  test('does not render when hideIfUnauthorized and user lacks permission', () => {
    render(<ActionButton label="Admin" requiredPermission="admin_access" userScreens={['item_view']} hideIfUnauthorized />);
    expect(screen.queryByRole('button', { name: /admin/i })).not.toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<ActionButton label="Save" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### `Sidebar.jsx` Component

```js
describe('Sidebar Component', () => {
  const wrap = (mainScreens, userType = '') => ({ children }) => (
    <AuthContext.Provider value={{ user: { mainScreens, userType, screens: [] } }}>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthContext.Provider>
  );

  test('renders items user has main screen access to', () => {
    render(<Sidebar />, { wrapper: wrap(['ms_inventory', 'ms_admin']) });
    expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  test('does not render items user lacks access to', () => {
    render(<Sidebar />, { wrapper: wrap(['ms_inventory']) });
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
  });

  // From menu.php line 50: worker type 6213273aa04b228161 does not see Dashboard
  test('hides Dashboard for worker role', () => {
    render(<Sidebar />, { wrapper: wrap(['ms_inventory'], '6213273aa04b228161') });
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });
});
```

### Utility: `disname()`

```js
// ponytail: direct port of PHP disname() — one line
import { disname } from '../../src/utils/disname';

describe('disname()', () => {
  test('converts snake_case to Title Case', () => {
    expect(disname('item_creation')).toBe('Item Creation');
    expect(disname('screening_process')).toBe('Screening Process');
    expect(disname('dashboard')).toBe('Dashboard');
  });

  test('returns empty string for empty input', () => {
    expect(disname('')).toBe('');
  });
});
```

### Utility: Permission Checker

```js
import { hasMainScreenAccess, hasScreenAccess } from '../../src/utils/permissionChecker';

const fullUser = { mainScreens: ['ms_inventory', 'ms_admin'], screens: ['item_create', 'item_delete'] };
const limited  = { mainScreens: ['ms_inventory'], screens: ['item_view'] };

describe('hasMainScreenAccess', () => {
  test('true if user has access',  () => expect(hasMainScreenAccess(fullUser, 'ms_admin')).toBe(true));
  test('false if user lacks',      () => expect(hasMainScreenAccess(limited,  'ms_admin')).toBe(false));
});

describe('hasScreenAccess', () => {
  test('true if user has permission',  () => expect(hasScreenAccess(fullUser, 'item_delete')).toBe(true));
  test('false if user lacks',          () => expect(hasScreenAccess(limited,  'item_delete')).toBe(false));
});
```

---

## 4. Integration Test Specifications

### Authentication Flow

```js
describe('Integration: Login Flow', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('full login populates AuthContext with mainScreens and screens', async () => {
    let capturedUser;
    const Capture = () => { const { user } = useAuth(); capturedUser = user; return null; };

    const { getByLabelText, getByRole } = render(
      <BrowserRouter><AuthProvider><Login /><Capture /></AuthProvider></BrowserRouter>
    );

    await userEvent.type(getByLabelText(/username/i), 'testuser');
    await userEvent.type(getByLabelText(/password/i), 'password123');
    await userEvent.click(getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(capturedUser).not.toBeNull();
      expect(Array.isArray(capturedUser?.mainScreens)).toBe(true);
    });
  });

  test('shows SweetAlert "incorrect" on wrong credentials', async () => {
    const { getByLabelText, getByRole } = render(
      <BrowserRouter><AuthProvider><Login /></AuthProvider></BrowserRouter>
    );
    await userEvent.type(getByLabelText(/username/i), 'wronguser');
    await userEvent.type(getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(document.querySelector('.swal2-popup')).toBeInTheDocument();
      expect(document.querySelector('.swal2-title').textContent).toMatch(/incorrect/i);
    });
  });
});
```

### Item CRUD Operations

```js
describe('Integration: Item CRUD', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('creates item and shows "Successfully Saved" toast', async () => {
    const { getByLabelText, getByRole } = render(
      <BrowserRouter><AuthProvider><ItemCreationForm /></AuthProvider></BrowserRouter>
    );
    await userEvent.type(getByLabelText(/item name/i), 'New Item');
    await userEvent.selectOptions(getByLabelText(/unit/i), 'kg-uid');
    await userEvent.click(getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(document.querySelector('.swal2-title').textContent).toMatch(/saved/i);
    });
  });

  test('shows "Already Exist" toast on duplicate item_name', async () => {
    server.use(
      http.post('*/folders/item_creation/crud.php', () =>
        HttpResponse.json({ status: 0, msg: 'already' })
      )
    );
    const { getByLabelText, getByRole } = render(
      <BrowserRouter><AuthProvider><ItemCreationForm /></AuthProvider></BrowserRouter>
    );
    await userEvent.type(getByLabelText(/item name/i), 'Existing Item');
    await userEvent.click(getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(document.querySelector('.swal2-title').textContent).toMatch(/already/i);
    });
  });

  test('fetches and displays items via datatable action', async () => {
    const { getByText } = render(
      <BrowserRouter><AuthProvider><ItemCreationList /></AuthProvider></BrowserRouter>
    );
    await waitFor(() => {
      expect(getByText('Item A')).toBeInTheDocument();
      expect(getByText('IT-001')).toBeInTheDocument();
    });
  });

  test('soft-deletes item after SweetAlert confirmation', async () => {
    const { getByText, getAllByRole } = render(
      <BrowserRouter><AuthProvider><ItemCreationList /></AuthProvider></BrowserRouter>
    );
    await waitFor(() => getByText('Item A'));
    await userEvent.click(getAllByRole('button', { name: /delete/i })[0]);
    await waitFor(() => document.querySelector('.swal2-confirm'));
    await userEvent.click(document.querySelector('.swal2-confirm'));
    await waitFor(() => {
      expect(document.querySelector('.swal2-title').textContent).toMatch(/deleted/i);
    });
  });

  test('pre-fills form on edit and shows "Updated" toast on submit', async () => {
    server.use(
      http.post('*/folders/item_creation/crud.php', () =>
        HttpResponse.json({ status: 1, msg: 'update' })
      )
    );
    const { getByLabelText, getByRole } = render(
      <BrowserRouter><AuthProvider><ItemCreationForm uniqueId="uid-1" /></AuthProvider></BrowserRouter>
    );
    await waitFor(() => expect(getByLabelText(/item name/i)).toHaveValue('Item A'));
    await userEvent.clear(getByLabelText(/item name/i));
    await userEvent.type(getByLabelText(/item name/i), 'Item A Updated');
    await userEvent.click(getByRole('button', { name: /update/i }));
    await waitFor(() => {
      expect(document.querySelector('.swal2-title').textContent).toMatch(/updated/i);
    });
  });
});
```

### Form Validation

```js
describe('Integration: Form Validation', () => {
  test('does not call API when required fields are empty', async () => {
    const postSpy = vi.spyOn(client, 'post');
    const { getByRole } = render(
      <BrowserRouter><AuthProvider><ItemCreationForm /></AuthProvider></BrowserRouter>
    );
    await userEvent.click(getByRole('button', { name: /save/i }));
    expect(postSpy).not.toHaveBeenCalled();
  });

  test('shows inline error for missing item name', async () => {
    const { getByRole, getByText } = render(
      <BrowserRouter><AuthProvider><ItemCreationForm /></AuthProvider></BrowserRouter>
    );
    await userEvent.click(getByRole('button', { name: /save/i }));
    expect(getByText(/item name is required/i)).toBeInTheDocument();
  });
});
```

---

## 5. End-to-End Test Specifications

### Cypress Login Command

```js
// cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.request({
    method: 'POST',
    url: '/folders/login/crud.php',
    form: true,
    body: { action: 'login', user_name: username, password },
  }).then((res) => {
    expect(res.body.msg).to.eq('success_login');
    // PHP sets the session cookie automatically for subsequent requests
  });
});
```

### Login Journey

```js
describe('E2E: Login User Journey', () => {
  beforeEach(() => { cy.visit('/login'); });

  it('logs in and lands on dashboard', () => {
    cy.get('#user_name').type('testuser');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/');
    cy.contains('Dashboard').should('exist');
  });

  it('shows SweetAlert Incorrect on wrong credentials', () => {
    cy.get('#user_name').type('wronguser');
    cy.get('#password').type('wrongpass');
    cy.get('button[type="submit"]').click();
    cy.get('.swal2-title').should('contain', 'Incorrect');
    cy.url().should('include', '/login');
  });

  it('submits on Enter key (login.js line 307)', () => {
    cy.get('#user_name').type('testuser');
    cy.get('#password').type('password123{enter}');
    cy.url().should('include', '/');
  });

  it('redirects to /password when default password used (login.js line 115)', () => {
    cy.get('#user_name').type('testuser');
    cy.get('#password').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/password');
  });
});
```

### Item Management Journey

```js
describe('E2E: Item Creation', () => {
  beforeEach(() => {
    cy.login('testuser', 'password123');
    cy.visit('/item-creation');
  });

  it('creates a new item end-to-end', () => {
    cy.contains('button', 'New').click();
    cy.get('#item_name').type('New Test Item');
    cy.get('#unit').select('Kilogram');
    cy.get('#active_status').select('Active');
    cy.contains('button', 'Save').click();
    cy.get('.swal2-title').should('contain', 'Successfully Saved');
    cy.contains('New Test Item').should('exist');
  });

  it('shows Already Exist warning on duplicate item name', () => {
    cy.contains('button', 'New').click();
    cy.get('#item_name').type('Item A');
    cy.contains('button', 'Save').click();
    cy.get('.swal2-title').should('contain', 'Already Exist');
  });

  it('does not save when required fields are empty', () => {
    cy.contains('button', 'New').click();
    cy.contains('button', 'Save').click();
    cy.get('.swal2-title').should('not.contain', 'Successfully Saved');
  });
});

describe('E2E: Item Delete', () => {
  beforeEach(() => {
    cy.login('testuser', 'password123');
    cy.visit('/item-creation');
  });

  it('shows SweetAlert confirm before deleting', () => {
    cy.get('table tbody tr').first().find('a[onclick*="delete"]').click();
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Are you sure');
  });

  it('soft-deletes after SweetAlert confirm', () => {
    cy.get('table tbody tr').first().find('a[onclick*="delete"]').click();
    cy.get('.swal2-confirm').click();
    cy.get('.swal2-title').should('contain', 'Deleted');
  });

  it('cancels deletion on Cancel', () => {
    cy.get('table tbody tr').first().find('a[onclick*="delete"]').click();
    cy.get('.swal2-cancel').click();
    cy.get('.swal2-popup').should('not.exist');
  });
});
```

### Permission-Based Access Control

```js
describe('E2E: Permission-Based Access Control', () => {
  it('hides sidebar items limited user lacks access to', () => {
    cy.login('limiteduser', 'password123');
    cy.visit('/');
    cy.get('#navbar-nav').should('contain', 'Items');
    cy.get('#navbar-nav').should('not.contain', 'Users');
    // Worker role does not see Dashboard (menu.php line 50)
    cy.get('#navbar-nav').should('not.contain', 'Dashboard');
  });

  it('redirects to home on accessing restricted route directly', () => {
    cy.login('limiteduser', 'password123');
    cy.visit('/user', { failOnStatusCode: false });
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });

  it('hides Delete button for users without item_delete permission', () => {
    cy.login('limiteduser', 'password123');
    cy.visit('/item-creation');
    cy.get('table tbody tr').first().within(() => {
      cy.get('a[onclick*="delete"]').should('not.exist');
    });
  });
});
```

### Error Recovery

```js
describe('E2E: Network Error Recovery', () => {
  beforeEach(() => { cy.login('testuser', 'password123'); });

  it('shows Error toast when crud.php returns msg:"error"', () => {
    cy.intercept('POST', '**/folders/item_creation/crud.php', {
      statusCode: 200,
      body: { status: 0, msg: 'error' },
    }).as('failedRequest');
    cy.visit('/item-creation');
    cy.wait('@failedRequest');
    cy.get('.swal2-title').should('contain', 'Error');
  });

  it('redirects to /login when PHP returns HTML (session expired)', () => {
    cy.intercept('POST', '**/folders/item_creation/crud.php', {
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: '<html><body>Login form</body></html>',
    });
    cy.visit('/item-creation');
    cy.url().should('include', '/login');
  });
});
```

---

## 6. Accessibility Testing

```bash
npm i -D jest-axe
npm i -D cypress-axe
```

### Component A11y Tests

```js
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('A11y: Login Component', () => {
  test('has no WCAG violations', async () => {
    const { container } = render(<Login />);
    expect(await axe(container)).toHaveNoViolations();
  });

  test('password field has label', () => {
    render(<Login />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('submit button has accessible name', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});

describe('A11y: DataTable Component', () => {
  test('has no WCAG violations', async () => {
    const { container } = render(
      <DataTable columns={[{ key: 'item_name', label: 'Item Name' }]}
        label="Items List" ajaxUrl="folders/item_creation/crud.php" ajaxAction="datatable" />
    );
    await screen.findByText('Item A');
    expect(await axe(container)).toHaveNoViolations();
  });

  test('table has aria-label', () => {
    render(
      <DataTable columns={[{ key: 'item_name', label: 'Item Name' }]}
        label="Items List" ajaxUrl="folders/item_creation/crud.php" ajaxAction="datatable" />
    );
    expect(screen.getByRole('table', { name: /items list/i })).toBeInTheDocument();
  });
});
```

### Cypress A11y Tests

```js
describe('E2E A11y: Page-Level', () => {
  it('Login page has no WCAG violations', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y(null, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
  });

  it('Item Creation list page has no WCAG violations', () => {
    cy.login('testuser', 'password123');
    cy.visit('/item-creation');
    cy.injectAxe();
    cy.checkA11y(null, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
  });
});
```

---

## 7. Mock & Fixture Strategy

### MSW Server Setup

```js
// __tests__/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

```js
// vitest.setup.js
import { server } from './__tests__/mocks/server';
import '@testing-library/jest-dom';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Item Factory

```js
// __tests__/mocks/factories/itemFactory.js
let counter = 100;
export const createItem = (overrides = {}) => ({
  unique_id: `uid-${++counter}`,
  item_code: `IT-${String(counter).padStart(3, '0')}`,
  item_name: `Test Item ${counter}`,
  unit: 'kg-uid',
  is_active: 1,
  is_delete: 0,
  ...overrides,
});
```

---

## 8. Test Execution Strategy

### Vitest Config

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 80, functions: 80, branches: 75 },
      exclude: ['**/__tests__/**', '**/node_modules/**'],
    },
  },
});
```

### Cypress Config

```js
// cypress.config.js
export default {
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
  },
};
```

### NPM Scripts (add to frontend/package.json)

```json
{
  "test":          "vitest run",
  "test:watch":    "vitest",
  "test:coverage": "vitest run --coverage",
  "cy:open":       "cypress open",
  "cy:run":        "cypress run"
}
```

---

## 9. Test Maintenance & Best Practices

### Ponytail Rules for Tests

- No test-specific abstractions unless used in 3+ test files
- No deep component mocking — prefer MSW at the network layer
- Test behavior the user sees, not internal component state
- Do not test third-party libraries (SweetAlert2, Axios internals)
- Avoid CSS class name assertions (fragile)

### Avoiding Flaky Tests

```js
// Bad - timing-dependent
await new Promise(r => setTimeout(r, 500));
expect(screen.getByText('Saved')).toBeInTheDocument();

// Good - waits for DOM change
await waitFor(() => {
  expect(screen.getByText('Saved')).toBeInTheDocument();
});
```

### Test Data Independence

- Each test creates its own data via factories
- MSW resets between tests (`afterEach(() => server.resetHandlers())`)
- Never rely on test execution order

---

## 10. Success Metrics & KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Unit test coverage | >= 80% lines | `vitest --coverage` |
| Integration coverage (critical paths) | >= 90% | Manual checklist |
| E2E pass rate | 100% on clean run | `cypress run` exit code |
| Flaky test rate | < 2% | Track re-runs in CI |
| A11y violations | 0 blocking | jest-axe + cypress-axe |
| Unit suite time | < 5 min | CI timer |
| E2E suite time | < 15 min | CI timer |

### Critical Paths That Must Have Test Coverage

1. Login -> Dashboard navigation
2. Permission-gated sidebar rendering
3. Item full CRUD cycle (create -> list -> edit -> delete)
4. SweetAlert2 toast for every `msg` value
5. Session expired -> redirect to /login
6. Worker role (`6213273aa04b228161`) dashboard hiding (menu.php line 50)

---

## 11. Risk Assessment & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PHP session vs MSW mismatch | High | Medium | Create `get_profile` action in `login/crud.php`; mock in MSW |
| DataTable `data[]` has pre-rendered HTML strings | High | High | Fix crud.php datatable to return raw values; render buttons in React |
| SweetAlert2 popups not queryable in jsdom | Medium | Medium | Use `document.querySelector('.swal2-title')` or mock Swal in unit tests |
| MSW handlers go stale as crud.php evolves | Low | High | Integration tests call real backend in CI staging env |
| QR code generation requires PHP backend | Medium | Low | Mock `qr_generator.php`; optionally use `qrcode` JS library |

---

## 12. CI/CD Pipeline Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: frontend
      - run: npm test -- --coverage
        working-directory: frontend
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: frontend/coverage/

  e2e:
    runs-on: ubuntu-latest
    needs: unit-integration
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: frontend
      - run: npm run dev &
        working-directory: frontend
      - run: npx wait-on http://localhost:5173
      - run: npm run cy:run
        working-directory: frontend
```

---

## 13. Appendix

### A. `disname` JS Port (src/utils/disname.js)

```js
// ponytail: direct port of PHP disname() — 1 line
export const disname = (s) =>
  s ? s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
```

### B. SweetAlert2 Toast Map (derived from login.js)

| `msg` value | Icon | Title |
|------------|------|-------|
| `create` | success | Successfully Saved |
| `update` | success | Successfully Updated |
| `success_delete` | success | Deleted! |
| `already` | warning | Already Exist |
| `error` | error | Error Occurred |
| `incorrect` | error | Incorrect UserName and Password |
| `empty` | info | Enter Username and Password! |
| `approve` | success | Successfully Approved |
| `convert` | success | Successfully Converted |
| `form_alert` | info | Fill Out All Mandatory Fields |

### C. Session Variables Set at Login (login/crud.php lines 50-78)

| Variable | Description |
|----------|-------------|
| `$_SESSION['user_id']` | User unique ID |
| `$_SESSION['user_name']` | Username string |
| `$_SESSION['sess_user_type']` | Role unique ID |
| `$_SESSION['main_screens']` | Array of permitted main menu IDs |
| `$_SESSION['sections']` | Array of permitted section IDs |
| `$_SESSION['screens']` | Array of permitted screen/action IDs |
| `$_SESSION['user_image']` | Path to profile image |
| `$_SESSION['acc_year']` | Financial year (e.g., "2025-2026") |
| `$_SESSION['sess_company_id']` | Fixed company ID |
| `$_SESSION['sess_branch_id']` | Fixed branch ID |

---

## 14. UI Enhancement — Technical Design

> Added 2026-07-01, corresponds to PRD_React_Migration.md §12.2. This section only adds test/architecture guidance for the redesign; it does not replace Sections 1–13, which still govern the underlying page/component structure.

### 14.1 Design System

- Single source of truth: `DESIGN.md` (tokens: colors, spacing, typography). No component may hardcode a hex color — reference the CSS custom properties defined there (`--color-primary`, `--bg-card`, etc.).
- `frontend/src/utils/chartTheme.js` is the only place ApexCharts color arrays are defined; chart components import from it instead of inlining colors (see `OverallStatusChart.jsx`, `PitStatusChart.jsx`).

### 14.2 Component Architecture

- Redesign is additive/in-place: existing components (`DataTable`, `FormInput`, `Sidebar`, `Header`, etc. — Section 5 of the PRD) get restyled, not rewritten, unless a component's structure can't express the new layout.
- New shared primitives only when a pattern repeats 3+ times (ponytail rule already in force per Migration Tracker "Key Constraints"): e.g. a `Card` wrapper if glass-card styling is currently copy-pasted across pages.

### 14.3 Theme Implementation / Dark Mode

- `ThemeContext.jsx` + `useTheme.js` (already scaffolded in `frontend/src/context/` and `frontend/src/hooks/`) provide `{ theme, toggleTheme }`; persisted via `localStorage`.
- `darkmode.css` holds the dark-theme variable overrides layered on top of `DESIGN.md` tokens; light mode is the default `:root` values.
- **Test**: a component test asserting `toggleTheme()` flips the `data-theme` attribute on `<html>`/`<body>` and persists across reload (mock `localStorage`).

### 14.4 Dashboard Redesign

- Chart components (`OverallStatusChart.jsx`, `PitStatusChart.jsx`) must re-render with correct colors when theme changes — covered by a component test that toggles theme and asserts the series color prop passed to ApexCharts matches `chartTheme.js` output for that theme.

### 14.5 Responsive Strategy

- Extends the responsive QA already completed in Phase 1 (TASK-040, Section 8 above). New breakpoints introduced by the redesign must be added to `RESPONSIVE_CHECKLIST.md` / `useResponsive.js`, not a parallel system.

### 14.6 Accessibility Improvements

- No regression vs. the Phase 1 accessibility audit (Section 6/7 above). Dark theme contrast ratios (text on `--bg-card`, `--bg-main`) must meet WCAG AA — add an axe/jest-axe check per redesigned page, same pattern as Section 6.

### 14.7 Animation & Interaction Guidelines

- Motion only via CSS transitions/`prefers-reduced-motion`-aware rules; no new animation dependency (a small utility class set is enough — see ponytail rule, no library needed for hover/fade/slide transitions).
- Animations are not asserted in tests (flaky); only the resulting DOM state (class toggled, element visible) is tested.

---

## 15. Django Backend — Technical Design

> Updated 2026-07-02, corresponds to PRD_React_Migration.md §12.3 and TECH_STACK.md. This is a **greenfield Django + MongoDB Atlas build**, not a migration from the legacy MySQL/PHP stack — legacy PHP is reference material only. Testing strategy uses Django's standard tooling (`pytest-django` or `unittest` + DRF `APITestCase`), separate from the Vitest/Cypress stack above, which continues to cover the React side. Hands-on setup steps live in `BACKEND_START.md`.

### 15.1 Project Architecture

- Single Django project (`backend/`) with one app per business domain, mirroring the module groupings already in PRD §6.5: `accounts` (user/user_type/permissions), `inventory` (item/tray/pit/unit/supplier), `process` (screening/egg/culling/oven/dry/leachate/material_received/status_update/pit_status/frp_*), `reports` (logsheet/dc/measurable/*_report), `core` (main_screen, menu).
- **Database engine: MongoDB Atlas**, accessed via **MongoEngine** ODM (not Django's default ORM/`DATABASES` setting — see `TECH_STACK.md` "Database Stack" and `BACKEND_START.md` step 2 for the `mongoengine.connect()` wiring in `settings.py`).

### 15.2 Folder Structure

```
backend/
├── manage.py
├── config/                 # settings.py, urls.py, wsgi/asgi
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
├── accounts/                # models, serializers, views, urls, tests
├── inventory/
├── process/
├── reports/
├── core/
└── requirements/
    ├── base.txt
    └── dev.txt
```

### 15.3 Models

- One MongoEngine `Document` per business entity identified from the legacy PHP reference (Glossary, PRD §11) — e.g. `Item`, `Tray`, `Pit`, `User` (see `BACKEND_START.md` for worked `Document` schemas). `unique_id` (`StringField`, indexed, `default=lambda: str(uuid.uuid4())`) is kept as the primary lookup key for compatibility with the business rules observed in legacy PHP; MongoDB's own `_id` remains the underlying document key. Soft-delete (`is_deleted`, `BooleanField(default=False)`) is filtered via a custom `QuerySet`/manager pattern, matching the `is_delete = 0` convention seen in legacy PHP but implemented natively in MongoEngine (not inherited from any PHP code).
- Relationships use MongoEngine's `ReferenceField` (e.g. `Item.unit = ReferenceField(Unit)`) rather than SQL foreign keys; denormalize fields onto the parent document where a join would otherwise be needed on every list-page read (e.g. store `unit_name` directly on `Item` if it's always displayed alongside the item).

### 15.4 API Design

- DRF `ViewSet` (custom, MongoEngine-backed — `ModelViewSet` assumes Django ORM `QuerySet`s, so `list`/`create`/`destroy` are overridden explicitly per `BACKEND_START.md`'s `ItemViewSet` reference) per resource, routed via `DefaultRouter` — e.g. `/api/items/`, `/api/items/{id}/`. Server-side pagination/search implemented manually against MongoEngine querysets (`queryset[start:start+length]`, `Q()` filters) since `django-filter`/`PageNumberPagination` assume the Django ORM; response shape stays row/JSON-compatible with `DataTable.jsx` (Section 3.3 pattern) so the frontend component doesn't need a parallel rewrite.
- Business rules identified by reading legacy `crud.php` as reference (duplicate `item_name` check, `IT-` prefix auto-code generation) are reimplemented from scratch in `serializer.create()` / `validate()` — see `BACKEND_START.md` `ItemSerializer.create()` for the worked example.

### 15.5 Authentication

- DRF `TokenAuthentication` (simplest for a cross-origin Vercel frontend → containerized Django API) or JWT (`djangorestframework-simplejwt`) if refresh-token rotation is needed. Session auth is not used since frontend (Vercel) and backend (Docker/cloud) are different origins in production — see `TECH_STACK.md` "Authentication & Authorization".
- Login endpoint (`POST /api/auth/login`) returns `{access_token, user: {unique_id, user_name, user_type, screens, main_screens}}` in one response — see `BACKEND_START.md` step 6 for the reference `login()` view. This closes KI-002 from the Migration Tracker by design (no separate `get_profile` call needed).

### 15.6 Permissions

- Custom DRF permission class checking the requesting user's `screens` (returned in the login response / token claims) against the requested resource/action — same semantics as `usePermission()` on the frontend (PRD §2.3), enforced server-side. This is a real capability gap vs. legacy PHP (which had no server-side permission enforcement beyond UI visibility), closed by design in the greenfield build rather than retrofitted.

### 15.7 Database Schema (MongoDB Atlas)

- No traditional "migration" step — MongoEngine `Document` classes ARE the schema (schema-on-write via field validators, not a separate migrations directory). Collections are created lazily on first write, or explicitly via `Document.ensure_indexes()` at deploy time.
- **No legacy data import.** Since this is a greenfield build (not a data migration from the legacy MySQL DB), initial data is seeded via a Django management command (`python manage.py seed_data`) or Django admin/fixtures, using legacy PHP's table structure purely as a reference for what fields exist — no automated MySQL→MongoDB ETL is planned or needed.
- Indexing strategy: compound indexes on `unique_id`, frequently-searched fields (`item_name`, `item_code`), and `-created_at` for list-view sort order — declared in each `Document`'s `meta = {'indexes': [...]}` (see `BACKEND_START.md` model examples).

### 15.8 Service Layer

- Business logic (auto-code generation, cross-module validation) lives in a `services.py` per app, called from serializers/views — not duplicated across viewsets, mirroring the "one place per rule" principle already used in the PHP `comfun.php`.

### 15.9 Error Handling

- DRF's standard exception handling + a custom exception handler mapping to the existing toast vocabulary (`create`, `update`, `already`, `error`, `success_delete` — Appendix B above) so the frontend's `client.js` interceptor keeps working unmodified during the transition.

### 15.10 Logging

- Standard Django `logging` config (console in dev, file/rotating handler in prod) — no new logging framework; structured logging (e.g. `python-json-logger`) only if log aggregation in production actually requires it (Phase 4).

### 15.11 Testing Strategy

| Test | Type | Tool |
|------|------|------|
| Model validation (soft delete, `unique_id` uniqueness, required fields) | Unit | `pytest-django` + `mongoengine` test connection (mongomock or a local Dockerized MongoDB) |
| Serializer validation (duplicate name, auto-code generation) | Unit | `pytest-django` |
| ViewSet CRUD + permission enforcement | Integration | DRF `APITestCase` |
| Auth flow (login, token issuance, protected route rejection without token) | Integration | DRF `APITestCase` |
| Business-rule parity vs. legacy PHP reference behavior (e.g. `IT-001` code format, duplicate-name rejection) | Contract | Compare Django API responses against documented legacy behavior (PRD §3.3) — not a live PHP comparison, since PHP is reference-only and not running against the same data |

See `BACKEND_START.md` "Test Example (pytest-django)" for a working `TestLogin` / `TestItemCRUD` reference.

### 15.12 Security Considerations

- Directly resolves PRD §9, built in from the start rather than retrofitted: Django's `make_password()`/`check_password()` (PBKDF2/bcrypt) replaces legacy PHP's plaintext storage; MongoEngine's parameterized queries eliminate the injection risk that existed in legacy PHP's string-concatenated SQL; CORS restricted to known frontend origins (dev `localhost:5173` + Vercel prod URL) via `django-cors-headers`; secrets (`SECRET_KEY`, `MONGODB_URI`) via environment variables only, never committed — see `TECH_STACK.md` "Environment Variables".

---

*End of TDD Blueprint. All test examples use Vitest (Vite-based project) for the React frontend (Sections 1–14) and pytest-django/DRF APITestCase for the Django backend (Section 15). Section 15 describes a greenfield Django + MongoDB Atlas build (see TECH_STACK.md and BACKEND_START.md) that uses the legacy PHP source in `legacy/` as a business-logic reference only — no PHP code or MySQL data is migrated.*
