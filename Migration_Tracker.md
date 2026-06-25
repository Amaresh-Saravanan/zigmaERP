# Zigma ERP — Migration Tracker

> **LIVING DOCUMENT** — Update after every completed task. This is the single source of truth for the entire PHP-to-React migration.

---

## AI Continuity Section

> **Read this first before writing any code.**

| Field | Value |
|-------|-------|
| **Current Phase** | Phase 2 — Auth and Layout |
| **Current Module** | Authentication & Layout |
| **Current Task** | TASK-007 — MainLayout.jsx + Sidebar.jsx |
| **Last Completed Task** | TASK-006 — ProtectedRoute.jsx |
| **Overall Progress** | ~8% |
| **Active Blocker** | None |

### Completed Work
- Git repository cleanup (moved erp to its own repo)
- Vite + React scaffold exists at frontend/
- main.jsx — Bootstrap + Velzon CSS imported
- vite.config.js — Proxy /folders and /uploads to http://localhost
- PRD v2 written (PRD_React_Migration.md, 808 lines)
- TDD Blueprint written (TDD_Blueprint.md, 1123 lines)
- utils/ helpers (disname, confirmDelete) completed
- Login page UI & POST integration implemented (`Login.jsx`)
- Session validation endpoint (`folders/login/session.php`) and full `AuthContext` status check
- `ProtectedRoute` component and `usePermission` hook completed

### Next Recommended Action
Create `MainLayout.jsx` and `Sidebar.jsx` with dynamic navigation rendering matching legacy `menu.php` permissions.

### Key Constraints (never forget)
- PHP backend is NOT being changed. Only frontend is migrated.
- Auth = PHP sessions (NOT JWT, NOT localStorage)
- POST format = application/x-www-form-urlencoded with withCredentials: true
- Velzon/Bootstrap CSS already imported in main.jsx — do NOT re-import per component
- No TypeScript — plain .jsx / .js
- Ponytail FULL mode: YAGNI, no unnecessary abstractions

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
| **Overall Progress** | 4% |

---

## 2. Development Status Dashboard

| Area | Status | Progress |
|------|--------|----------|
| Project Setup | Done | 100% |
| Auth and Session | In Progress | 75% |
| Core Components | Not Started | 0% |
| Page Migrations | Not Started | 0% |
| API Integration | Not Started | 0% |
| Unit Tests | Not Started | 0% |
| Integration Tests | Not Started | 0% |
| E2E Tests | Not Started | 0% |
| Accessibility | Not Started | 0% |
| Deployment | Not Started | 0% |

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
| Phase 2 | MainLayout.jsx + Sidebar | In Progress | — | |
| Phase 2 | Header.jsx + logout | Not Started | — | |
| Phase 2 | ProtectedRoute.jsx | Done | 2026-06-25 | gates authenticated routes |
| Phase 2 | routes.jsx — all 33 module routes | Not Started | — | |
| Phase 3 | DataTable.jsx component | Not Started | — | |
| Phase 3 | Item Creation module | Not Started | — | Reference implementation |
| Phase 3 | Tray Creation module | Not Started | — | |
| Phase 3 | Pit Creation module | Not Started | — | |
| Phase 3 | Unit Creation module | Not Started | — | |
| Phase 3 | Supplier Creation module | Not Started | — | |
| Phase 3 | User Management | Not Started | — | User, Type, Permission, Screen |
| Phase 4 | All Process modules | Not Started | — | Screening, Egg, Culling, Oven, Dry, etc. |
| Phase 5 | Dashboard + Reports | Not Started | — | |
| Phase 6 | Testing + QA | Not Started | — | Vitest, MSW, Cypress, a11y |

---

## 4. Module Tracker

| Module | Status | Progress | Priority | Complexity | Dependencies | Components | Tests | Notes |
|--------|--------|----------|----------|------------|--------------|------------|-------|-------|
| Authentication | Not Started | 0% | Critical | Medium | None | Login.jsx, AuthContext, ProtectedRoute | No | PHP session, no JWT |
| Dashboard | Not Started | 0% | High | Medium | Auth | Dashboard.jsx, Charts | No | Hidden for worker role 6213273aa04b228161 |
| Item Creation | Not Started | 0% | High | Low | Auth, DataTable, Units | ItemCreationList, ItemCreationForm | No | Reference impl; IT- prefix auto-code |
| Tray Creation | Not Started | 0% | High | Low | Auth, DataTable | TrayCreationList, TrayCreationForm | No | |
| Pit Creation | Not Started | 0% | Medium | Low | Auth, DataTable | PitCreationList | No | |
| Unit Creation | Not Started | 0% | Medium | Low | Auth, DataTable | UnitCreationList | No | FK dep for Item Creation |
| Supplier Creation | Not Started | 0% | Medium | Low | Auth, DataTable | SupplierCreationList | No | |
| User Management | Not Started | 0% | High | High | Auth | UserList, UserTypeList, UserPermissionList, UserScreenList | No | 4 sub-modules |
| Screening Process | Not Started | 0% | Medium | High | Items, Trays | ScreeningProcessList, ScreeningProcessForm | No | |
| Egg Process | Not Started | 0% | Medium | High | Screening | EggProcessList, EggProcessForm | No | |
| Culling Process | Not Started | 0% | Medium | High | Egg | CullingProcessList | No | |
| Oven Process | Not Started | 0% | Medium | High | Items, Trays | OvenProcessList | No | |
| Dry Process | Not Started | 0% | Medium | High | Oven | DryProcessList | No | |
| Leachate | Not Started | 0% | Medium | Medium | Pits | LeachateList | No | |
| Material Received | Not Started | 0% | Medium | Medium | Supplier | MaterialReceivedList | No | |
| Status Update | Not Started | 0% | Medium | Medium | Pits, Trays | StatusUpdateForm | No | Form-only, no list |
| Pit Status | Not Started | 0% | Medium | Medium | Pits | PitStatusList | No | |
| FRP Tray Process | Not Started | 0% | Low | Medium | Trays | FrpTrayProcessList | No | |
| FRP Status Update | Not Started | 0% | Low | Medium | FRP Tray | FrpStatusUpdateList | No | |
| Logsheet | Not Started | 0% | Medium | Medium | Process modules | LogsheetList | No | |
| DC | Not Started | 0% | Low | Medium | Supplier | DcList | No | |
| Measurable | Not Started | 0% | Low | Low | None | MeasurableList | No | |
| Login History | Not Started | 0% | Low | Low | Auth | LoginHistoryList | No | Read-only report |
| Measurable Report | Not Started | 0% | Low | Low | Measurable | MeasurableReportList | No | |
| Egg Process Report | Not Started | 0% | Low | Low | Egg | EggProcessReportList | No | |
| Pit Status Report | Not Started | 0% | Low | Low | Pit Status | PitStatusReportList | No | |
| Rejects Report | Not Started | 0% | Low | Low | Culling | RejectsReportList | No | |
| Rejects Image Upload | Not Started | 0% | Low | Medium | Rejects | RejectsImageUploadList | No | File upload handling |
| Main Screen Admin | Not Started | 0% | Low | Low | Auth | MainScreenList | No | Admin-only |

---

## 5. Current Task

`
TASK-007
Objective:     Build MainLayout.jsx and Sidebar.jsx with dynamic navigation based on permissions
Files:         frontend/src/components/Layout/MainLayout.jsx [CREATE]
               frontend/src/components/Layout/Sidebar.jsx    [CREATE]
Expected:      A layout shell rendering header, sidebar, and outlet.
               Sidebar dynamically loops through permission lists and builds submenus.
Acceptance:    - Sidebar filters main menu groups by user.mainScreens
               - Sidebar filters sub-menus by user.screens
               - UI matches the legacy side menu structure
Estimated:     45-60 minutes
Notes:         Ponytail: no TypeScript, no class components. Keep each file under 50 lines.
`

---

## 6. Next Task Queue

| Task | Title | Priority | Depends On | Complexity |
|------|-------|----------|------------|------------|
| TASK-003 | Base src/ structure + api/client.js | Done | TASK-002 done | Low |
| TASK-004 | Login.jsx page + auth POST | Done | TASK-003 | Low |
| TASK-005 | AuthContext.jsx full implementation | Done | TASK-004 | Medium |
| TASK-006 | ProtectedRoute.jsx | Done | TASK-005 | Low |
| TASK-007 | MainLayout.jsx + Sidebar.jsx | In Progress | TASK-005 | Medium |
| TASK-008 | Header.jsx + logout | High | TASK-007 | Low |
| TASK-009 | routes.jsx — all 33 routes wired | High | TASK-007 | Low |
| TASK-010 | DataTable.jsx reusable component | High | TASK-003 | Medium |
| TASK-011 | Unit Creation module | High | TASK-010 | Low |
| TASK-012 | Item Creation module (reference impl) | High | TASK-011 | Low |
| TASK-013 | Tray Creation module | Medium | TASK-012 | Low |
| TASK-014 | Pit Creation module | Medium | TASK-010 | Low |
| TASK-015 | Supplier Creation module | Medium | TASK-010 | Low |
| TASK-016 | User Management (4 sub-modules) | High | TASK-010 | High |
| TASK-017 | Screening Process | Medium | TASK-012, TASK-013 | High |
| TASK-018 | Egg Process | Medium | TASK-017 | High |
| TASK-019 | Culling Process | Medium | TASK-018 | High |
| TASK-020 | Oven Process | Medium | TASK-012, TASK-013 | High |
| TASK-021 | Dry Process | Medium | TASK-020 | High |
| TASK-022 | Leachate | Medium | TASK-014 | Medium |
| TASK-023 | Material Received | Medium | TASK-015 | Medium |
| TASK-024 | Status Update | Medium | TASK-014, TASK-013 | Medium |
| TASK-025 | Pit Status | Medium | TASK-014 | Medium |
| TASK-026 | FRP Tray Process | Low | TASK-013 | Medium |
| TASK-027 | FRP Status Update | Low | TASK-026 | Medium |
| TASK-028 | Logsheet | Medium | TASK-017 | Medium |
| TASK-029 | DC | Low | TASK-015 | Medium |
| TASK-030 | Measurable | Low | TASK-010 | Low |
| TASK-031 | Dashboard + Charts | Medium | TASK-005 | Medium |
| TASK-032 | Login History | Low | TASK-005 | Low |
| TASK-033 | All Report modules (5x) | Low | TASK-019..TASK-025 | Low |
| TASK-034 | Rejects Image Upload | Low | TASK-019 | Medium |
| TASK-035 | Main Screen Admin | Low | TASK-005 | Low |
| TASK-036 | Vitest setup + unit tests | Medium | TASK-012 | Medium |
| TASK-037 | MSW setup + integration tests | Medium | TASK-036 | Medium |
| TASK-038 | Cypress E2E setup + test suites | Medium | TASK-035 | High |
| TASK-039 | Accessibility audit + fixes | Medium | TASK-038 | Medium |
| TASK-040 | Responsive QA + polish | Medium | TASK-039 | Medium |

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
| MainLayout | src/components/Layout/MainLayout.jsx | Not Started |
| Sidebar | src/components/Layout/Sidebar.jsx | Not Started |
| Header | src/components/Layout/Header.jsx | Not Started |
| DataTable | src/components/DataTable.jsx | Not Started |
| Modal | src/components/Modal.jsx | Not Started |
| StatusBadge | src/components/StatusBadge.jsx | Not Started |
| Login page | src/pages/Login.jsx | Completed |
| Dashboard page | src/pages/Dashboard.jsx | Not Started |
| routes.jsx | src/routes.jsx | In Progress |
| NotFound page | src/pages/NotFound.jsx | Not Started |

---

## 8. Page Migration Status

| Legacy PHP File | React Component | Status | API Connected | UI Verified | Tests Done |
|-----------------|-----------------|--------|---------------|-------------|------------|
| folders/login/login.php | src/pages/Login.jsx | Completed | Yes | Yes | No |
| folders/dashboard/form.php | src/pages/Dashboard.jsx | Not Started | No | No | No |
| folders/item_creation/list.php | src/pages/ItemCreation/ItemCreationList.jsx | Not Started | No | No | No |
| folders/item_creation/form.php | src/pages/ItemCreation/ItemCreationForm.jsx | Not Started | No | No | No |
| folders/tray_creation/list.php | src/pages/TrayCreation/TrayCreationList.jsx | Not Started | No | No | No |
| folders/tray_creation/form.php | src/pages/TrayCreation/TrayCreationForm.jsx | Not Started | No | No | No |
| folders/unit_creation/list.php | src/pages/UnitCreation/UnitCreationList.jsx | Not Started | No | No | No |
| folders/supplier_creation/list.php | src/pages/SupplierCreation/SupplierCreationList.jsx | Not Started | No | No | No |
| folders/pit_creation/list.php | src/pages/PitCreation/PitCreationList.jsx | Not Started | No | No | No |
| folders/user/list.php | src/pages/User/UserList.jsx | Not Started | No | No | No |
| folders/user_type/list.php | src/pages/User/UserTypeList.jsx | Not Started | No | No | No |
| folders/user_permission/list.php | src/pages/User/UserPermissionList.jsx | Not Started | No | No | No |
| folders/user_screen/list.php | src/pages/User/UserScreenList.jsx | Not Started | No | No | No |
| folders/screening_process/list.php | src/pages/ScreeningProcess/ScreeningProcessList.jsx | Not Started | No | No | No |
| folders/egg_process/list.php | src/pages/EggProcess/EggProcessList.jsx | Not Started | No | No | No |
| folders/culling_process/list.php | src/pages/CullingProcess/CullingProcessList.jsx | Not Started | No | No | No |
| folders/oven_process/list.php | src/pages/OvenProcess/OvenProcessList.jsx | Not Started | No | No | No |
| folders/dry_process/list.php | src/pages/DryProcess/DryProcessList.jsx | Not Started | No | No | No |
| folders/leachate/list.php | src/pages/Leachate/LeachateList.jsx | Not Started | No | No | No |
| folders/material_received/list.php | src/pages/MaterialReceived/MaterialReceivedList.jsx | Not Started | No | No | No |
| folders/status_update/form.php | src/pages/StatusUpdate/StatusUpdateForm.jsx | Not Started | No | No | No |
| folders/pit_status/list.php | src/pages/PitStatus/PitStatusList.jsx | Not Started | No | No | No |
| folders/frp_tray_process/list.php | src/pages/FrpTrayProcess/FrpTrayProcessList.jsx | Not Started | No | No | No |
| folders/frp_status_update/list.php | src/pages/FrpStatusUpdate/FrpStatusUpdateList.jsx | Not Started | No | No | No |
| folders/logsheet/list.php | src/pages/Logsheet/LogsheetList.jsx | Not Started | No | No | No |
| folders/login_history/list.php | src/pages/LoginHistory/LoginHistoryList.jsx | Not Started | No | No | No |
| folders/dc/list.php | src/pages/Dc/DcList.jsx | Not Started | No | No | No |
| folders/measurable/list.php | src/pages/Measurable/MeasurableList.jsx | Not Started | No | No | No |
| folders/measurable_report/list.php | src/pages/MeasurableReport/MeasurableReportList.jsx | Not Started | No | No | No |
| folders/egg_process_report/list.php | src/pages/EggProcessReport/EggProcessReportList.jsx | Not Started | No | No | No |
| folders/pit_status_report/list.php | src/pages/PitStatusReport/PitStatusReportList.jsx | Not Started | No | No | No |
| folders/rejects_report/list.php | src/pages/RejectsReport/RejectsReportList.jsx | Not Started | No | No | No |
| folders/rejects_image_upload/list.php | src/pages/RejectsImageUpload/RejectsImageUploadList.jsx | Not Started | No | No | No |
| folders/main_screen/list.php | src/pages/MainScreen/MainScreenList.jsx | Not Started | No | No | No |

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
| POST folders/supplier_creation/crud.php (datatable) | No | No | No | No |
| POST folders/pit_creation/crud.php (datatable) | No | No | No | No |
| POST folders/user/crud.php (datatable) | No | No | No | No |
| POST folders/screening_process/crud.php | No | No | No | No |
| POST folders/egg_process/crud.php | No | No | No | No |
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
| Unit Tests (Vitest) | Not Started | 0% | Target: 80%+ | TDD_Blueprint.md section 3 |
| Integration Tests (MSW) | Not Started | 0% | Target: 90%+ critical | TDD_Blueprint.md section 4 |
| Component Tests | Not Started | 0% | Per-component | TDD_Blueprint.md section 5 |
| E2E Tests (Cypress) | Not Started | 0% | All user journeys | TDD_Blueprint.md section 6 |
| Accessibility (jest-axe) | Not Started | 0% | 0 blocking violations | TDD_Blueprint.md section 7 |
| Regression | Not Started | 0% | — | TDD_Blueprint.md section 8 |
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

### 2026-06-25
| Field | Detail |
|-------|--------|
| Tasks Completed | Git cleanup, Vite scaffold, PRD v2, TDD Blueprint, Vite proxy config |
| Files Changed | vite.config.js, main.jsx, PRD_React_Migration.md, TDD_Blueprint.md |
| Problems Encountered | PowerShell Set-Content fails with large heredocs |
| Solution | Used Python open().write() for large file writes |
| Next Action | Create src/ directory structure + api/client.js |

---

## 15. Weekly Summary

### Week 1 (2026-06-25)

| Field | Value |
|-------|-------|
| Completed Modules | 0 |
| New Components | 0 |
| Bugs Fixed | 0 |
| Test Coverage | 0% |
| Overall Progress | 6% |
| Key Accomplishments | Project setup, documentation (PRD, TDD Blueprint, Migration Tracker), Vite proxy config |

---

## Update Rules

When a task is completed:
1. Move task from Current Task (section 5) to Completed Commits (section 13)
2. Update the AI Continuity Section at the top with the new current task
3. Check off the milestone in Milestone Tracker (section 3)
4. Update module progress % in Module Tracker (section 4)
5. Mark page row in Page Migration Status (section 8)
6. Mark API rows in API Integration Status (section 9)
7. Update Overall Progress % in Project Overview (section 1) and Dashboard (section 2)
8. Append to Daily Development Log (section 14)
9. Update Weekly Summary (section 15) every Friday
