# Zigfly UI Redesign Roadmap

> **Purpose:** Track all UI visual improvements. This is visual/UX only — no backend changes, no new API calls.
> **Theme:** Clinical-industrial dark mode, Zigfly green `#25a96b`, IBM Plex Mono for data labels.
> **Rule:** Never hardcode colors in components — use CSS variables from `darkmode.css`.

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ Done | Shipped |
| 🔄 In Progress | Active work |
| ⬜ Not Started | Queued |
| ⏸ Blocked | Needs something else first |

---

## Phase 1 — Foundation (Dark Mode + Theme System)

| # | Task | File(s) | Status |
|---|------|---------|--------|
| U-01 | Dark mode CSS variable overhaul (palette, sidebar, cards, forms) | `darkmode.css` | ✅ Done |
| U-02 | Chart palette synced to new dark theme | `utils/chartTheme.js` | ✅ Done |
| U-03 | KPI card redesign (colored left border + badge icon) | `KPICard.jsx` | ✅ Done |
| U-04 | Dashboard live sync badge + button color fix | `Dashboard.jsx` | ✅ Done |
| U-05 | Notification bell in Header | `Header.jsx` | ✅ Done |
| U-06 | Process Rail pipeline component | `ProcessRail.jsx`, `process-rail.css` | ✅ Done |

---

## Phase 2 — Layout & Navigation

| # | Task | File(s) | Status |
|---|------|---------|--------|
| U-07 | Sidebar visual polish (active pill, hover state, section label spacing) | `Sidebar.jsx`, `darkmode.css` | ✅ Done |
| U-08 | Header: add global search bar (static UI, no backend) | `Header.jsx` | ✅ Done |
| U-09 | Header: user avatar initials badge (replace broken icon) | `Header.jsx` | ✅ Done |
| U-10 | Page title / breadcrumb bar consistent styling across all pages | `MainLayout.jsx`, `darkmode.css` | ✅ Done |
| U-11 | Mobile sidebar overlay + hamburger animation | `Sidebar.jsx`, `Header.jsx` | ✅ Done |

---

## Phase 3 — Data Tables (Applies to ALL list pages)

> Fixing the DataTable is highest leverage — every list page uses it.

| # | Task | File(s) | Status |
|---|------|---------|--------|
| U-12 | DataTable header row styled (sticky, uppercase labels, border) | `DataTable.jsx`, `styles/datatable.css` | ✅ Done |
| U-13 | DataTable row hover + alternating stripe | `DataTable.jsx`, `styles/datatable.css` | ✅ Done |
| U-14 | DataTable action buttons (Edit/Delete) as icon buttons, not text | `DataTable.jsx`, `styles/datatable.css` | ✅ Done |
| U-15 | DataTable empty state with icon + message | `DataTable.jsx` | ✅ Done |
| U-16 | DataTable loading skeleton (not just spinner) | `DataTable.jsx`, `styles/datatable.css` | ✅ Done |
| U-17 | Pagination strip — cleaner style, green active page | `DataTable.jsx`, `styles/datatable.css` | ✅ Done |

---

## Phase 4 — Forms (Applies to ALL create/edit pages)

| # | Task | File(s) | Status |
|---|------|---------|--------|
| U-18 | Form card wrapper consistent padding + heading | `styles/forms.css` | ✅ Done |
| U-19 | Input focus ring — green, visible, consistent | `darkmode.css` | ✅ Done (in Phase 1) |
| U-20 | Select dropdowns styled to match dark theme | `darkmode.css` | ✅ Done (in Phase 1) |
| U-21 | Form submit button — primary green, consistent sizing | `styles/forms.css` | ✅ Done |
| U-22 | SweetAlert modals themed (confirm green, cancel muted) | `darkmode.css` | ✅ Done (in Phase 1) |
| U-23 | Validation error message style (red border + inline text) | `styles/forms.css` | ✅ Done |

---

## Phase 5 — Page-by-Page UI Improvements

> Work through these after Phase 3 & 4. Each page gets consistent card layout + heading.

| # | Page | Key Change | Status |
|---|------|-----------|--------|
| U-24 | Login | Glassmorphism card, green brand accent | ✅ Done |
| U-25 | Dashboard | Process Rail + KPI cards + charts | ✅ Done |
| U-26 | Pit Status | Labeled filter bar + reset button + stage emojis | ✅ Done |
| U-27 | Screening Process | Step indicator + pipeline position + batch auto-fill feedback | ✅ Done |
| U-28 | Egg Process | Status badge colors (fresh/old/rejected) | ✅ Done (via ux.css badge styles) |
| U-29 | Logsheet | Print-safe layout + export button style | ⏸ Blocked (stub — htmlContent is empty) |
| U-30 | DC (Delivery Challan) | Bootstrap table dark mode + empty state | ✅ Done (via ux.css table rules) |
| U-31 | Measurable Report | Labeled filter bar | ✅ Done |
| U-32 | User / User Type | Admin table, role color badges | ✅ Done (via ux.css badge + DataTable) |
| U-33 | Login History | Timeline-style sessions + user strip | ✅ Done |
| U-34 | Rejects Report | Warning color scheme, print button | ✅ Done (via ux.css badge styles) |

---

## Phase 6 — Polish & QA

| # | Task | Status |
|---|------|--------|
| U-35 | Light mode audit — all pages look correct in light mode | ✅ Done (all dark selectors scoped to `[data-bs-theme='dark']`) |
| U-36 | Mobile QA — 375px breakpoints for timeline + filter bar | ✅ Done (ux.css §19) |
| U-37 | IBM Plex Mono font loaded for data labels | ✅ Done (bundled in app.min.css) |
| U-38 | `prefers-reduced-motion` — all animations respect it | ✅ Done (ux.css §20 global override) |
| U-39 | Keyboard focus visible on all interactive elements | ✅ Done (ux.css §18, datatable.css) |
| U-40 | Final visual review — remove leftover hardcoded colors | ✅ Done (`TrayStatusWidget` `#9CA3AF` → `text-muted`) |

---

## Recommended Start Order

```
Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
```

**Start with U-07 (Sidebar)** — highest visible impact after the dark mode base.
**Then U-12–U-17 (DataTable)** — covers every list page in one go.
**Then U-18, U-21, U-23 (Forms)** — covers every create/edit page.
**Then Phase 5** — page-specific finishing touches.

---

## Files Changed So Far

```
frontend/src/
├── darkmode.css              ← full dark palette (U-01)
├── index.css                 ← login light mode only
├── utils/chartTheme.js       ← chart dark palette (U-02)
├── styles/
│   └── process-rail.css      ← Process Rail animation (U-06)
├── pages/Dashboard/
│   ├── Dashboard.jsx         ← live badge, ProcessRail wired (U-04, U-06)
│   └── KPICard.jsx           ← colored border + badge icon (U-03)
└── components/
    ├── Dashboard/
    │   └── ProcessRail.jsx   ← pipeline visualization (U-06)
    └── Layout/
        └── Header.jsx        ← notification bell (U-05)
```
