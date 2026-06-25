# Zigma ERP — React Migration PRD v2

*Version 2.0 · 2026-06-25 · Prepared for the Frontend Migration Developer*

---

## 1. Executive Summary

### 1.1 Business Objective

Migrate the Zigma ERP frontend from server-rendered PHP/jQuery to a React 19 SPA while maintaining 100% feature parity with the existing application. The PHP backend will continue to serve as the data layer via AJAX endpoints (`folders/*/crud.php`).

### 1.2 Success Metrics

| Metric | Target |
|--------|--------|
| Feature parity with legacy | 100% |
| Lighthouse Performance Score | ≥ 85 |
| Time to Interactive (TTI) | < 3s |
| Bundle size (gzipped, initial) | < 250 KB |
| All CRUD workflows functional | Yes |
| Permission-gated navigation | Yes |

### 1.3 Timeline (single developer)

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| 1 — Setup & Assets | 1 week | Vite scaffold, Velzon imports, project structure |
| 2 — Auth & Layout | 2 weeks | Login, AuthContext, MainLayout, Sidebar, Header |
| 3 — Core CRUD | 3 weeks | Items, Trays, Pits, Units, Suppliers, Users |
| 4 — Process Modules | 4 weeks | Screening, Egg, Culling, Oven, Dry, Leachate, Status Update, etc. |
| 5 — Reports & Dashboard | 2 weeks | Dashboard charts, login history, pit/measurable reports |
| 6 — Testing & Polish | 2 weeks | E2E, edge cases, responsive QA |
| Buffer | 2 weeks | Integration fixes, scope creep |
| **Total** | **~16 weeks** | |

### 1.4 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| PHP CRUD endpoints return HTML fragments instead of JSON | Medium | High | Audit each `crud.php`; most already return `json_encode()` — verify & fix before page migration |
| Permission arrays not returned at login | Low | Critical | Already returned in login response (`menu_permission()`) — verify field completeness |
| Session-based auth vs. SPA token needs | High | High | Keep PHP sessions; React will call same-origin `crud.php` endpoints that rely on `$_SESSION` set at login |
| Large bundle from icon fonts | Medium | Medium | Import icon CSS globally; code-split page-level JS |
| Legacy jQuery scripts still loaded | Low | Low | Not loaded in React app; all interactivity reimplemented in React |

---

## 2. Architecture & Patterns

### 2.1 System Architecture

```
┌─────────────────────────────┐
│  React 19 SPA (Vite)        │
│  react-router-dom v7        │
│  Axios → same-origin AJAX   │
│  Velzon/Bootstrap CSS       │
└──────────────┬──────────────┘
               │  POST to folders/*/crud.php
               │  (same-origin, session cookie)
┌──────────────▼──────────────┐
│  Existing PHP Backend       │
│  index.php + body.php       │
│  config/dbconfig.php (PDO)  │
│  config/comfun.php (helpers)│
│  folders/*/crud.php         │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  MySQL (zigfly_erp)         │
│  192.168.1.200              │
└─────────────────────────────┘
```

**Key insight**: The PHP backend already returns JSON from most CRUD endpoints (via `echo json_encode($json_array)`). The React app will POST to these same `crud.php` files with `action` parameters, identical to how the jQuery `$.ajax()` calls work today. **No new REST API layer is needed initially.**

### 2.2 Authentication Flow (Session-Based, Not JWT)

The existing system uses PHP sessions. Since the React app is served from the same origin, it shares the session cookie automatically.

```
Login flow:
1. React LoginPage POSTs {action:"login", user_name, password}
   → folders/login/crud.php
2. PHP sets $_SESSION (user_id, sess_user_type, main_screens, screens, etc.)
3. PHP returns JSON: {status:1, msg:"success_login"}
4. React stores user profile in AuthContext (from a follow-up /api/me call or from the login response itself)
5. All subsequent Axios calls include the session cookie automatically
```

**AuthContext state shape** (derived from `login/crud.php` lines 50–73):

```jsx
// src/context/AuthContext.jsx
const defaultAuth = {
  isAuthenticated: false,
  user: null,
  // user shape when logged in:
  // {
  //   userId:        string,  // $_SESSION['user_id']
  //   userName:      string,  // $_SESSION['user_name']
  //   userType:      string,  // $_SESSION['sess_user_type'] e.g. "6213273aa04b228161"
  //   userImage:     string,  // $_SESSION['user_image']
  //   companyName:   string,  // "Zigma Global Environ Solutions Private Limited"
  //   mainScreens:   string[],// sidebar parent nodes allowed
  //   sections:      string[],// section-level permission IDs
  //   screens:       string[],// page/action-level permission IDs
  // }
};
```

### 2.3 Permission Gating (Derived from `inc/menu.php`)

The sidebar is built dynamically:

1. `main_screen()` returns all parent menu nodes from the `main_screen` DB table.
2. Only nodes whose `unique_id` exists in `$_SESSION['main_screens']` are rendered.
3. Under each parent, `user_screen('', main_value['unique_id'])` returns child screens.
4. Only children whose `unique_id` exists in `$_SESSION['screens']` are rendered.
5. A special check: if `sess_user_type == '6213273aa04b228161'`, the Dashboard link is hidden (this appears to be a worker-type role that skips the dashboard).

React implementation:

```jsx
// src/hooks/usePermission.js
export function usePermission(screenId) {
  const { user } = useAuth();
  if (!user) return false;
  return user.screens.includes(screenId);
}

// Usage in Sidebar.jsx
{user.mainScreens.includes(mainScreen.unique_id) && (
  <SidebarGroup label={mainScreen.screen_main_name} icon={mainScreen.icon_name}>
    {subScreens
      .filter(s => user.screens.includes(s.unique_id))
      .map(s => <SidebarLink key={s.unique_id} to={`/${s.folder_name}/list`} label={s.screen_name} />)
    }
  </SidebarGroup>
)}
```

### 2.4 Routing Architecture

**Legacy routing** (from `body.php`): `index.php?file={folder}/{action}` where `action` is `list`, `form`, `view`, `update`, etc.

**React Router mapping:**

| Legacy Route | React Path | Component | Permission Screen ID |
|-------------|-----------|-----------|---------------------|
| `login/login` | `/login` | `Login.jsx` | — (public) |
| `dashboard/form` (default) | `/` | `Dashboard.jsx` | `dashboard` |
| `item_creation/list` | `/item-creation` | `ItemCreationList.jsx` | screen ID from DB |
| `item_creation/form` | `/item-creation/new` | `ItemCreationForm.jsx` | screen ID from DB |
| `item_creation/form&unique_id=X` | `/item-creation/:id/edit` | `ItemCreationForm.jsx` | screen ID from DB |
| `tray_creation/list` | `/tray-creation` | `TrayCreationList.jsx` | screen ID from DB |
| `tray_creation/form` | `/tray-creation/new` | `TrayCreationForm.jsx` | screen ID from DB |
| `unit_creation/list` | `/unit-creation` | `UnitCreationList.jsx` | screen ID from DB |
| `supplier_creation/list` | `/supplier-creation` | `SupplierCreationList.jsx` | screen ID from DB |
| `pit_creation/list` | `/pit-creation` | `PitCreationList.jsx` | screen ID from DB |
| `user/list` | `/user` | `UserList.jsx` | screen ID from DB |
| `user_type/list` | `/user-type` | `UserTypeList.jsx` | screen ID from DB |
| `user_permission/list` | `/user-permission` | `UserPermissionList.jsx` | screen ID from DB |
| `user_screen/list` | `/user-screen` | `UserScreenList.jsx` | screen ID from DB |
| `screening_process/list` | `/screening-process` | `ScreeningProcessList.jsx` | screen ID from DB |
| `egg_process/list` | `/egg-process` | `EggProcessList.jsx` | screen ID from DB |
| `culling_process/list` | `/culling-process` | `CullingProcessList.jsx` | screen ID from DB |
| `oven_process/list` | `/oven-process` | `OvenProcessList.jsx` | screen ID from DB |
| `dry_process/list` | `/dry-process` | `DryProcessList.jsx` | screen ID from DB |
| `leachate/list` | `/leachate` | `LeachateList.jsx` | screen ID from DB |
| `material_received/list` | `/material-received` | `MaterialReceivedList.jsx` | screen ID from DB |
| `status_update/form` | `/status-update` | `StatusUpdateForm.jsx` | screen ID from DB |
| `pit_status/list` | `/pit-status` | `PitStatusList.jsx` | screen ID from DB |
| `frp_tray_process/list` | `/frp-tray-process` | `FrpTrayProcessList.jsx` | screen ID from DB |
| `frp_status_update/list` | `/frp-status-update` | `FrpStatusUpdateList.jsx` | screen ID from DB |
| `logsheet/list` | `/logsheet` | `LogsheetList.jsx` | screen ID from DB |
| `login_history/list` | `/login-history` | `LoginHistoryList.jsx` | screen ID from DB |
| `dc/list` | `/dc` | `DcList.jsx` | screen ID from DB |
| `measurable/list` | `/measurable` | `MeasurableList.jsx` | screen ID from DB |
| `measurable_report/list` | `/measurable-report` | `MeasurableReportList.jsx` | screen ID from DB |
| `egg_process_report/list` | `/egg-process-report` | `EggProcessReportList.jsx` | screen ID from DB |
| `pit_status_report/list` | `/pit-status-report` | `PitStatusReportList.jsx` | screen ID from DB |
| `rejects_report/list` | `/rejects-report` | `RejectsReportList.jsx` | screen ID from DB |
| `rejects_image_upload/list` | `/rejects-image-upload` | `RejectsImageUploadList.jsx` | screen ID from DB |
| `main_screen/list` | `/main-screen` | `MainScreenList.jsx` | screen ID from DB |
| `logout.php` | (action, not route) | N/A — handled by `AuthContext.logout()` | — |

> **Needs Verification**: The exact `unique_id` values for each screen must be fetched from the `user_screen` and `main_screen` database tables to populate the sidebar dynamically.

```jsx
// src/routes.jsx
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'item-creation',         element: <ItemCreationList /> },
      { path: 'item-creation/new',     element: <ItemCreationForm /> },
      { path: 'item-creation/:id/edit',element: <ItemCreationForm /> },
      { path: 'tray-creation',         element: <TrayCreationList /> },
      { path: 'tray-creation/new',     element: <TrayCreationForm /> },
      { path: 'tray-creation/:id/edit',element: <TrayCreationForm /> },
      // ... all 33 module folders follow same pattern
      { path: '*', element: <NotFound /> },
    ],
  },
]);
```

---

## 3. API Contract Specification

### 3.1 How the Existing Backend Works

Every module's `crud.php` accepts a POST with an `action` field and returns JSON. This is the universal contract:

```
POST  folders/{module}/crud.php
Content-Type: application/x-www-form-urlencoded

action={action_name}&field1=value1&field2=value2...

Response: { status, data, error, msg, sql }
```

The `msg` field drives the SweetAlert2 notification:
- `"create"` → success toast "Successfully Saved"
- `"update"` → success toast "Successfully Updated"
- `"success_delete"` → success toast "Deleted!"
- `"already"` → warning toast "Already Exist"
- `"error"` → error toast "Error Occurred"
- `"incorrect"` → error toast (login only)
- `"empty"` → info toast (login only)

### 3.2 Login Endpoint

**`POST folders/login/crud.php`** (derived from `login/crud.php` lines 28–118)

```
Request:
  action=login
  user_name=<string>
  password=<string>   // plaintext (legacy — no hashing)

Response (success):
  { status: 1, data: 1, error: 0, msg: "success_login", sql: "<user_id>" }

Response (wrong credentials):
  { status: 0, data: 1, error: 0, msg: "incorrect", sql: "" }
```

Side effects on success: PHP sets 20+ `$_SESSION` variables including `user_id`, `user_name`, `sess_user_type`, `main_screens[]`, `sections[]`, `screens[]`, company details, and user image path.

**Post-login**: The React app needs the user profile. Options:
1. **Build a new `action: 'get_profile'`** in `login/crud.php` that returns the session data as JSON.
2. **Or**: Extend the login response to include all user data inline.

Recommended: Option 1 — add a `get_profile` action.

### 3.3 Item Creation CRUD (Representative Module)

**Table**: `item_creation` · **Endpoint**: `POST folders/item_creation/crud.php`

#### action: `datatable`
Server-side pagination for DataTables. POST fields:
```
action=datatable
search[value]=<string>
length=<number>         // page size (-1 for all)
start=<number>          // offset
draw=<number>           // DataTables sequence counter
active_status=<"0"|"1"|"all">
```

Response:
```json
{
  "draw": 1,
  "recordsTotal": 120,
  "recordsFiltered": 120,
  "data": [
    [1, "IT-001", "Item Name", "Kg", "<span style='color: green'>Active</span>", "<a href='...'>edit</a><a href='...'>delete</a>"]
  ]
}
```

> **Migration Note**: The `data` array contains pre-rendered HTML strings for status badges and action buttons. The React DataTable must parse or re-generate these. Recommended: request raw data and render buttons client-side.

#### action: `createupdate`
```
action=createupdate
item_name=<string>      // required
unit=<string>           // unit unique_id (FK to unit_creation table)
active_status=<0|1>
unique_id=<string>      // empty for create, populated for update
```

Response:
```json
{ "status": 1, "data": ..., "error": "", "msg": "create", "sql": "..." }
// or msg: "update" for edits
// or msg: "already" if item_name already exists
```

Business rules (from `item_creation/crud.php`):
- `item_code` is auto-generated with prefix `IT-` and sequential numbering (e.g., `IT-001`, `IT-002`).
- Duplicate check: `item_name` must be unique among non-deleted records.
- Soft delete: `is_delete = 0` filter everywhere.

#### action: `delete`
```
action=delete
unique_id=<string>
```
Response: `{ status: 1, msg: "success_delete" }` — performs soft delete (`is_delete = 1`).

### 3.4 Sidebar Menu Data

The sidebar requires two data sources not currently exposed as standalone endpoints:

1. **Main screens**: `main_screen()` function in `comfun.php` queries the `main_screen` table.
2. **Sub screens**: `user_screen()` function queries the `user_screen` table filtered by `main_screen_unique_id`.

**Recommended**: Create a new `folders/menu/crud.php` with `action: 'get_menu'` that returns the full menu tree filtered by the current session's permissions. Response shape:

```json
{
  "mainScreens": [
    {
      "unique_id": "ms_001",
      "screen_main_name": "inventory",
      "icon_name": "ri-box-3-fill",
      "children": [
        { "unique_id": "sc_001", "screen_name": "item_creation", "folder_name": "item_creation", "icon_name": "" },
        { "unique_id": "sc_002", "screen_name": "tray_creation", "folder_name": "tray_creation", "icon_name": "" }
      ]
    }
  ]
}
```

### 3.5 Error Response Standardization

All `crud.php` files return the same shape:
```json
{
  "status": 0 | 1,
  "data": any,
  "error": string,
  "msg": "create" | "update" | "error" | "already" | "success_delete" | ...,
  "sql": string  // debug only, strip in production
}
```

React Axios interceptor should map `msg` values to SweetAlert2 toasts (replicating `login.js` `log_sweetalert()` logic).

---

## 4. Error Handling & Recovery Strategy

### 4.1 Axios Client Setup

```jsx
// src/api/client.js
import axios from 'axios';
import Swal from 'sweetalert2';

const client = axios.create({
  baseURL: '',  // same-origin
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  withCredentials: true,  // send session cookie
});

// ponytail: response interceptor handles the universal {msg} toast pattern
client.interceptors.response.use(
  (res) => {
    const msg = res.data?.msg;
    if (msg && msg !== 'success_login') showToast(msg);
    return res;
  },
  (err) => {
    if (!err.response) {
      Swal.fire({ icon: 'error', title: 'Network Error', timer: 2000 });
    } else if (err.response.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

function showToast(msg) {
  const map = {
    create:         { icon: 'success', title: 'Successfully Saved' },
    update:         { icon: 'success', title: 'Successfully Updated' },
    success_delete: { icon: 'success', title: 'Deleted!' },
    already:        { icon: 'warning', title: 'Already Exists' },
    error:          { icon: 'error',   title: 'Error Occurred' },
    incorrect:      { icon: 'error',   title: 'Incorrect Username or Password' },
    empty:          { icon: 'info',    title: 'Fill Out All Mandatory Fields' },
    approve:        { icon: 'success', title: 'Successfully Approved' },
    convert:        { icon: 'success', title: 'Successfully Converted' },
  };
  const cfg = map[msg];
  if (cfg) Swal.fire({ ...cfg, timer: 2000, timerProgressBar: true, showConfirmButton: true });
}

export default client;
```

### 4.2 Delete Confirmation Pattern

The legacy system uses SweetAlert2 confirm dialogs before delete. Replicate:

```jsx
// src/utils/confirmDelete.js
import Swal from 'sweetalert2';

export async function confirmDelete() {
  const result = await Swal.fire({
    title: 'Are you sure to Delete?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  });
  return result.isConfirmed;
}
```

### 4.3 Common Error Scenarios

| Scenario | Backend Response | React Action |
|----------|-----------------|-------------|
| Duplicate item name | `{ msg: "already" }` | Show warning toast, keep form open |
| Validation empty fields | Client-side check | Show inline errors, don't submit |
| Session expired | HTTP 302 redirect or HTML login page | Detect non-JSON response, redirect to `/login` |
| Network offline | No response | Show "Network Error" toast |
| Server error | `{ msg: "error" }` | Show error toast |

---

## 5. Component Library

### 5.1 Project File Structure

```
frontend/src/
├── api/
│   └── client.js              // Axios instance with interceptors
├── assets/                    // Velzon CSS, fonts, images, libs (already ported)
├── components/
│   ├── Layout/
│   │   ├── MainLayout.jsx     // Sidebar + Header + <Outlet />
│   │   ├── Header.jsx         // Top navbar with user dropdown
│   │   ├── Sidebar.jsx        // Dynamic permission-based menu
│   │   └── Footer.jsx         // Copyright bar
│   ├── DataTable.jsx          // Wrapper for list views
│   ├── FormInput.jsx          // Labeled input with error display
│   ├── FormSelect.jsx         // Labeled <select> with options
│   ├── Modal.jsx              // Bootstrap modal wrapper
│   ├── ActionButtons.jsx      // Edit/Delete/View/Print icon buttons
│   ├── ActiveBadge.jsx        // Green "Active" / Red "Inactive" badge
│   └── ProtectedRoute.jsx     // Auth + permission guard
├── context/
│   └── AuthContext.jsx        // User state, login/logout methods
├── hooks/
│   ├── useAuth.js             // Shortcut to AuthContext
│   └── usePermission.js       // Check screen ID permission
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── ItemCreation/
│   │   ├── ItemCreationList.jsx
│   │   └── ItemCreationForm.jsx
│   ├── TrayCreation/
│   │   ├── TrayCreationList.jsx
│   │   └── TrayCreationForm.jsx
│   ├── ... (one folder per module)
│   ├── NotFound.jsx
│   └── Unauthorized.jsx
├── utils/
│   ├── confirmDelete.js
│   └── disname.js             // Port of PHP disname() — converts snake_case to Title Case
├── routes.jsx
├── main.jsx
└── index.css
```

### 5.2 Key Component Props

**DataTable.jsx**

```jsx
// Props:
// columns: [{ key, label, render? }]
// ajaxUrl: string (the crud.php path)
// ajaxAction: string (e.g., "datatable")
// extraParams: object (e.g., { active_status: "all" })
// onEdit: (uniqueId) => void
// onDelete: (uniqueId) => void
// onView?: (uniqueId) => void

// Internally:
// - POSTs to ajaxUrl with DataTables-compatible params
// - Handles search, pagination, sorting
// - Renders action buttons per row using ActionButtons component
```

**FormInput.jsx**

```jsx
// Props:
// label: string
// name: string
// value: string
// onChange: (e) => void
// type?: "text" | "number" | "date" | "password"
// required?: boolean
// error?: string
// disabled?: boolean
```

**FormSelect.jsx**

```jsx
// Props:
// label: string
// name: string
// value: string
// onChange: (e) => void
// options: [{ value, label }]
// required?: boolean
// error?: string
// placeholder?: string  // "Select" by default (matching PHP select_option())
```

**ProtectedRoute.jsx**

```jsx
// Props:
// children: ReactNode
// requiredScreens?: string[]  // optional screen IDs to check

// Logic:
// 1. If not authenticated → redirect to /login
// 2. If requiredScreens provided and user lacks any → redirect to /unauthorized
// 3. Otherwise render children
```

### 5.3 Component Hierarchy

| Component | Parent | Data Source | Key Events |
|-----------|--------|------------|------------|
| `MainLayout` | Router | AuthContext | — |
| `Header` | MainLayout | AuthContext (user name, type) | logout |
| `Sidebar` | MainLayout | AuthContext (mainScreens, screens) + menu API | navigate |
| `Footer` | MainLayout | — | — |
| `ItemCreationList` | MainLayout (outlet) | Axios → `item_creation/crud.php?action=datatable` | openForm, delete |
| `ItemCreationForm` | Route or Modal | Axios → `item_creation/crud.php?action=createupdate` | submit, cancel |
| `DataTable` | Any list page | Props (ajaxUrl, columns) | sort, paginate, search |
| `ActionButtons` | DataTable row | Props (uniqueId, permissions) | edit, delete, view, print |
| `ActiveBadge` | DataTable row | Props (isActive) | — |
| `Modal` | Any page | Props (isOpen, title) | close |

---

## 6. Detailed Page Migration Blueprints

### 6.1 Login Page

| Aspect | Detail |
|--------|--------|
| **PHP source** | `folders/login/login.php` + `login.js` + `login/crud.php` |
| **React target** | `src/pages/Login.jsx` |
| **Velzon template** | Auth page with particles background, centered card |
| **Form fields** | `user_name` (text), `password` (password with toggle) |
| **Submit logic** | POST `{action:"login", user_name, password}` to `folders/login/crud.php` |
| **On success** | Store user in AuthContext, navigate to `/` |
| **On failure** | SweetAlert2 toast "Incorrect Username or Password" |
| **Special logic** | If `password === "password"` → redirect to password change (line 114 of login.js) |
| **Enter key** | Submit on Enter (line 307–311 of login.js) |
| **Complexity** | **Easy** |

### 6.2 Dashboard

| Aspect | Detail |
|--------|--------|
| **PHP source** | `folders/dashboard/form.php` |
| **React target** | `src/pages/Dashboard.jsx` |
| **Charts** | ApexCharts (already in `package.json` as `react-apexcharts`) |
| **Data** | POST to `folders/dashboard/crud.php` with `action: "dashboard_data"` (needs verification) |
| **Complexity** | **Medium** — depends on how many chart endpoints exist |

### 6.3 Item Creation (List + Form)

| Aspect | Detail |
|--------|--------|
| **PHP source** | `folders/item_creation/list.php`, `form.php`, `crud.php` |
| **React targets** | `ItemCreationList.jsx`, `ItemCreationForm.jsx` |
| **DB table** | `item_creation` |
| **List columns** | S.No, Item Code, Item Name, Unit, Status, Actions |
| **Form fields** | `item_name` (text, required), `unit` (select from `unit_creation` table), `active_status` (select Active/Inactive) |
| **Create logic** | `item_code` auto-generated server-side with `IT-` prefix |
| **Validation** | Duplicate `item_name` check server-side (returns `msg:"already"`) |
| **Delete** | Soft delete (`is_delete=1`); only visible for active items |
| **Complexity** | **Medium** |

### 6.4 Tray Creation (List + Form + QR)

| Aspect | Detail |
|--------|--------|
| **PHP source** | `folders/tray_creation/list.php`, `form.php`, `crud.php`, `qr_generator.php` |
| **React targets** | `TrayCreationList.jsx`, `TrayCreationForm.jsx` |
| **DB table** | `tray_creation` |
| **Key fields** | `bin_name`, `tray_type` (1=regular, 2=FRP), `tray_status` |
| **QR feature** | `qr_generator.php` generates QR code image; React can either call this endpoint or use a JS QR library |
| **Complexity** | **Medium-Hard** (QR generation adds complexity) |

### 6.5 All Other CRUD Modules

Each module under `folders/` follows the identical pattern:
1. `list.php` — renders a DataTable with server-side pagination via `action: "datatable"`
2. `form.php` — renders a Bootstrap form, submits via `action: "createupdate"`
3. `crud.php` — handles `createupdate`, `datatable`, `delete` actions

**For each, the React migration is:**
1. Create `{ModuleName}List.jsx` using `DataTable` component
2. Create `{ModuleName}Form.jsx` using `FormInput`/`FormSelect` components
3. Wire up to the existing `crud.php` endpoint

| Module | Table | Key Fields | Special Logic | Complexity |
|--------|-------|-----------|--------------|------------|
| `unit_creation` | `unit_creation` | `unit_name` | Simple CRUD | Easy |
| `supplier_creation` | `supplier_creation` | `supplier_name`, contacts | Simple CRUD | Easy |
| `pit_creation` | `pit_creation` | `pit_name` | Simple CRUD | Easy |
| `user` | `user` | `user_name`, `password`, `user_type` | Password field, role assignment | Medium |
| `user_type` | `user_type` | `user_type` name | Simple CRUD | Easy |
| `user_permission` | `user_screen_permission` | Permission matrix (checkboxes) | Complex multi-select UI | Hard |
| `user_screen` | `user_screen` | `screen_name`, `folder_name`, `icon_name` | Admin config | Medium |
| `main_screen` | `main_screen` | `screen_main_name`, `icon_name` | Admin config | Easy |
| `screening_process` | `screening_process` | Batch data, dates, quantities | Permission checks for editing | Medium |
| `egg_process` | `egg_process` | Batch metrics, yields | Date-based entries | Medium |
| `culling_process` | `culling_process` | Process data | Similar pattern | Medium |
| `oven_process` | `oven_process` | Temperature, duration | Similar pattern | Medium |
| `dry_process` | `dry_process` | Drying metrics | Similar pattern | Medium |
| `leachate` | `leachate` | Volume, date | Simple process log | Easy |
| `material_received` | `material_received` | Supplier, items, quantities | Foreign keys to supplier & item tables; permission checks | Hard |
| `status_update` | Various (generic) | `staff_name` (from session), `status` | Uses `$_SESSION['sess_user_id']` as hidden field | Medium |
| `pit_status` | `pit_status` | Pit reference, status transitions | Permission checks | Medium |
| `frp_tray_process` | `frp_tray_process` | FRP-specific tray data | `tray_type = 2` filter | Medium |
| `login_history` | `user_login_details` | `user_id`, timestamps, `log_type` | Read-only report, session duration calculation | Medium |
| `logsheet` | `logsheet` | Daily operational log | Date-filtered entries | Medium |
| `dc` | `dc` | Delivery challan data | Print view | Medium |
| `measurable` | `measurable` | Measurable parameters | Process-specific | Medium |
| Reports (`*_report`) | Various | Read-only aggregated views | Charts, date filters, exports | Medium-Hard |

---

## 7. Testing Strategy

### 7.1 Testing Pyramid

```
         ╱╲
        ╱  ╲       Manual QA (final walkthrough)
       ╱────╲
      ╱      ╲     E2E: Login → CRUD → Logout flow
     ╱────────╲
    ╱          ╲   Component: Each page renders, submits, handles errors
   ╱────────────╲
  ╱              ╲ Unit: disname(), confirmDelete(), permission hooks
 ╱────────────────╲
```

### 7.2 Recommended Test Cases

| Test | Type | Description |
|------|------|-------------|
| Login success | E2E | Enter valid credentials → lands on dashboard |
| Login failure | E2E | Enter wrong password → SweetAlert "Incorrect" |
| Session expired | Integration | Mock 302/non-JSON response → redirects to /login |
| Item CRUD | E2E | Create item → appears in list → edit → delete |
| Duplicate item | Integration | Submit existing `item_name` → warning toast |
| Permission gate | Component | User without `item_create` screen ID → no "New" button |
| Sidebar rendering | Component | Only permitted menu items visible |
| DataTable pagination | Component | Navigate pages, verify row counts |
| Delete confirmation | Component | Click delete → SweetAlert confirm → call API |

### 7.3 Test Setup (if adding later)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom msw
```

---

## 8. Deployment & Build

### 8.1 Development

```bash
cd frontend
npm run dev      # Vite dev server on port 5173
```

Vite proxy config to forward API calls to the PHP backend:

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/folders': 'http://localhost:80',  // or wherever PHP runs
      '/uploads': 'http://localhost:80',
      '/assets':  'http://localhost:80',
    },
  },
});
```

### 8.2 Production Build

```bash
npm run build    # outputs to frontend/dist/
```

Deploy `dist/` contents alongside the PHP app on the same Apache/Nginx server, with URL rewriting to serve `index.html` for all non-API routes.

### 8.3 Environment Variables

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:80

# .env.production
VITE_API_BASE_URL=   # empty = same-origin
```

---

## 9. Security Considerations

| Concern | Current State | Recommendation |
|---------|--------------|----------------|
| **Plaintext passwords** | `login/crud.php` line 41: `password = '$password'` — no hashing | Add `password_hash()` / `password_verify()` on backend. Does not block React migration. |
| **SQL injection** | `login/crud.php` line 41 uses string concatenation in WHERE clause | Migrate to prepared statements. Does not block React migration. |
| **Session fixation** | No `session_regenerate_id()` after login | Add to PHP login handler. |
| **CORS** | `dbconfig.php` line 5: `Access-Control-Allow-Origin: *` | Restrict to same-origin only in production. |
| **XSS** | React auto-escapes JSX output | Avoid `dangerouslySetInnerHTML` except for legacy HTML responses. |
| **CSRF** | No CSRF tokens currently | Low risk since same-origin; add if needed later. |

> These are backend concerns that do not block the React migration but should be addressed in parallel.

---

## 10. Migration Roadmap (Developer Action Plan)

```
Week 1-2:  [Setup]      Vite scaffold ✓, asset import ✓, project structure, Axios client
Week 2-3:  [Auth]       Login page, AuthContext, session handling, menu API
Week 3-4:  [Layout]     MainLayout, Header, Sidebar (dynamic), Footer, ProtectedRoute
Week 4-5:  [Core CRUD]  DataTable component, FormInput/Select, Item module (reference impl)
Week 5-7:  [Replicate]  Port remaining simple CRUD modules using Item as template
Week 7-9:  [Complex]    Material Received, User Permission matrix, Status Update
Week 9-11: [Process]    Screening, Egg, Culling, Oven, Dry, Leachate, Pit Status
Week 11-13:[Reports]    Dashboard charts, Login History, Measurable/Egg/Pit/Rejects reports
Week 13-14:[QR & Print] Tray QR generation, DC print view, report exports
Week 14-16:[Polish]     Responsive QA, edge cases, testing, deployment config
```

**Priority order for pages** (migrate the most-used first):
1. Login → Dashboard → Item Creation (establishes patterns)
2. Tray → Pit → Unit → Supplier (simple CRUD, high volume)
3. Screening → Egg → Material Received (business-critical processes)
4. Reports & Admin pages (lower frequency)

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| `unique_id` | Zigma's universal record identifier (PHP `uniqid()` + random suffix). Used as primary key reference across all tables. |
| `is_delete` | Soft-delete flag. `0` = active record, `1` = deleted. All queries filter by `is_delete = 0`. |
| `is_active` | Active/inactive toggle. `1` = active, `0` = inactive. |
| `disname()` | PHP helper that converts `snake_case` folder names to `Title Case` display names. Port to JS: `s => s.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')`. |
| `sess_user_type` | The `unique_id` of the user's role from the `user_type` table. Stored in session. |
| `main_screens` | Array of `unique_id` values from the `main_screen` table that the current user's role is permitted to see in the sidebar. |
| `screens` | Array of `unique_id` values from the `user_screen` table that the current user's role is permitted to access (pages + action buttons). |
| `crud.php` | The universal controller file in each module folder. Handles all server-side actions via a `switch($action)` block. |
| `comfun.php` | Common functions file (4600+ lines) containing helpers for buttons, permissions, select options, data lookups, etc. |
| `Velzon` | The Bootstrap-based admin template used for the UI theme. CSS files: `app.min.css`, `bootstrap.min.css`, `icons.min.css`, `custom.min.css`. |
| SPA | Single Page Application — client-side routing, no full page reloads. |
| SweetAlert2 | JavaScript popup/toast library used for all user feedback messages. Already in `package.json`. |

---

*End of Document. All statements are derived from the source code at `c:\Users\DELL\House work\Internship\erp\erp`. Items marked **Needs Verification** require confirmation against the live database or testing environment.*
