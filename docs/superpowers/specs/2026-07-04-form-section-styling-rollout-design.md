# Form Section Styling Rollout

## Problem

`ScreeningProcessForm.jsx` (Hatching Center) has a polished data-entry layout: a card
header with title + "Back to list" button, and fields grouped under icon-labeled
section titles (`PIT SELECTION`, `MEASUREMENTS`, `COMPLETION`). Every other Add/Edit
form in the sidebar (23 of the 24 `*Form.jsx` pages) still uses the older layout: a
plain `<h5>Title {Create|Update}</h5>` header with no back button, and all fields
dumped into one flat `row` with no grouping.

Goal: bring all 23 forms to the same visual pattern as Screening, without touching
their behavior, API calls, or validation.

## Scope

**In scope** — restyle these 23 files (every `*Form.jsx` except Screening):

CullingProcessForm, DCForm, DryProcessForm, EggProcessForm, FrpStatusUpdateForm,
FrpTrayProcessForm, ItemCreationForm, LeachateForm, MainScreenForm,
MaterialReceivedForm, MeasurableForm, OvenProcessForm, PitCreationForm,
PitStatusForm, RejectsImageUploadForm, StatusUpdateForm, SupplierCreationForm,
TrayCreationForm, UnitCreationForm, UserForm, UserPermissionForm, UserScreenForm,
UserTypeForm.

**Out of scope:**
- `ScreeningProcessForm.jsx` — already the reference, untouched.
- All `*List.jsx` pages.
- Backend/API — no request/response shape changes.
- Pipeline breadcrumb and numbered step indicator (`PipelinePosition`,
  `StepIndicator` in ScreeningProcessForm) — these stay unique to Screening's
  multi-step flow and are not replicated elsewhere.
- Modal internals (e.g. EggProcessForm's Tray/Add-On modals) — left as-is; modals
  are not top-level form sections.

## Design

### 1. Shared `FormHeader` component (new)

All 23 forms currently duplicate this shape (verified in UserTypeForm, ItemCreationForm,
MaterialReceivedForm, EggProcessForm, etc.):

```jsx
<div className="card-header pt-3 pb-2">
  <div className="row flex-between-end">
    <div className="col-auto align-self-center">
      <h5 className="d-flex align-items-center">{Title} {unique_id ? 'Update' : 'Create'}</h5>
    </div>
  </div>
</div>
```

Extract to `frontend/src/components/FormHeader.jsx`:

```jsx
export default function FormHeader({ title, backTo }) { ... }
```

Rendering the same title/back-button row Screening already uses:

```jsx
<div className="card-header">
  <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
    <h5>{title}</h5>
    <button type="button" onClick={() => navigate(backTo)} className="btn btn-sm d-flex align-items-center gap-1" style={{ fontSize: '0.78rem', color: 'var(--vz-secondary-color)', border: '1px solid var(--vz-border-color)', borderRadius: 6 }}>
      <i className="ri-arrow-left-s-line"></i> Back to list
    </button>
  </div>
</div>
```

`navigate` comes from `useNavigate()`, already imported in every form. Each call site
becomes: `<FormHeader title={`${unique_id ? 'Update' : 'New'} Item`} backTo="/item_creation/list" />`.

### 2. Section titles (no new CSS — `form-section-title` is already global in `ux.css`)

Before each logical group of fields, insert:

```jsx
<p className="form-section-title"><i className="ri-xxx-line me-1"></i> Section Name</p>
```

**Grouping rule:**
- If a form's fields already split into distinct concerns (e.g. identity/when vs.
  quantities vs. status — as in EggProcess: batch/date vs. quantity/trays), each
  concern becomes its own titled section, in the order the fields already appear.
- Single-concern forms (Item/Pit/Tray/Unit/Supplier Creation, UserType, MainScreen,
  etc. — 2-5 fields, no natural split) get exactly **one** section, titled with the
  form's domain noun (e.g. "Item Details", "Pit Details").
- Icons are Remix Icon classes already used elsewhere in the app (e.g.
  `ri-map-pin-2-line`, `ri-scales-3-line`, `ri-checkbox-circle-line`,
  `ri-user-line`, `ri-file-list-3-line`), picked per-section by meaning at
  implementation time — not enumerated exhaustively here since it's a mechanical,
  low-risk choice per file.

### 3. What does not change

- Field components (`DateInput`, `TextInput`, `Select`, `Button`), their props,
  `formData` state shape, fetch/submit logic, modal logic — untouched.
- Column widths / `row`/`col-*` grid structure inside each section — kept as-is,
  just wrapped with a preceding section-title `<p>`.

## Verification

Purely structural/visual change, no new logic to unit-test. Verify by running the
frontend dev server and spot-checking three representative forms:
- **ItemCreationForm** — simplest case (single section, 2 fields).
- **EggProcessForm** — most complex (multiple sections + two modals).
- **UserForm** — Admin-category form, different sidebar group than Screening.

For each: confirm the new header (title + working "Back to list" link) and
section-title(s) render correctly, the form still submits and updates existing
records, and no console errors appear. No automated test needed — no branching
logic was added (`FormHeader` is a 6-line presentational component).
