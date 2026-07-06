# PHP → Django Migration Report

## Root cause of the reported 404 / 502

- The Django login endpoint **already exists** at `POST /api/auth/login` (see `backend/config/urls.py:76`).
  A 404 on it is environmental: either the backend wasn't running on `:8000`, or the
  built frontend was served by IIS (which doesn't apply the Vite `/api` proxy).
- The `502`s on `/folders/**.php` are the **legacy PHP host being down**. Those calls came
  from modules not yet cut over to Django (dashboard + reports).
- The Vite proxy is correctly configured (`frontend/vite.config.js`): `/api → http://localhost:8000`.

## Authentication flow (after migration)

1. `Login.jsx` → `POST /api/auth/login` `{ user_name, password }`.
2. Success → `{ status:1, data:{ access_token, user } }`. Token stored in `localStorage.django_token`.
3. `djangoClient` request interceptor attaches `Authorization: Token <token>` on every call.
4. `AuthContext.checkSession()` → `GET /api/auth/me` validates the token on app load.
5. Bad credentials → Django returns **HTTP 401** (axios throws) → "Incorrect UserName and Password".
6. Backend unreachable (no response) → demo-mode fallback (`admin` / `admin123`) is preserved.
7. `logout()` → `POST /api/auth/logout` then clears `auth_user` + `django_token`.

Django serializes users snake_case with a nested `user_type`; the React app reads camelCase
(`userName`, `userType`, `mainScreens`, `screens`). `mapDjangoUser()` in `djangoClient.js` bridges
this once — without it, login would authenticate then render an empty sidebar.

## Files modified

| File | Change |
|------|--------|
| `frontend/src/api/djangoClient.js` | Added `mapDjangoUser()`; `baseURL = VITE_API_URL \|\| '/api'` |
| `frontend/src/pages/Login.jsx` | PHP login → `POST /api/auth/login`; removed `client` import |
| `frontend/src/context/AuthContext.jsx` | `session.php` → `/api/auth/me`; `logout.php` → `/api/auth/logout` |
| `frontend/src/components/Layout/Sidebar.jsx` | `menu.php` → `GET /api/menu` (reads `res.data.data`) |
| `frontend/.env.example` | Documents optional `VITE_API_URL` |
| `frontend/__tests__/mocks/handlers.js` | Login mock → `/api/auth/login` (Django shape) |
| `frontend/__tests__/integration/auth/login.test.jsx` | Retargeted to `djangoClient`, 401-on-bad-creds |
| `frontend/__tests__/unit/components/Auth/Login.test.jsx` | Retargeted to `djangoClient`, mapped-user assert |
| `frontend/__tests__/unit/hooks/useAuth.test.jsx` | Retargeted to `djangoClient` (`/auth/me`, `/auth/logout`) |
| `frontend/__tests__/unit/components/Layout/Sidebar.test.jsx` | Menu mock → `djangoClient`, `data:` shape |

## Audit table — every PHP endpoint referenced by `frontend/src`

| Frontend File | Old PHP Endpoint | New Django Endpoint | Status |
|---|---|---|---|
| `pages/Login.jsx` | `folders/login/crud.php` (login) | `POST /api/auth/login` | ✅ Migrated |
| `context/AuthContext.jsx` | `folders/login/session.php` | `GET /api/auth/me` | ✅ Migrated |
| `context/AuthContext.jsx` | `logout.php` | `POST /api/auth/logout` | ✅ Migrated |
| `components/Layout/Sidebar.jsx` | `folders/login/menu.php` | `GET /api/menu` | ✅ Migrated |
| `pages/Dashboard/Dashboard.jsx` | `folders/dashboard/api.php` | — | ❌ **Missing** — no dashboard-aggregate endpoint in Django |
| `pages/Dashboard/Dashboard.jsx` | `folders/dashboard/organic.php` (`window.open`) | — | ❌ **Missing** — HTML drill-down page |
| `pages/Dashboard/TrayStatusWidget.jsx` | `folders/dashboard/tray_status.php` (`window.open`) | — | ❌ **Missing** — HTML drill-down page |
| `pages/Measurable/MeasurableList.jsx` | `folders/measurable/crud.php` | `/api/measurable` (ViewSet **exists**) | ⚠ Endpoint exists; page still on `DataTable` php-mode + HTML `form.php` — needs rewrite |
| `pages/Measurable/MeasurableForm.jsx` | `folders/measurable/crud.php`, `form.php` | `/api/measurable` (ViewSet **exists**) | ⚠ Same — form parses PHP-rendered HTML |
| `pages/MeasurableReport/MeasurableReportList.jsx` | `folders/measurable_report/crud.php`, `pit_status/form.php` | — (options: `/api/pits`) | ❌ **Missing** — no measurable-report endpoint |
| `pages/EggProcessReport/EggProcessReportList.jsx` | `folders/egg_process_report/crud.php`, `list.php` | — (`/api/egg-process` is raw CRUD, not the report) | ❌ **Missing** — no egg-process-report endpoint |
| `pages/PitStatusReport/PitStatusReportList.jsx` | `folders/pit_status_report/crud.php`, `list.php`, `overall_excel.php` | — | ❌ **Missing** — no pit-status-report + Excel export |
| `pages/RejectsReport/RejectsReportList.jsx` | `folders/rejects_report/crud.php`, `print_overall.php` | — | ❌ **Missing** — no rejects module in Django router |
| `pages/RejectsImageUpload/RejectsImageUploadList.jsx` | `folders/rejects_image_upload/crud.php` | — | ❌ **Missing** — no rejects module |
| `pages/RejectsImageUpload/RejectsImageUploadForm.jsx` | `.../crud.php`, `form.php`, `get_ticket_details.php` | — | ❌ **Missing** — no rejects module |
| `pages/LoginHistory/LoginHistoryList.jsx` | `folders/login_history/crud.php`, `list.php` | — | ❌ **Missing** — no login-history module |
| `pages/LoginHistory/LoginHistoryView.jsx` | `folders/login_history/view.php` | — | ❌ **Missing** — no login-history module |

Comment-only references remain in `api/client.js`, `api/djangoClient.js`, and `components/DataTable.jsx`
(the `mode='php'` doc comment) — not live calls.

## Missing backend endpoints that block "zero PHP" (must be built to finish)

Per instruction #12 (do **not** invent endpoints), these are reported rather than stubbed. Each row
names the exact missing Django endpoint and the frontend file that depends on it:

1. **Dashboard aggregate** — `Dashboard.jsx` needs a `GET/POST /api/dashboard?month=` returning
   `{ kpi, overall, pit_chart, tray_status, unutilized_trays }`. No equivalent exists.
2. **Dashboard drill-downs** — `organic.php`, `tray_status.php` (opened in new tabs) have no Django page.
3. **Report modules** — `measurable_report`, `egg_process_report`, `pit_status_report` need
   report/aggregation endpoints (the plain CRUD ViewSets are not the filtered reports), plus
   **Excel/print export** (`overall_excel.php`, `print_overall.php`) with no DRF equivalent.
4. **Rejects module** — no `rejects_report` / `rejects_image_upload` ViewSet is registered in
   `backend/config/urls.py`. Whole module missing (incl. image upload + ticket lookup).
5. **Login history** — no `login-history` ViewSet registered. Whole module missing.
6. **Measurable page rewrite** — the `/api/measurable` ViewSet exists, but `MeasurableList`/`MeasurableForm`
   still use `DataTable` php-mode (server-rendered HTML rows) and a PHP-rendered `form.php`. Migrating
   requires switching `DataTable` to `mode="django"` and rebuilding the form against JSON.

## Notes on the remaining constraints

- **#8 (single axios instance):** `client.js` (PHP) is still required because Dashboard + report
  pages above call `crud.php`. Two clients coexist **by necessity** until those modules get Django
  endpoints. Everything with a real Django endpoint (auth, menu, all settings/process CRUD pages)
  already uses the single `djangoClient`.
- **#9 (env):** `djangoClient` now honors `VITE_API_URL`, defaulting to same-origin `/api` (works in
  dev via the Vite proxy and in prod behind a reverse proxy). `.env.example` added.
- **Cypress specs** (`cypress/e2e/errorRecovery/networkErrors.cy.js`, `cypress/support/commands.js`)
  still reference PHP endpoints — they are e2e against a running stack and are follow-up once the
  above backend endpoints exist.

## Test status

- Auth + menu migration: **all related tests pass** (login integration, login unit, useAuth, Sidebar).
- Pre-existing failures unrelated to this work: `__tests__/integration/items/itemCRUD.test.jsx` (2)
  — this test mocks PHP `crud.php` but `ItemCreationList` was already on Django before this change
  (verified by running the suite against HEAD with these changes stashed). Left as pre-existing debt.
