# Migration Tracker — MongoDB Data-Consistency Remediation

**Generated:** 2026-07-14 · **Source:** read-only audit of the live Atlas cluster (`cluster0.3nrjkcs`)
**Scope:** every inconsistency found between the live data and the MongoEngine models + serializer contracts in `backend/`.
*(Replaces the old MongoDB→MySQL tracker — that plan lives in git history if needed.)*

**Audit result: 34 issues** (31 data-level from the automated scan + 3 config/architecture-level).
Severity: 🔴 4 Critical · 🟠 12 High · 🟡 15 Medium · ⚪ 3 Low

---

## Phase 0 — Configuration & Security (do first, everything else depends on it)

| # | Sev | Issue | Evidence | Fix |
|---|-----|-------|----------|-----|
| 0.1 | 🔴 | **All app data lives in Mongo's default `test` database.** `MONGODB_URI` in `backend/.env` has no database path, so MongoEngine fell back to `test`. `.env.example` documents `zigma_erp_dev`. | Cluster databases: `['sample_mflix', 'test', 'admin', 'local']` — no `zigma_erp_dev` exists. | Add the db name to the URI (`...mongodb.net/zigma_erp_dev?...`), then migrate: `mongodump --db test` → `mongorestore --nsFrom 'test.*' --nsTo 'zigma_erp_dev.*'`. Verify counts, then drop `test`. |
| 0.2 | 🟠 | **Atlas credentials are plaintext in `backend/.env`.** The URI embeds the db user and password. | `backend/.env` line 4. | Rotate the Atlas database-user password (Atlas → Database Access). Keep `.env` untracked. Never paste the URI into docs/READMEs. |
| 0.3 | ⚪ | `must_change_password` field exists on 1 user doc but not on the `User` model — silent schema drift from the signup work. | `users` UNKNOWN-FIELDS finding. | Either add `must_change_password = BooleanField(default=False)` to `accounts/models.py`, or `$unset` it from the doc. Pick one; don't leave it ghost. |

- [ ] 0.1 done
- [ ] 0.2 done
- [ ] 0.3 done

---

## Phase 1 — Auth & Permissions (largest root-cause cluster)

**Root cause:** soft-delete has no PROTECT semantics — parents get soft-deleted while children still point at them — and permissions are stored in **two places** (`User.screens` and `UserType.screens`) that have fully diverged.

| # | Sev | Issue | Evidence | Fix |
|---|-----|-------|----------|-----|
| 1.1 | 🔴 | **The `Admin` role is soft-deleted, but `admin`, `demo`, and `testuser` still reference it.** 5 users total point at soft-deleted roles. | `user_types`: `Admin` `deleted=True`; users list shows `role_deleted=True` for admin/demo/testuser + 2 livetest users. | Un-delete the Admin role (`is_deleted=False`) **or** create a proper new role and re-point the 3 live users. Blocked by 1.2 (unique index holds the name). |
| 1.2 | 🟠 | **Soft-delete vs unique-index conflict (design flaw).** Unique index on `type_name` means a soft-deleted `Admin` blocks recreating `Admin` — which is why a junk lowercase `admin` role (0 screens) now exists. Same landmine on `user_name`, `unit_name`, `pit_name`, `item_code`, `batch_id`, `dc_number`, `ticket_no`. | `type_name='Admin'` (deleted) + `type_name='admin'` (live, 0 screens) coexist. | Decision needed: either purge soft-deleted docs that hold unique values, or switch to partial unique indexes (`partialFilterExpression: {is_deleted: false}`) — MongoEngine can't declare those, so create via `pymongo` in an app-ready hook. |
| 1.3 | 🟠 | **`User.screens` diverges from role screens — two sources of truth.** `admin` has 60 screens, `demo` 88, while their role `Admin` has **0** screens. Permission checks (`has_screen`) read only `User.screens`, so the role's `screens` field is dead weight that misleads. | PERMS-DIVERGE-ROLE findings. | Decide the model: role-based (copy role → user at assignment, keep in sync) or user-based (drop `UserType.screens`). Backfill `Admin` role screens from the `demo` user's 88-screen set either way. |
| 1.4 | 🟠 | **`users.main_screens` ids don't exist in the `main_screens` collection.** `demo` has `msm_admin,msm_settings,...` but the collection only contains test junk (`MS-105225`, etc.) with UUID ids. The sidebar works only because `Sidebar.jsx` hardcodes `DEMO_MENU`. | MAIN-SCREEN-ID-MISSING finding; `main_screens` dump. | Seed the real 6 `MainScreen` docs with `unique_id` = `msm_admin`…`msm_report` (+ their `Screen` children), or drop the DB-driven menu entirely and delete the two collections. One source of truth. |
| 1.5 | 🟡 | **Orphan + stale auth tokens.** 1 token → hard-deleted user (missing doc), 1 token → soft-deleted `warehouse_test_user`. | auth_tokens dump. | Delete both token docs. Code fix: revoke tokens on user delete (add to the user destroy path). |
| 1.6 | 🟡 | **Test-junk identity data polluting the live db:** roles `Type-105225`, `Type-145835`, `Type-150132`, `hell mar`, `developer`, lowercase `admin` (all 0 screens); users `test-105225`, `test-145835`, `test-150132`, `admin1`, `testuser123`; `MS-*`/`Scr-*` screen rows. Cypress/live-test leftovers. | user_types/users/screens dumps. | Purge (hard-delete) all `*-LiveTest`, `Type-*`, `MS-*`, `Scr-*`, `test-*` docs. Long-term: point e2e runs at a separate database (pairs with 0.1). |

- [ ] 1.1 done
- [ ] 1.2 decision + done
- [ ] 1.3 decision + done
- [ ] 1.4 done
- [ ] 1.5 done
- [ ] 1.6 done

---

## Phase 2 — Referential Integrity

**Root cause:** delete endpoints soft-delete parents without checking for children (no `PROTECT`), and one user was hard-deleted bypassing soft-delete entirely.

| # | Sev | Issue | Evidence (sample `unique_id`s) | Fix |
|---|-----|-------|-------------------------------|-----|
| 2.1 | 🔴 | 1 `egg_process` doc's `staff` points at a **hard-deleted** user (doc gone from `users`). Same missing user broke an auth token (1.5) and 1 `frp_status_update.staff`. | `f3bd2ceb…` (entry EPC-00001, itself soft-deleted), `304f7a50…` | Re-point `staff` to the `demo` user (or a placeholder "deleted user" account). Code fix: forbid hard deletes; users are soft-delete only. |
| 2.2 | 🟡 | **28 `pit_status` docs → soft-deleted pits.** Reports that filter pits by `is_deleted=False` silently drop these rows from aggregations. | `0ddc7f10…`, `1f147923…`, +26 | Decision: restore the pits, or accept and make reports resolve refs without the `is_deleted` filter. Code fix (root): block deleting a parent with live children — see 4.2. |
| 2.3 | 🟡 | 3 `items` → soft-deleted units; 3 `material_received` → soft-deleted supplier+item+unit; 1 `status_update`, 1 `pit_status`, 1 `frp_tray_process` → soft-deleted batches; 1 `egg_process` → soft-deleted supplier+batch; 1 `screens` → soft-deleted main_screen. | samples in audit output | Same guard as 2.2. For existing rows: restore parents deleted by mistake; otherwise leave (history) once reports handle deleted parents gracefully. |

- [ ] 2.1 done
- [ ] 2.2 decision + done
- [ ] 2.3 done

---

## Phase 3 — Business-Rule Violations (demo seeders bypassed the serializers)

**Root cause:** `create_demo_data.py` / `create_more_demo_data.py` call `.save()` directly, skipping every serializer rule. The data violates contracts the API enforces for real users.

| # | Sev | Issue | Evidence | Fix |
|---|-----|-------|----------|-----|
| 3.1 | 🟠 | **11 `egg_process` docs: `len(trays) != tray_utilized`** (seeder set `tray_utilized=randint(1,5)` but always 1 tray). | `df9421cc…` (1 vs 4), `f74a3cd7…` (1 vs 2)… | Set `tray_utilized = len(trays)` on the 11 docs. |
| 3.2 | 🟠 | **15 `pit_status` org_status=2 docs missing `batch` and `trays`** — serializer requires both (plus `larvae_qty_in`, which is present) for "Baby Larvae Added". | `cad56eaa…` +14 | Backfill `batch` (BAT-DEMO-001) + a tray, or delete these seeded rows and reseed through the API. |
| 3.3 | 🟠 | **7 `pit_status` org_status=5 (Harvest) docs missing `qty_manure_3` and `harvest_comp`** — seeder generated '5' rows with '6'-shaped fields. | `7f52c8d9…` +6 | Flip these rows to org_status='6' (they match the Vibro Screen shape exactly) — truer than backfilling zeros. |
| 3.4 | 🟠 | **Batch `BAT-DEMO-001` is consumed by 16 egg processes but `batch_status='pending'`** (serializer flips to `used` on create; seeder didn't). Also exposes a code gap: nothing stops N egg processes consuming one batch. | `4611ab7f…`; batch_status counts `{pending: 11, used: 3}` | Set the batch to `used`. Code fix: `EggProcessSerializer.validate_batch` should reject a batch whose `batch_status != 'pending'`. |
| 3.5 | 🟠 | **2 items with `ITM-DEMO-001/002` codes** violating the `IT-###` contract. `_next_item_code` already tolerates them, but they break code-pattern assumptions everywhere else (and any future ETL). | `c3453688…`, `e69e775d…` | Renumber to the next free `IT-###` codes (unique index verifies), or delete + reseed via API. |
| 3.6 | 🟡 | **16 `egg_process.entry_no` = `EGG-DEMO-*`** vs auto-gen contract `EPC-#####`; **47 `pit_status.form_batch_id` = `FORM-DEMO-*`** vs `PIT-*-#####`. | CODE-PATTERN findings | Renumber during cleanup (same pass as 3.5), or explicitly document demo prefixes as allowed. Don't leave it ambiguous. |
| 3.7 | 🟡 | **All 3 `dc` docs have line-item `amount=0.0` while `qty*rate=5000`.** `grand_total` (5900) is computed correctly server-side, but `DCItem.amount` is stored as whatever the client sent (0). | dc dump: `amounts=[0.0]`, `subtotal=5000` | Backfill `amount = qty*rate` on the 3 docs. Code fix: compute `amount` server-side in `DCSerializer` like `grand_total` — never trust the client copy. |

- [ ] 3.1 done
- [ ] 3.2 done
- [ ] 3.3 done
- [ ] 3.4 done + serializer guard
- [ ] 3.5 done
- [ ] 3.6 done
- [ ] 3.7 done + serializer fix

---

## Phase 4 — Model/Code Hardening (prevent recurrence)

Not data corruption yet, but each is a hole the above issues crawled through.

| # | Sev | Issue | Fix |
|---|-----|-------|-----|
| 4.1 | 🟡 | `Tray.bin_name` treated as an identifier everywhere (seeders look up by it) but has **no unique index**. | Add `unique=True` (currently no duplicates — safe to add). |
| 4.2 | 🟡 | No child-guard on destroy: Units, Pits, Suppliers, Items, Batches, UserTypes, MainScreens can be soft-deleted while referenced (caused all of Phase 2). | Add a pre-destroy reference check once, in the shared `MongoModelViewSet.destroy` — one guard in the shared path, not per-view. |
| 4.3 | 🟡 | Time stored as strings with **no format validation**: `LoginHistory.entry_time` ('HH:MM:SS'), `OvenProcess.starting_time/closing_time` ('HH:MM') — a malformed value breaks `running_hours` math and the worked-hours report. | Add regex validation in serializers (`^\d{2}:\d{2}(:\d{2})?$`). Keep strings (matches legacy) — validation is the fix, not a type change. |
| 4.4 | ⚪ | `MainScreen`/`Screen` lack `created_at` — every other model has it. | Add for consistency. |
| 4.5 | ⚪ | Demo seeders bypass serializers, are non-idempotent (`create_more_demo_data.py` inserts 15 rows per run; random ids can collide), and caused all of Phase 3. | Rewrite seeders to go through the API/serializers and make them idempotent — or delete `create_more_demo_data.py`; it has served its purpose. |

- [ ] 4.1 done
- [ ] 4.2 done
- [ ] 4.3 done
- [ ] 4.4 done
- [ ] 4.5 done

---

## 5. Checked and found CLEAN ✅

- **Unique constraints:** zero duplicates in any unique field; all 26 declared unique indexes exist in Atlas and are enforced (incl. compound `culling_process(entry_date,shift,cylinder)` and `oven_process(entry_date,starting_time)`).
- **Choice fields:** all values valid (`tray_type`, `org_status`, `batch_status`, `shift_type`, `log_type`, …).
- **Computed fields:** `pits.volume`, `culling.fuel_consumption`, `dc.grand_total` all mathematically consistent (only `DCItem.amount` fails — 3.7).
- **Required scalar fields:** none missing/null in any collection.
- **Date types:** all date fields stored as proper BSON datetimes — no string dates. No numeric type drift.
- **`reject`/`reject_image`:** empty — no string-ref orphans possible yet.

## 6. Collection inventory (live `test` db, 2026-07-14)

users 10 · user_types 9 · auth_tokens 3 · user_login_details 50 · units 7 · items 8 · trays 8 · pits 6 · suppliers 7 · material_received 14 · egg_process 20 · status_update 4 · pit_status 58 · frp_tray_process 5 · frp_status_update 5 · culling_process 4 · oven_process 3 · dry_process 4 · leachate 4 · measurable 4 · logsheet 3 · dc 3 · reject 0 · main_screens 4 · screens 4

## 7. Re-verification

The audit is a standalone read-only script (checks: unique dups, orphan/soft-deleted refs, missing required fields, invalid choices, computed-field math, serializer contracts, type drift, schema drift, index drift). Re-run it after each phase.

**Definition of done:** audit reports 0 CRITICAL / 0 HIGH, and every checkbox above is ticked.
