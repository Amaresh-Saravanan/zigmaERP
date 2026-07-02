# Zigma ERP — Migration Tracker

> **LIVING DOCUMENT** — Update after every completed task. This is the single source of truth for the project, now spanning two parallel workstreams (see [Workstream Overview](#workstream-overview)): **Workstream A — UI Modernization** and **Workstream B — Django Backend (Greenfield Build)**.
>
> **Target architecture: React + Django REST + MongoDB Atlas + Docker + Vercel.** Legacy PHP (`legacy/`) is reference material only — used to understand business logic during frontend development (Phase 1/2) and to inform Django's business rules (Phase 3), but never deployed and never ported directly. See `TECH_STACK.md` for the full stack and `BACKEND_START.md` to start Workstream B.
>
> Sections 1–15 below are the original, unchanged record of Workstream A / Phase 1 (building the React UI against legacy PHP as a reference backend), which is complete. They are preserved as history and are not being rewritten. New work is tracked in the Workstream Overview and Sections 16–17.

---

## AI Continuity Section

> **Read this first before writing any code.**

| Field | Value |
|-------|-------|
| **Architecture** | **React (Vite) + Django REST + MongoDB Atlas + Docker + Vercel** (NOT PHP → Django migration; greenfield Django build using legacy PHP as reference for business logic only). |
| **Current Phase** | Phase 1 (React): 100%. Phase 2 (UI Modernization): 100%. Phase 3 (Django Backend): 0% — ready to scaffold. Phase 4 (Deployment): 0%. |
| **Current Task** | Django backend scaffolding (TASK-B01 in §17). See BACKEND_START.md for hands-on setup. |
| **Last Completed Task** | TASK-A08: flatpickr DateInput integration complete across all 26+ form/list pages. |
| **Overall Progress** | Frontend: 100% complete. Backend: To start (TASK-B01). |
| **Active Blocker** | None — ready to start Django scaffold. |
| **Tech Stack** | See TECH_STACK.md (React, Django 4.2+, MongoEngine, MongoDB, Vercel, Docker). |
| **Legacy Reference** | `legacy/` folder (PHP source code — read for business logic understanding; do NOT migrate code). |

### Completed Work (Phase 1 + Phase 2 in progress)

**Phase 1 (React Migration) — 100% Complete**
- Git repository cleanup (moved PHP backend to `legacy/` folder, kept running via Apache alias)
- Vite + React scaffold with Bootstrap/Velzon CSS, all 33 legacy routes wired dynamically
- `AuthContext`, `ProtectedRoute`, `usePermission` hook — session-based auth working
- `DataTable.jsx` reusable component with server-side pagination, search, filters, delete, custom actions
- All CRUD modules ported (33 pages: Item, Tray, Pit, Unit, Supplier, User, Screening, Egg, Culling, Oven, Dry, Leachate, Material Received, Status Update, Pit Status, FRP Tray, FRP Status, Logsheet, DC, Measurable, Reports, Login History, Main Screen, etc.)
- Tests: Vitest (unit), MSW (integration), Cypress (E2E), Axe (accessibility) — all passing

**Phase 2 (UI Modernization) — ~85% Complete**
- **Dark theme system**: `ThemeContext.jsx`, `useTheme()` hook, `darkmode.css` (complete CSS variable overrides for all pages)
- **Design system**: `DESIGN.md` (green `#25a96b` brand, glassmorphism, comprehensive token palette)
- **Color palettes**: `chartTheme.js` (theme-aware chart colors for ApexCharts, light/dark modes)
- **Login page redesign**: glassmorphism, modern layout, particle background, matches reference UI
- **Dashboard redesign**: 
  - Added `EfficiencyStrip` component (bioconversion rate hero + input/output metrics)
  - Redesigned `PitStatusChart` (summary stats in header, proper empty-state)
  - Redesigned `TrayStatusWidget` (vertical list → clean tile grid with progress bars)
  - Redesigned `OverallStatusChart` (donut + legend side-by-side, empty-state, custom label)
  - Live badge & date range picker (styled pills, native input overlaid for picker access)
- **Hamburger menu**: thicker bars (2.5px), smoother cubic-bezier animation, better spacing
- **Header styling**: subtle backdrop blur, refined box-shadow, improved button hover lift
- **Animations**: site-wide fade-in stagger (card entrance cascades), button press feedback (scale 0.97), smooth hover lift, `prefers-reduced-motion` support
- **Typography**: Tray Status widget labels (Day 1–5, Above 5 Days) restyled to match KPI title convention (bold, uppercase, letter-spacing)
- **Dropdown fixes**: Firefox `:moz-focusring` suppression, solid border enforcement (native `<select>` kept, OS blue highlight accepted)

**Phase 2 (UI Modernization) — 100% Complete**
- **Calendar component**: DateInput.jsx wrapper built and integrated with flatpickr across all 26+ form/list pages
  * No date restrictions by default; supports manual input and calendar picker
  * Full compatibility with existing form handlers and filters
  * Supports disabled/readonly state, required validation, custom classNames
  * All native `<input type="date">` replaced throughout the app
- **Forms & Tables**: complete redesign with dark theme, animations, new typography, improved spacing
- **Reports pages**: full styling overhaul including filter labels, badges, table headers
- **Responsive design**: mobile-first breakpoints added to all pages

### Next Recommended Action
Workstream A: continue the theme rollout past Login/Dashboard to Sidebar, Header, Tables, Forms (§16). Workstream B: **start here → `BACKEND_START.md`** (30-min Django + MongoDB Atlas scaffold with working login + Item CRUD reference), then TDD_Blueprint.md §15 for full technical design (§17, TASK-B01).

### Key Constraints (never forget)
- **Architecture is React + Django + MongoDB Atlas + Docker + Vercel.** Not a PHP→Django code migration — Django is a greenfield build. See `TECH_STACK.md` for the full stack and `BACKEND_START.md` for hands-on setup.
- **2026-07-01 repo cleanup**: the legacy PHP backend (`index.php`, `body.php`, `logout.php`, `inc/`, `config/`, `folders/`, `vendors/`, `db_setup/`, `assets/`, `uploads/`, `generate_logsheet.py`) was moved into `legacy/` to keep the repo root focused on the React frontend + docs. **The PHP app still runs from there for reference during Phase 1/2 development** — it is never deployed to production and is not the system of record once Django is live. If PHP stops responding at `http://localhost`, repoint the Apache/XAMPP docroot (or vhost/alias) to `legacy/` — that's outside this repo and wasn't changed by this cleanup.
- Workstream A (UI): still talks to the legacy PHP `crud.php` endpoints during development — this is a visual/UX-only workstream, no new backend calls. It will be repointed to Django once Workstream B has enough module coverage.
- Workstream B (Django): built from scratch against **MongoDB Atlas** via **MongoEngine**. Legacy PHP `crud.php` files are read as reference for business rules (duplicate checks, auto-code generation, permission logic) — no PHP code is ported or run in production. See `BACKEND_START.md` "Reference Implementation: Item Module" for the pattern to clone across all other modules.
- Auth: legacy PHP uses sessions (reference only). Django backend uses **token-based auth (DRF TokenAuthentication or JWT)** since the Vercel-hosted frontend and containerized Django backend are different origins in production — see TDD_Blueprint.md §15.5 and TECH_STACK.md "Authentication & Authorization".
- POST format to legacy PHP reference endpoints = application/x-www-form-urlencoded. **Django endpoints are JSON REST** (see TDD_Blueprint.md §15.4, TECH_STACK.md "API Contract").
- Database: **MongoDB Atlas only** — no local Dockerized MongoDB, no MySQL/PostgreSQL. Every environment (dev/staging/prod) connects to its own Atlas cluster/database via `MONGODB_URI`. See TECH_STACK.md "Database Stack".
- Velzon/Bootstrap CSS already imported in main.jsx — do NOT re-import per component. New dark-theme tokens live in `DESIGN.md` / `darkmode.css` — do NOT hardcode colors in components.
- No TypeScript — plain .jsx / .js on the frontend. Backend is Python/Django + MongoEngine.
- Ponytail FULL mode: YAGNI, no unnecessary abstractions — applies to both workstreams.
- Extract unique ID dynamically from backend HTML columns in the DataTable to avoid changing PHP (still applies until a module's DataTable is repointed to its Django endpoint).

---

## Workstream Overview

> Added 2026-07-01. High-level status for the two active workstreams. Detail and task queues are in §16 (Workstream A) and §17 (Workstream B).

### Workstream A — UI Modernization

| Item | Status | Progress | Notes |
|------|--------|----------|-------|
| Design system (`DESIGN.md`, tokens) | Done | 100% | Green #25a96b, glassmorphism, light/dark palettes |
| Dark mode (`ThemeContext`, `darkmode.css`) | Done | 100% | All pages theme-aware, reduced-motion support |
| Color palettes (`chartTheme.js`) | Done | 100% | Theme-aware chart colors for ApexCharts |
| Login page redesign | Done | 100% | Glassmorphism, modern layout, particle background |
| Dashboard redesign (Pit, Tray, Overall charts) | Done | 100% | EfficiencyStrip added, charts redesigned, empty-states |
| Hamburger menu styling | Done | 100% | Smoother animation, better proportions |
| Header / Navbar styling | Done | 100% | Backdrop blur, refined shadows, hover lift |
| Animations (site-wide) | Done | 100% | Staggered card entrance, button press, fade-in, respects prefers-reduced-motion |
| Dropdown styling | Done | 100% | Firefox fix (:-moz-focusring), solid borders enforced |
| Date range picker (Dashboard) | Done | 100% | Styled pill, native input overlay |
| Calendar component (`DateInput.jsx` + flatpickr rollout) | Done | 100% | DateInput.jsx built, all 26+ form/list pages migrated, fully integrated and tested |
| Forms / Table full redesign pass | Done | 100% | `datatable.css`, `forms.css`, `ux.css`, `DataTable.jsx` rewritten; all pages covered |
| Reports pages styling | Done | 100% | Filter labels, timeline (LoginHistory), badge colors, table headers — all covered via CSS |
| Responsive improvements (redesign-specific) | Done | 100% | Mobile breakpoints in `ux.css` §19, `datatable.css`, `forms.css` |

### Workstream B — Django Backend (Greenfield Build)

> **Important:** This is NOT a PHP → Django migration. Workstream B builds Django from scratch (greenfield) using legacy PHP as a reference for business logic only. See BACKEND_START.md for hands-on setup.

| Item | Status | Progress | Dependencies |
|------|--------|----------|---------------|
| Django + MongoEngine scaffold (TASK-B01) | Not Started | 0% | None — see BACKEND_START.md quick-start |
| Auth (login endpoint, token gen, login endpoint parity with legacy) | Not Started | 0% | TASK-B01 |
| Item module (reference impl: Item, Unit CRUD) | Not Started | 0% | Auth working |
| Core CRUD modules (Tray, Pit, Supplier, clone from Item pattern) | Not Started | 0% | Item reference complete |
| User management (User, UserType, Permissions, Screens) | Not Started | 0% | Core CRUD done |
| Process modules (Screening, Egg, Culling, Oven, Dry, Leachate, etc.) | Not Started | 0% | User mgmt done |
| Reports modules (Logsheet, DC, Measurable, *_Report) | Not Started | 0% | Process modules done |
| Frontend `client.js` repointed to Django API | Not Started | 0% | Enough modules live (Item minimum) |
| pytest-django test suite | Not Started | 0% | Alongside each module |
| Docker (Dockerfile, docker-compose.yml, production config) | Not Started | 0% | Django setup functional locally |
| Deployment (Vercel frontend + containerized backend to cloud) | Not Started | 0% | Docker working, CORS/secrets set |
| Production hardening (env vars, MongoDB Atlas, secrets, logging) | Not Started | 0% | Deployment live |

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | Zigma ERP — React SPA Migration |
| **Repository** | c:\Users\DELL\House work\Internship\erp\erp |
| **React Workspace** | frontend/src/ |
| **PHP Reference** | folders/*/crud.php (read-only) |
| **Version** | v0.1.0-alpha |
| **Start Date** | 2026-06-25 |
| **Current Sprint** | Sprint 1 — Foundation |
| **Current Milestone** | Phase 1: Setup and Assets |
| **Target Completion** | ~16 weeks from start |
| **Overall Progress** | 100% |

---

## 2. Development Status Dashboard

| Area | Status | Progress |
|------|--------|----------|
| Project Setup | Done | 100% |
| Auth and Session | Done | 100% |
| Core Components | Done | 100% |
| Page Migrations | Done | 100% |
| API Integration | Done | 100% |
| Unit Tests | Done | 100% |
| Integration Tests | Done | 100% |
| E2E Tests | Done | 100% |
| Accessibility | Done | 100% |
| Deployment | Done | 100% |

---

## 3. Milestone Tracker

| Phase | Milestone | Status | Completion Date | Notes |
|-------|-----------|--------|-----------------|-------|
| Phase 1 | Vite scaffold + dependencies | Done | 2026-06-25 | react 19, react-router-dom v7, axios, swal2 |
| Phase 1 | Velzon/Bootstrap CSS imports | Done | 2026-06-25 | In main.jsx |
| Phase 1 | Vite proxy config | Done | 2026-06-25 | /folders + /uploads to localhost |
| Phase 1 | Base src/ directory structure | Done | 2026-06-25 | folders created |
| Phase 1 | api/client.js — Axios instance | Done | 2026-06-25 | mapped SweetAlert2 messages |
| Phase 1 | utils/ helpers | Done | 2026-06-25 | disname + confirmDelete ready |
| Phase 2 | AuthContext.jsx | Done | 2026-06-25 | session-check + logout support |
| Phase 2 | Login.jsx page | Done | 2026-06-25 | matches legacy UI |
| Phase 2 | MainLayout.jsx + Sidebar | Done | 2026-06-25 | dynamic menu rendering via PHP endpoint |
| Phase 2 | Header.jsx + logout | Done | 2026-06-25 | |
| Phase 2 | ProtectedRoute.jsx | Done | 2026-06-25 | gates authenticated routes |
| Phase 2 | routes.jsx — all 33 module routes | Done | 2026-06-25 | dynamically mapped via PlaceholderPage |
| Phase 3 | DataTable.jsx component | Done | 2026-06-25 | reusable component supporting legacy params |
| Phase 3 | Item Creation module | Done | 2026-06-25 | Reference implementation |
| Phase 3 | Tray Creation module | Done | 2026-06-25 | |
| Phase 3 | Pit Creation module | Done | 2026-06-25 | |
| Phase 3 | Unit Creation module | Done | 2026-06-25 | |
| Phase 3 | Supplier Creation module | Not Started | — | |
| Phase 3 | User Management | Not Started | — | User, Type, Permission, Screen |
| Phase 4 | All Process modules | Not Started | — | Screening, Egg, Culling, Oven, Dry, etc. |
| Phase 5 | Dashboard + Reports | Not Started | — | |
| Phase 6 | Testing + QA | Not Started | — | Vitest, MSW, Cypress, a11y |

---

## 4. Module Tracker

| Module | Status | Progress | Priority | Complexity | Dependencies | Components | Tests | Notes |
|--------|--------|----------|----------|------------|--------------|------------|-------|-------|
| Authentication | Done | 100% | Critical | Medium | None | Login.jsx, AuthContext, ProtectedRoute | No | PHP session, no JWT |
| Dashboard | Done | 100% | High | Medium | Auth | Dashboard.jsx, Charts | No | Hidden for worker role 6213273aa04b228161 |
| Item Creation | Done | 100% | High | Low | Auth, DataTable, Units | ItemCreationList, ItemCreationForm | No | Reference impl; IT- prefix auto-code |
| Tray Creation | Done | 100% | High | Low | Auth, DataTable | TrayCreationList, TrayCreationForm | No | |
| Pit Creation | Done | 100% | Medium | Low | Auth, DataTable | PitCreationList, PitCreationForm | No | |
| Unit Creation | Done | 100% | Medium | Low | Auth, DataTable | UnitCreationList | No | FK dep for Item Creation |
| Supplier Creation | Done | 100% | Medium | Low | Auth, DataTable | SupplierCreationList, SupplierCreationForm | No | |
| User Management | Done | 100% | High | High | Auth | UserList, UserTypeList, UserPermissionList, UserScreenList | No | 4 sub-modules |
| Screening Process | Done | 100% | Medium | High | Items, Trays | ScreeningProcessList, ScreeningProcessForm | No | |
| Egg Process | Done | 100% | Medium | High | Screening | EggProcessList, EggProcessForm | No | |
| Culling Process | Done | 100% | Medium | High | Egg | CullingProcessList | No | |
| Oven Process | Done | 100% | Medium | High | Items, Trays | OvenProcessList | No | |
| Dry Process | Done | 100% | Medium | High | Oven | DryProcessList | No | |
| Leachate | Done | 100% | Medium | Medium | Pits | LeachateList | No | |
| Material Received | Done | 100% | Medium | Medium | Supplier | MaterialReceivedList | No | |
| Status Update | Done | 100% | Medium | Medium | Pits, Trays | StatusUpdateForm | No | Form-only, no list |
| Pit Status | Done | 100% | Medium | Medium | Pits | PitStatusList | No | |
| FRP Tray Process | Done | 100% | Low | Medium | Trays | FrpTrayProcessList | No | |
| FRP Status Update | Done | 100% | Low | Medium | FRP Tray | FrpStatusUpdateList | No | |
| Logsheet | Done | 100% | Medium | Medium | Process modules | LogsheetList | No | |
| DC | Done | 100% | Low | Medium | Supplier | DcList | No | |
| Measurable | Done | 100% | Low | Low | None | MeasurableList | No | |
| Login History | Done | 100% | Low | Low | Auth | LoginHistoryList | No | Read-only report |
| Measurable Report | Done | 100% | Low | Low | Measurable | MeasurableReportList | No | |
| Egg Process Report | Done | 100% | Low | Low | Egg | EggProcessReportList | No | |
| Pit Status Report | Done | 100% | Low | Low | Pit Status | PitStatusReportList | No | |
| Rejects Report | Done | 100% | Low | Low | Culling | RejectsReportList | No | |
| Rejects Image Upload | Done | 100% | Low | Medium | Rejects | RejectsImageUploadList | No | File upload handling |
| Main Screen Admin | Done | 100% | Low | Low | Auth | MainScreenList | No | Admin-only |

---

## 5. Current Task

`
TASK-016
Objective:     Migrate User Management (4 sub-modules) to React
Files:         frontend/src/pages/User/UserList.jsx [NEW]
               frontend/src/pages/User/UserTypeList.jsx [NEW]
               frontend/src/pages/User/UserPermissionList.jsx [NEW]
               frontend/src/pages/User/UserScreenList.jsx [NEW]
Expected:      User, User Type, User Permission, User Screen modules listed using DataTable.
Estimated:     2 hours
`

---

## 6. Next Task Queue

| Task | Title | Priority | Depends On | Complexity |
|------|-------|----------|------------|------------|
| TASK-003 | Base src/ structure + api/client.js | Done | TASK-002 done | Low |
| TASK-004 | Login.jsx page + auth POST | Done | TASK-003 | Low |
| TASK-005 | AuthContext.jsx full implementation | Done | TASK-004 | Done |
| TASK-006 | ProtectedRoute.jsx | Done | TASK-005 | Low |
| TASK-007 | MainLayout.jsx + Sidebar.jsx | Done | TASK-005 | Done |
| TASK-008 | Header.jsx + logout | Done | TASK-007 | Low |
| TASK-009 | routes.jsx — all 33 routes wired | Done | TASK-007 | Low |
| TASK-010 | DataTable.jsx reusable component | Done | TASK-003 | Done |
| TASK-011 | Unit Creation module | Done | TASK-010 | Low |
| TASK-012 | Item Creation module (reference impl) | Done | TASK-011 | Low |
| TASK-013 | Tray Creation module | Done | TASK-012 | Low |
| TASK-014 | Pit Creation module | Done | TASK-010 | Low |
| TASK-015 | Supplier Creation module | Done | TASK-010 | Low |
| TASK-016 | User Management (4 sub-modules) | High | TASK-010 | High |
| TASK-017 | Screening Process | Done | TASK-012, TASK-013 | High |
| TASK-018 | Egg Process | Done | TASK-017 | High |
| TASK-019 | Culling Process | Done | TASK-018 | High |
| TASK-020 | Oven Process | Done | TASK-012, TASK-013 | High |
| TASK-021 | Dry Process | Done | TASK-020 | High |
| TASK-022 | Leachate | Done | TASK-014 | Done |
| TASK-023 | Material Received | Done | TASK-015 | Done |
| TASK-024 | Status Update | Done | TASK-014, TASK-013 | Done |
| TASK-025 | Pit Status | Done | TASK-014 | Done |
| TASK-026 | FRP Tray Process | Done | TASK-013 | Done |
| TASK-027 | FRP Status Update | Done | TASK-026 | Done |
| TASK-028 | Logsheet | Done | TASK-017 | Done |
| TASK-029 | DC | Done | TASK-015 | Done |
| TASK-030 | Measurable | Done | TASK-010 | Low |
| TASK-030-BONUS | Measurable Report | Done | TASK-030 | Low |
| TASK-031 | Dashboard + Charts | Done | TASK-005 | Done |
| TASK-032 | Login History | Done | TASK-005 | Low |
| TASK-033 | All Report modules (5x) | Done | TASK-019..TASK-025 | Low |
| TASK-034 | Rejects Image Upload | Done | TASK-019 | Done |
| TASK-035 | Main Screen Admin | Done | TASK-005 | Low |
| TASK-036 | Vitest setup + unit tests | Done | TASK-012 | Medium |
| TASK-037 | MSW setup + integration tests | Done | TASK-036 | Medium |
| TASK-038 | Cypress E2E setup + test suites | Done | TASK-035 | High |
| TASK-039 | Accessibility audit + fixes | Done | TASK-038 | Done |
| TASK-040 | Responsive QA + polish | Done | TASK-039 | Done |

---

## 7. Component Progress

| Component | File | Status |
|-----------|------|--------|
| api/client.js | src/api/client.js | Completed |
| AuthContext | src/context/AuthContext.jsx | Completed |
| useAuth hook | src/hooks/useAuth.js | Completed |
| usePermission hook | src/hooks/usePermission.js | Completed |
| disname util | src/utils/disname.js | Completed |
| confirmDelete util | src/utils/confirmDelete.js | Completed |
| permissionChecker util | src/utils/permissionChecker.js | Not Started |
| ProtectedRoute | src/components/ProtectedRoute.jsx | Completed |
| MainLayout | src/components/Layout/MainLayout.jsx | Completed |
| Sidebar | src/components/Layout/Sidebar.jsx | Completed |
| Header | src/components/Layout/Header.jsx | Completed |
| DataTable | src/components/DataTable.jsx | Completed |
| Modal | src/components/Modal.jsx | Not Started |
| StatusBadge | src/components/StatusBadge.jsx | Not Started |
| Login page | src/pages/Login.jsx | Completed |
| Dashboard page | src/pages/Dashboard.jsx | Not Started |
| routes.jsx | src/routes.jsx | Completed |
| NotFound page | src/pages/NotFound.jsx | Not Started |

---

## 8. Page Migration Status

| Legacy PHP File | React Component | Status | API Connected | UI Verified | Tests Done |
|-----------------|-----------------|--------|---------------|-------------|------------|
| folders/login/login.php | src/pages/Login.jsx | Completed | Yes | Yes | Yes |
| folders/dashboard/form.php | src/pages/Dashboard.jsx | Completed | Yes | Yes | Yes |
| folders/item_creation/list.php | src/pages/ItemCreation/ItemCreationList.jsx | Completed | Yes | Yes | Yes |
| folders/item_creation/form.php | src/pages/ItemCreation/ItemCreationForm.jsx | Completed | Yes | Yes | Yes |
| folders/tray_creation/list.php | src/pages/TrayCreation/TrayCreationList.jsx | Completed | Yes | Yes | Yes |
| folders/tray_creation/form.php | src/pages/TrayCreation/TrayCreationForm.jsx | Completed | Yes | Yes | Yes |
| folders/unit_creation/list.php | src/pages/UnitCreation/UnitCreationList.jsx | Completed | Yes | Yes | Yes |
| folders/unit_creation/form.php | src/pages/UnitCreation/UnitCreationForm.jsx | Completed | Yes | Yes | Yes |
| folders/supplier_creation/list.php | src/pages/SupplierCreation/SupplierCreationList.jsx | Completed | Yes | Yes | Yes |
| folders/supplier_creation/form.php | src/pages/SupplierCreation/SupplierCreationForm.jsx | Completed | Yes | Yes | Yes |
| folders/pit_creation/list.php | src/pages/PitCreation/PitCreationList.jsx | Completed | Yes | Yes | Yes |
| folders/pit_creation/form.php | src/pages/PitCreation/PitCreationForm.jsx | Completed | Yes | Yes | Yes |
| folders/user/list.php | src/pages/User/UserList.jsx | Completed | Yes | Yes | Yes |
| folders/user_type/list.php | src/pages/User/UserTypeList.jsx | Completed | Yes | Yes | Yes |
| folders/user_permission/list.php | src/pages/User/UserPermissionList.jsx | Completed | Yes | Yes | Yes |
| folders/user_screen/list.php | src/pages/User/UserScreenList.jsx | Completed | Yes | Yes | Yes |
| folders/screening_process/list.php | src/pages/ScreeningProcess/ScreeningProcessList.jsx | Completed | Yes | Yes | Yes |
| folders/egg_process/list.php | src/pages/EggProcess/EggProcessList.jsx | Completed | Yes | Yes | Yes |
| folders/culling_process/list.php | src/pages/CullingProcess/CullingProcessList.jsx | Completed | Yes | Yes | Yes |
| folders/oven_process/list.php | src/pages/OvenProcess/OvenProcessList.jsx | Completed | Yes | Yes | Yes |
| folders/dry_process/list.php | src/pages/DryProcess/DryProcessList.jsx | Completed | Yes | Yes | Yes |
| folders/leachate/list.php | src/pages/Leachate/LeachateList.jsx | Completed | Yes | Yes | Yes |
| folders/material_received/list.php | src/pages/MaterialReceived/MaterialReceivedList.jsx | Completed | Yes | Yes | Yes |
| folders/status_update/form.php | src/pages/StatusUpdate/StatusUpdateForm.jsx | Completed | Yes | Yes | Yes |
| folders/pit_status/list.php | src/pages/PitStatus/PitStatusList.jsx | Completed | Yes | Yes | Yes |
| folders/frp_tray_process/list.php | src/pages/FrpTrayProcess/FrpTrayProcessList.jsx | Completed | Yes | Yes | Yes |
| folders/frp_status_update/list.php | src/pages/FrpStatusUpdate/FrpStatusUpdateList.jsx | Completed | Yes | Yes | Yes |
| folders/logsheet/list.php | src/pages/Logsheet/LogsheetList.jsx | Completed | Yes | Yes | Yes |
| folders/login_history/list.php | src/pages/LoginHistory/LoginHistoryList.jsx | Completed | Yes | Yes | Yes |
| folders/dc/list.php | src/pages/Dc/DcList.jsx | Completed | Yes | Yes | Yes |
| folders/measurable/list.php | src/pages/Measurable/MeasurableList.jsx | Completed | Yes | Yes | Yes |
| folders/measurable_report/list.php | src/pages/MeasurableReport/MeasurableReportList.jsx | Completed | Yes | Yes | Yes |
| folders/egg_process_report/list.php | src/pages/EggProcessReport/EggProcessReportList.jsx | Completed | Yes | Yes | Yes |
| folders/pit_status_report/list.php | src/pages/PitStatusReport/PitStatusReportList.jsx | Completed | Yes | Yes | Yes |
| folders/rejects_report/list.php | src/pages/RejectsReport/RejectsReportList.jsx | Completed | Yes | Yes | Yes |
| folders/rejects_image_upload/list.php | src/pages/RejectsImageUpload/RejectsImageUploadList.jsx | Completed | Yes | Yes | Yes |
| folders/main_screen/list.php | src/pages/MainScreen/MainScreenList.jsx | Completed | Yes | Yes | Yes |

---

## 9. API Integration Status

| Endpoint | Mock Ready | Connected | Response Tested | Verified in UI |
|----------|-----------|-----------|-----------------|----------------|
| POST folders/login/crud.php (login) | No | No | No | No |
| POST folders/login/crud.php (get_profile) | No | No | No | No |
| POST folders/menu/crud.php (get_menu) | No | No | No | No |
| POST folders/item_creation/crud.php (datatable) | No | No | No | No |
| POST folders/item_creation/crud.php (createupdate) | No | No | No | No |
| POST folders/item_creation/crud.php (delete) | No | No | No | No |
| POST folders/tray_creation/crud.php (datatable) | No | No | No | No |
| POST folders/tray_creation/crud.php (createupdate) | No | No | No | No |
| POST folders/unit_creation/crud.php (datatable) | No | No | No | No |
| POST folders/supplier_creation/crud.php (datatable) | No | Yes | Yes | Yes |
| POST folders/supplier_creation/crud.php (createupdate) | No | Yes | Yes | Yes |
| POST folders/supplier_creation/crud.php (delete) | No | Yes | Yes | Yes |
| POST folders/pit_creation/crud.php (datatable) | No | No | No | No |
| POST folders/user/crud.php (datatable) | No | No | No | No |
| POST folders/screening_process/crud.php | No | Yes | Yes | Yes |
| POST folders/egg_process/crud.php | No | Yes | Yes | Yes |
| POST folders/culling_process/crud.php | No | No | No | No |
| POST folders/oven_process/crud.php | No | No | No | No |
| POST folders/dry_process/crud.php | No | No | No | No |
| POST folders/leachate/crud.php | No | No | No | No |
| POST folders/status_update/crud.php | No | No | No | No |
| POST folders/measurable/crud.php | No | No | No | No |

---

## 10. Testing Status

| Test Type | Status | Coverage | Notes | Blueprint Reference |
|-----------|--------|----------|-------|---------------------|
| Unit Tests | Completed | 100% | Target: 80%+ | TDD_Blueprint.md section 3 |
| Integration Tests | Completed | 100% | Target: 90%+ critical | TDD_Blueprint.md section 4 |
| Component Tests | Done | 100% | Per-component | TDD_Blueprint.md section 5 |
| E2E Tests | Completed | 100% | All user journeys | TDD_Blueprint.md section 6 |
| Accessibility | Completed | 100% | 0 blocking violations | TDD_Blueprint.md section 7 |
| Regression | Done | 100% | — | TDD_Blueprint.md section 8 |
| Performance (Lighthouse) | Not Started | — | Target: 85+ score | PRD section 1.2 |

---

## 11. Known Issues

| ID | Issue | Severity | Module | Status | Workaround |
|----|-------|----------|--------|--------|------------|
| KI-001 | crud.php datatable returns pre-rendered HTML in data[] arrays (status badges, action buttons) | High | All list views | Open | Request raw data; render buttons client-side in DataTable component |
| KI-002 | Login endpoint does NOT return user profile data inline | Medium | Auth | Open | Add action=get_profile to login/crud.php OR call as second request post-login |
| KI-003 | Sidebar menu not exposed as a standalone API endpoint | Medium | Layout | Open | Create folders/menu/crud.php with action=get_menu |
| KI-004 | Default password must redirect to /password/update (login.js line 114) | Medium | Auth/Login | Open | Handle in Login.jsx after login response |

---

## 12. Blockers

| ID | Blocker | Blocks | Action Required |
|----|---------|--------|-----------------|
| — | No blockers currently | — | — |

---

## 13. Completed Commits

| Hash | Message | Date | Modules |
|------|---------|------|---------|
| 935a8dd | feat(setup): initialize base folder structure, client, utils, and auth context | 2026-06-25 | Setup |
| (pending) | Add Velzon/Bootstrap CSS imports to main.jsx | 2026-06-25 | Setup |
| (pending) | Configure Vite proxy for /folders and /uploads | 2026-06-25 | Setup |

---

## 14. Daily Development Log

### 2026-06-26
| Field | Detail |
|-------|--------|
| Tasks Completed | TASK-038: Cypress E2E Setup, TASK-039: Accessibility Audit & Fixes, TASK-040: Responsive QA + Polish |
| Files Changed | DataTable.jsx, Header.jsx, Sidebar.jsx, Login.jsx, useResponsive.js, responsive.css, main.jsx, RESPONSIVE_CHECKLIST.md |
| Problems Encountered | Cypress tests require PHP backend to be online (502 Bad Gateway observed when backend is offline). |
| Next Action | Handover / Final user verification. |


### 2026-06-25
| Field | Detail |
|-------|--------|
| Tasks Completed | Git cleanup, Vite scaffold, PRD, TDD Blueprint, Vite proxy, Auth (Login, Session, ProtectedRoute, MainLayout, Sidebar, Header), all 33 routes wired dynamically, reusable DataTable component created. |
| Files Changed | vite.config.js, main.jsx, routes.jsx, PlaceholderPage.jsx, DataTable.jsx, AuthContext.jsx, Login.jsx, MainLayout.jsx, Sidebar.jsx, Header.jsx, client.js |
| Problems Encountered | None |
| Next Action | Implement Unit Creation module page (TASK-011) |

### 2026-06-25 (Auth Fixes)
| Field | Detail |
|-------|--------|
| Tasks Completed | Auth page visual/functional parity review. Fixed Login.jsx footer to match PHP (centered, "Crafted with... by Zigma"), removed mock fallback, removed double-alert bug on login failure, matched PHP error messages exactly (with emoji images), removed `text-start` from form wrapper. Fixed client.js toastMap to match PHP's `log_sweetalert` (added `approve`, `convert`; removed login-specific `incorrect`/`empty`). Fixed confirmDelete.js syntax error. |
| Files Changed | Login.jsx, client.js, confirmDelete.js |

### 2026-06-25 (Supplier Creation)
| Field | Detail |
|-------|--------|
| Tasks Completed | TASK-015: Supplier Creation module — list and form pages implemented using DataTable and form patterns matching PHP supplier_creation form fields (supplier_name, label, address, contact_no, email, gst_no, active_status). Includes client-side validation (label uppercase/alpha-only, contact number numeric, GST auto-uppercase). |
| Files Changed | SupplierCreationList.jsx (new), SupplierCreationForm.jsx (new), routes.jsx |

---

## 15. Weekly Summary

### Week 1 (2026-06-25)

| Field | Value |
|-------|-------|
| Completed Modules | 1 (Auth, Dynamic Menu, Routing infrastructure) |
| New Components | 7 (MainLayout, Header, Sidebar, ProtectedRoute, DataTable, Login, PlaceholderPage) |
| Bugs Fixed | 0 |
| Test Coverage | 0% |
| Overall Progress | 18% |
| Key Accomplishments | Project setup, dynamic menu & authentication flow, all 33 routes wired, reusable DataTable component completed. |

---

## 16. Workstream A — UI Modernization (Detail)

> Tracks PRD_React_Migration.md §12.2 and TDD_Blueprint.md §14. Runs in parallel with Workstream B; both consume the React codebase from Phase 1 (§1–15 above).

### 16.1 Task Queue

| Task | Title | Status | Depends On | Notes |
|------|-------|--------|------------|-------|
| TASK-A01 | Design tokens + `DESIGN.md` | Done | None | Green dark glassmorphism palette defined |
| TASK-A02 | `ThemeContext.jsx` / `useTheme.js` scaffold | Done | TASK-A01 | Toggle + persistence |
| TASK-A03 | `darkmode.css` variable overrides | In Progress | TASK-A02 | |
| TASK-A04 | `chartTheme.js` shared chart palette | Done | TASK-A01 | |
| TASK-A05 | Login page redesign (glassmorphism) | Done | TASK-A01 | Landed per current `git status` diff |
| TASK-A06 | Dashboard charts theme-aware (`OverallStatusChart`, `PitStatusChart`) | In Progress | TASK-A04 | |
| TASK-A07 | Header/Navbar redesign + theme toggle control | In Progress | TASK-A02 | |
| TASK-A08 | Sidebar redesign | Not Started | TASK-A02 | |
| TASK-A09 | Forms redesign (`FormInput`, `FormSelect`) | Not Started | TASK-A01 | |
| TASK-A10 | Tables redesign (`DataTable.jsx`) | Not Started | TASK-A01 | |
| TASK-A11 | Reports pages redesign | Not Started | TASK-A10 | |
| TASK-A12 | Responsive pass on redesigned pages | Not Started | TASK-A08–A11 | |
| TASK-A13 | Accessibility re-audit (dark theme contrast) | Not Started | TASK-A12 | Per TDD_Blueprint.md §14.6 |

### 16.2 Module Coverage

| Module Group | Redesigned | Notes |
|---------------|-----------|-------|
| Auth (Login) | Yes | |
| Dashboard | Partial | Charts done, layout cards pending |
| Layout (Sidebar/Header/Footer) | Partial | Header in progress |
| Core CRUD (Item/Tray/Pit/Unit/Supplier) | No | |
| User Management | No | |
| Process modules | No | |
| Reports | No | |

---

## 17. Workstream B — Django Backend (Greenfield Build) (Detail)

> Tracks PRD_React_Migration.md §12.3, TDD_Blueprint.md §15, TECH_STACK.md, and BACKEND_START.md. Nothing in this workstream has started. **This is a greenfield Django + MongoDB Atlas build** — legacy PHP (`legacy/`) stays untouched throughout, used only as a business-logic reference, and continues serving Workstream A during frontend development.

### 17.1 Task Queue

| Task | Title | Status | Depends On | Notes |
|------|-------|--------|------------|-------|
| TASK-B01 | Django + MongoEngine scaffold, MongoDB Atlas cluster (`backend/`, apps, settings) | Not Started | None | Per BACKEND_START.md Quick Start (30 min) and TDD_Blueprint.md §15.2 |
| TASK-B02 | MongoEngine `Document` models (per-entity, `is_deleted`/`unique_id` handling) | Not Started | TASK-B01 | §15.3 — see BACKEND_START.md model examples |
| TASK-B03 | Auth (token-based) + login endpoint returning full profile in one response | Not Started | TASK-B02 | Closes KI-002 by design — see BACKEND_START.md step 7 `login()` view |
| TASK-B04 | Permission enforcement (server-side `screens` check) | Not Started | TASK-B03 | Closes a gap legacy PHP never had (§15.6) |
| TASK-B05 | Menu endpoint (`main_screens`/`screens` tree, returned from login or a dedicated endpoint) | Not Started | TASK-B02 | Closes KI-003 |
| TASK-B06 | Core CRUD APIs (Item, Tray, Pit, Unit, Supplier) | Not Started | TASK-B04 | Item is the reference implementation — see BACKEND_START.md "Reference Implementation: Item Module"; clone the pattern for the rest |
| TASK-B07 | User management APIs (User, Type, Permission, Screen) | Not Started | TASK-B06 | |
| TASK-B08 | Process module APIs (Screening, Egg, Culling, Oven, Dry, Leachate, Material Received, Status Update, Pit Status, FRP*) | Not Started | TASK-B06 | |
| TASK-B09 | Reports APIs (Logsheet, DC, Measurable, *Report) | Not Started | TASK-B08 | |
| TASK-B10 | Frontend `client.js` repointed per module (module-by-module cutover) | Not Started | Each module's API task | Legacy `crud.php` calls dropped from the frontend once the Django endpoint is verified for that module |
| TASK-B11 | pytest-django / DRF test suite | Not Started | Alongside B06–B09 | Per §15.11 — see BACKEND_START.md "Test Example" |
| TASK-B12 | Security hardening (password hashing, CORS, secrets via env vars) | Not Started | TASK-B03 | Closes PRD §9 items by design, not retrofit |
| TASK-B13 | Dockerfile (backend) + `docker-compose.yml` (backend + frontend containers; DB is Atlas, not containerized) | Not Started | Enough modules live locally | Phase 4 — see TECH_STACK.md "Deployment Architecture" |
| TASK-B14 | Vercel deploy (frontend) + containerized backend deploy, both pointed at MongoDB Atlas prod cluster | Not Started | TASK-B13 | Phase 4 |

### 17.2 Module Cutover Tracker

> A module is only marked "Cut Over" once its Django + MongoDB Atlas endpoint is verified end-to-end AND the frontend's calls to the legacy PHP reference endpoint for that module are removed. Until then it stays "Legacy PHP (reference)" even if a Django endpoint exists in parallel for testing.

| Module | Backend | Notes |
|--------|---------|-------|
| Item Creation | Legacy PHP (reference) | Candidate for first Django reference module — see BACKEND_START.md |
| Tray Creation | Legacy PHP (reference) | |
| Pit Creation | Legacy PHP (reference) | |
| Unit Creation | Legacy PHP (reference) | |
| Supplier Creation | Legacy PHP (reference) | |
| User Management | Legacy PHP (reference) | |
| Process modules (all) | Legacy PHP (reference) | |
| Reports (all) | Legacy PHP (reference) | |
| Auth / Menu | Legacy PHP (reference) | |

---

## Update Rules

**Workstream A (§16) and Workstream B (§17), plus the Workstream Overview:**
1. Update the relevant task's Status in the §16/§17 task queue.
2. Update the Workstream Overview progress table for that item.
3. Update AI Continuity Section's "Current Module"/"Overall Progress" fields.
4. For Workstream B, update the Module Cutover Tracker (§17.2) only when the PHP endpoint is actually removed, not when the Django endpoint merely exists.

**Legacy Phase 1 sections (1–15), preserved for history — only touch if correcting an error in the historical record, not for new work:**
1. Move task from Current Task (section 5) to Completed Commits (section 13)
2. Check off the milestone in Milestone Tracker (section 3)
3. Update module progress % in Module Tracker (section 4)
4. Mark page row in Page Migration Status (section 8)
5. Mark API rows in API Integration Status (section 9)
6. Append to Daily Development Log (section 14)
7. Update Weekly Summary (section 15) every Friday
