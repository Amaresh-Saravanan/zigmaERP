# Form Section Styling Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all 23 non-Screening `*Form.jsx` data-entry pages to the same visual pattern as `ScreeningProcessForm.jsx`: a `FormHeader` (title + "Back to list") and fields grouped under icon-labeled `form-section-title` headers.

**Architecture:** One new shared component (`FormHeader`) replaces the duplicated ad-hoc header markup in all 23 files. Field groups get a preceding `<p className="form-section-title">` (CSS already global in `ux.css`, no new styling). No state, API, or validation logic changes anywhere — this is a markup-only rollout.

**Tech Stack:** React (existing), react-router-dom `useNavigate` (existing), Remix Icon classes (already a global dependency — used throughout the sidebar and in `ScreeningProcessForm`), Vitest + Testing Library (already configured, `npm run test` in `frontend/`).

## Global Constraints

- No new npm dependencies.
- No backend/API request or response shape changes in any file.
- No changes to `formData` state shape, fetch/submit logic, or modal internals in any file — only header markup and section-title `<p>` insertions.
- Pipeline breadcrumb and numbered step indicator (`PipelinePosition`, `StepIndicator`) stay unique to `ScreeningProcessForm.jsx` — do not add them elsewhere.
- Every touched file must pass `npx oxlint <file>` (run from `frontend/`) with no new errors before it's considered done.

## Why this plan doesn't spell out 80 individual diffs

22 of the 23 files are the same two mechanical edits repeated: swap a header block for `<FormHeader>`, and insert `form-section-title` paragraphs at field-group boundaries. Pre-writing every literal before/after diff here would just be transcribing content already captured in this session's file reads, with no reduction in risk. Instead, Task 1 is spelled out in full (it's genuinely new code), and Tasks 2–24 are driven by two reusable **recipes** plus **one decision table** that pins down the part that actually requires judgment: which fields belong in which section, what each section is called, which icon it gets, and which files deviate from the mechanical pattern. Apply the recipes directly against each file with the Edit tool, using the table as the spec for that file.

---

## Task 1: Create the shared `FormHeader` component

**Files:**
- Create: `frontend/src/components/FormHeader.jsx`
- Create: `frontend/src/components/FormHeader.test.jsx`

**Interfaces:**
- Produces: `export default function FormHeader({ title, backTo })` — renders a card-header row with an `<h5>{title}</h5>` and a "Back to list" button that navigates to `backTo`. Used by every task in this plan as `<FormHeader title="..." backTo="/xxx/list" />`, placed as the first child of the existing `<div className="card">`, replacing that file's old header block.

- [ ] **Step 1: Write the failing test**

```jsx
// frontend/src/components/FormHeader.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import FormHeader from './FormHeader';

describe('FormHeader', () => {
  it('renders the title and navigates to backTo when clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/item_creation/form']}>
        <Routes>
          <Route path="/item_creation/form" element={<FormHeader title="New Item" backTo="/item_creation/list" />} />
          <Route path="/item_creation/list" element={<div>Item List Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'New Item' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /back to list/i }));

    expect(screen.getByText('Item List Page')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run (from `frontend/`): `npx vitest run src/components/FormHeader.test.jsx`
Expected: FAIL — `Failed to resolve import "./FormHeader"`.

- [ ] **Step 3: Write the component**

```jsx
// frontend/src/components/FormHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FormHeader({ title, backTo }) {
  const navigate = useNavigate();
  return (
    <div className="card-header">
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
        <h5>{title}</h5>
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="btn btn-sm d-flex align-items-center gap-1"
          style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)', border: '1px solid var(--vz-border-color)', borderRadius: 6 }}
        >
          <i className="ri-arrow-left-s-line"></i> Back to list
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npx vitest run src/components/FormHeader.test.jsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/FormHeader.jsx frontend/src/components/FormHeader.test.jsx
git commit -m "feat(frontend): add shared FormHeader component for data-entry forms"
```

---

## Shared editing recipes (apply in Tasks 2–24)

Every target file already imports `useNavigate` and has a `unique_id` from `useSearchParams` (except where the table says otherwise). For each file:

**0. Add the import**, alongside the other `components/*` imports:
```jsx
import FormHeader from '../../components/FormHeader';
```

**Recipe A — Replace the old header.** All 22 mechanical files (everything except `DCForm`, which keeps its own header — see table) currently have one of these two shapes:

Shape A1 (most common):
```jsx
          <div className="card-header pt-3 pb-2">
            <div className="row flex-between-end">
              <div className="col-auto align-self-center">
                <h5 className="d-flex align-items-center">
                  TITLE {unique_id ? 'Update' : 'Create'}
                </h5>
              </div>
            </div>
          </div>
```
Shape A2 (`MainScreenForm`, `RejectsImageUploadForm` — plain, no back button today):
```jsx
          <div className="card-header pt-3 pb-2">
            <h5 className="mb-0">TITLE {unique_id ? 'Update' : 'Create'}</h5>
          </div>
```
Both become:
```jsx
          <FormHeader
            title={`${unique_id ? 'Update' : 'New'} TITLE`}
            backTo="/ROUTE/list"
          />
```
(`TITLE` and `/ROUTE/` come from the table below.)

**Recipe B — Split a flat row into titled sections.** Where a form's fields sit in one `<div className="row"> ... </div>` and need to become 2+ sections, find the blank-line boundary between the last field `<div className="col-...">` of one group and the first of the next, and turn:
```jsx
                  </div>

                  <div className="col-...">
                    <NextFieldComponent
```
into:
```jsx
                  </div>
                </div>

                <p className="form-section-title mt-2">
                  <i className="ri-ICON me-1"></i> NEXT SECTION NAME
                </p>
                <div className="row">
                  <div className="col-...">
                    <NextFieldComponent
```
And prepend the very first row (no `mt-2` on the first title, matching `ScreeningProcessForm`):
```jsx
                <p className="form-section-title">
                  <i className="ri-ICON me-1"></i> FIRST SECTION NAME
                </p>
                <div className="row">
```
Single-section files just get this opening title with no splits.

**Recipe C — Title an already-separate block.** Some files already have their groups in distinct `<div className="row ...">` blocks, or under a plain `<h6>`. No row-splitting needed — either insert `<p className="form-section-title mt-2">...</p>` directly before the existing row, or replace an existing `<h6 className="...">Heading</h6>` with `<p className="form-section-title"><i className="ri-ICON me-1"></i> Heading</p>` (drop the h6 — the CSS class already gives uppercase + border + spacing).

After each file: run `npx oxlint src/pages/<Folder>/<File>.jsx` (from `frontend/`) and confirm no new errors, then commit that file alone.

---

## Decision table (Tasks 2–24 — one file each, same order as the spec's scope list)

| # | File | Route | Recipe | Sections (name — icon — fields) |
|---|------|-------|--------|----------------------------------|
| 2 | `CullingProcess/CullingProcessForm.jsx` | `/culling_process/list` | A + B (2 splits) | **Shift & Cylinder Details** — `ri-user-settings-line` — entry_date, shift_type, cylinder_type, cylinder_no · **Weight & Fuel Measurements** — `ri-scales-3-line` — starting_weight, ending_weight, fuel_consumption, raw_material_weight, final_larvae_weight · **Work Completion** — `ri-checkbox-circle-line` — work_done, others_remarks |
| 3 | `DC/DCForm.jsx` | *(exception — see note below)* | C only, no header change | **Document Details** — `ri-file-list-3-line` — inserted before the existing `row bg-light p-3 rounded mb-4` block (challanDate, poRef, poDate, challanType) · **Bill To / Ship To** — `ri-map-pin-2-line` — replace the existing `<h6 className="fw-bold text-uppercase border-bottom pb-2">Bill To / Ship To</h6>` with a `form-section-title` paragraph using this icon |
| 4 | `DryProcess/DryProcessForm.jsx` | `/dry_process/list` | A, no split | **Drying Details** — `ri-sun-line` — date, type, drying_method, quantity, qty_manure |
| 5 | `EggProcess/EggProcessForm.jsx` | `/egg_process/list` | A + B (1 split, after `tot_qty`, before `tray_utilized`) | **Batch & Supplier** — `ri-file-list-3-line` — entry_no (if present), entry_date, batch, supplier_display, tot_qty · **Tray & Add-Ons** — `ri-stack-line` — tray_utilized, the Select-Trays/Add-On buttons row |
| 6 | `FrpStatusUpdate/FrpStatusUpdateForm.jsx` | `/frp_status_update/list` | A + B (1 split, after `day`, before `hatching_status`) | **Batch Tracking** — `ri-file-list-3-line` — entry_date, batch_id, entry_no, starting_day, day · **Status & Attachments** — `ri-checkbox-circle-line` — hatching_status, test_file (FileInput), remarks |
| 7 | `FrpTrayProcess/FrpTrayProcessForm.jsx` | `/frp_tray_process/list` | A, no split | **Tray Assignment** — `ri-stack-line` — entry_date, egg_batch_id, frp_tray_count, frp_tray_name |
| 8 | `ItemCreation/ItemCreationForm.jsx` | `/item_creation/list` | A, no split (title only before the first of its 2 existing rows) | **Item Details** — `ri-price-tag-3-line` — item_code, item_name, unit, active_status |
| 9 | `Leachate/LeachateForm.jsx` | `/leachate/list` | A, no split | **Leachate Details** — `ri-drop-line` — entry_date, qty_leachate, remarks |
| 10 | `MainScreen/MainScreenForm.jsx` | `/main_screen/list` | A (shape A2 — **note: this file has no back button today; FormHeader adds new navigation, not just a restyle**) | **Main Screen Details** — `ri-layout-grid-line` — screen_name, icon_name, active_status |
| 11 | `MaterialReceived/MaterialReceivedForm.jsx` | `/material_received/list` | A + B (1 split, after `unit_display`, before `invoice_date`) | **Supplier & Item** — `ri-truck-line` — date, supplier, item, qty, unit_display · **Invoice Details** — `ri-file-text-line` — invoice_date, invoice_no |
| 12 | `Measurable/MeasurableForm.jsx` | `/measurable/list` | A, no split | **Measurement Details** — `ri-thermometer-line` — entry_date, location, temp, humi, remarks |
| 13 | `OvenProcess/OvenProcessForm.jsx` | `/oven_process/list` | A + B (1 split, after `running_hours`, before `diesel_topup`) | **Run Time** — `ri-time-line` — entry_date, starting_time, closing_time, running_hours · **Production Quantities** — `ri-scales-3-line` — diesel_topup, raw_larvae_process, dried_larvae_production, dried_larvae_stock |
| 14 | `PitCreation/PitCreationForm.jsx` | `/pit_creation/list` | A, no split | **Pit Details** — `ri-map-pin-2-line` — pit_name, location, length, width, height, volume, description, active_status |
| 15 | `PitStatus/PitStatusForm.jsx` | `/pit_status/list` | A (base row) + C (6 conditional blocks, already separated by `border-top pt-3 mt-2`) | **Status Selection** — `ri-map-pin-2-line` — entry_date, pit, org_status, notes · then per `org_status`, title the existing conditional block: `1`→**Feeding Details** `ri-plant-line`; `2`→**Baby Larvae Intake** `ri-seedling-line`; `3`→**Aeration Method** `ri-windy-line`; `4`→**Temperature & Humidity** `ri-thermometer-line`; `5`→**Harvest Measurements** `ri-scales-3-line`; `7`→**Tippi Quantity** `ri-scales-3-line` |
| 16 | `RejectsImageUpload/RejectsImageUploadForm.jsx` | `/rejects_image_upload/list` | A (shape A2, **no back button today — same note as MainScreen**) + C (2 already-separate rows, no split) | **Ticket Details** — `ri-file-list-3-line` — entry_date, ticket_number, weigh_date, vehicle_number, net_weight_ton · **Image Upload** — `ri-image-line` — the FileInput row. Leave the `existingImagesHTML` `dangerouslySetInnerHTML` block untouched — its internal structure is legacy server HTML, out of scope. |
| 17 | `StatusUpdate/StatusUpdateForm.jsx` | `/status_update/list` | A + B (1 split, after `day`, before `hatching_status`) | **Batch Tracking** — `ri-file-list-3-line` — entry_date, batch, starting_day, day · **Hatching Status** — `ri-checkbox-circle-line` — hatching_status, remarks |
| 18 | `SupplierCreation/SupplierCreationForm.jsx` | `/supplier_creation/list` | A, no split | **Supplier Details** — `ri-truck-line` — supplier_name, label, address, contact_no, email, gst_no, active_status |
| 19 | `TrayCreation/TrayCreationForm.jsx` | `/tray_creation/list` | A, no split | **Tray Details** — `ri-stack-line` — tray_type, bin_name, active_status |
| 20 | `UnitCreation/UnitCreationForm.jsx` | `/unit_creation/list` | A, no split | **Unit Details** — `ri-scales-3-line` — unit_name, active_status |
| 21 | `User/UserForm.jsx` | `/user/list` | A + B (1 split, after `password`, before `first_name`) | **Account Details** — `ri-user-line` — emp_id, user_name, password · **Personal & Access** — `ri-shield-user-line` — first_name, last_name, email, user_type_unique_id, is_active |
| 22 | `UserPermission/UserPermissionForm.jsx` | `/user_permission/list` | A (**static title, no `unique_id` branch**: `title="User Permission"`) + C (3 already-separate blocks) | **User Type Selection** — `ri-user-settings-line` — the `user_type` Select row · **Main Screens Access** — `ri-layout-grid-line` — replaces `<h6 className="mb-2">Main Screens (sidebar sections)</h6>` · **Module Access** — `ri-shield-check-line` — replaces `<h6 className="mb-2">Module Access</h6>` |
| 23 | `UserScreen/UserScreenForm.jsx` | `/user_screen/list` | A + B (1 split, after `folder_name`, before `order_no`) | **Screen Identity** — `ri-file-list-3-line` — screen_main_name, screen_name, folder_name · **Display Settings** — `ri-settings-3-line` — order_no, active_status, icon_name |
| 24 | `UserType/UserTypeForm.jsx` | `/user_type/list` | A, no split | **User Type Details** — `ri-user-settings-line` — user_type, active_status |

**DCForm note (row 3):** this page is a standalone print/invoice mockup (`Backend not connected yet. This is a local UI mockup.`), not a Django-backed CRUD form like the other 22. It already has its own title + "Print / Export PDF" + "Back to List" buttons — a two-action header `FormHeader` doesn't support and shouldn't be force-fit for one file. Leave its header exactly as-is; only add the two section titles (Recipe C). The Items Table, Totals, and company-letterhead blocks are output-document layout, not data-entry field groups — leave them untouched.

For each of Tasks 2–24:

- [ ] **Step 1:** Read the current file, apply Recipe A (and B and/or C per the table) with the Edit tool.
- [ ] **Step 2:** Run `npx oxlint src/pages/<Folder>/<File>.jsx` from `frontend/`; fix any reported issue before proceeding.
- [ ] **Step 3:** Commit:
  ```bash
  git add frontend/src/pages/<Folder>/<File>.jsx
  git commit -m "style(frontend): apply FormHeader + section titles to <Form Name>"
  ```

---

## Task 25: Final verification

**Files:** none (manual QA pass, matching the spec's verification section).

- [ ] **Step 1:** Start the frontend dev server (`npm run dev` in `frontend/`) and, logged in, open:
  - `ItemCreationForm` (simplest case — single section, 2 fields)
  - `EggProcessForm` (most complex — 2 sections + 2 modals)
  - `UserForm` (Admin-category form, different sidebar group than Screening)

  For each: confirm the new header renders (title + working "Back to list" link back to its list page), section titles render with the correct icon and text, the form still submits and updates existing records, and no console errors appear.

- [ ] **Step 2:** Run the full test suite and the production build to catch anything the per-file oxlint checks missed:
  ```bash
  cd frontend
  npx vitest run
  npm run build
  ```
  Expected: all tests pass, build succeeds with no new warnings/errors.

- [ ] **Step 3:** Commit any final fixes found during manual QA (should typically be none, since Tasks 2–24 already committed working code file-by-file).
