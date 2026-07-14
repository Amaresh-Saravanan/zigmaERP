# PRD — MongoDB → MySQL Migration (ERP Backend)

**Status:** Draft · **Owner:** Backend team · **Date:** 2026-07-14
**Scope:** Django 4.2 + DRF backend only. Frontend (React) API contract must not change.

---

## 1. Objective

Move persistence from **MongoDB (MongoEngine ODM)** to **MySQL (Django ORM)** with **zero change to the HTTP/JSON contract** the React frontend depends on. Same URLs, same request bodies, same `{status, msg, data, error}` response envelope, same `unique_id`-based lookups.

**Why:** the team knows SQL, not Mongo. MongoEngine also forces a pile of hand-rolled machinery (custom viewset, custom token auth, custom serializers) that Django ORM + DRF give for free. This migration deletes code as much as it moves it.

### Success criteria

| # | Criterion | Measure |
|---|-----------|---------|
| S1 | Frontend works unchanged | All Cypress e2e specs pass against MySQL backend |
| S2 | API contract preserved | Response envelope + fields byte-identical for a fixed request set (golden tests) |
| S3 | No data loss | Row counts + spot-checked field values match Mongo export |
| S4 | Test coverage | ≥80% on models + serializers, ≥70% on views |
| S5 | Perf not worse | p95 list/create latency ≤ current Mongo baseline (record baseline first) |

---

## 2. Current State (what actually exists)

- **No relational DB today:** `settings.DATABASES = {}`; `me.connect(host=MONGODB_URI)` is the only store.
- **Models** are `mongoengine.Document` subclasses across 5 apps: `accounts`, `inventory`, `process`, `reports`, `core`.
- **Serializers** are plain `serializers.Serializer` (NOT `ModelSerializer`) with hand-written `create()`/`update()`.
- **Views** subclass a custom `core.mongo_viewset.MongoModelViewSet` (ViewSetMixin + APIView), because DRF's `ModelViewSet` assumes an ORM queryset. This exists **only** to work around Mongo — it largely disappears after migration.
- **Auth** is a custom `MongoTokenAuthentication` + an `AuthToken` Document (one token per user), because `rest_framework.authtoken` needs a relational table we don't have. **After migration we can use DRF's built-in TokenAuth** and delete both.
- **`django.contrib.auth` is NOT installed.** `User` is a bare Document with an `is_authenticated` property and a `has_screen()` helper.

### Cross-cutting conventions that MUST survive

| Convention | Today | Notes |
|------------|-------|-------|
| `unique_id` | UUID `StringField(unique=True)` on every model | Frontend & inter-model refs use this, NOT the PK. Keep it. |
| Soft delete | `is_deleted` bool; `get_queryset()` filters `is_deleted=False`; `destroy()` sets the flag | Preserve exactly — no hard deletes. |
| RBAC | `User.screens` comma-separated string + `has_screen()`; `required_screens` dict per view action; `HasScreenPermission` | Keep string storage for compat, or normalize (see §5). |
| Auto codes | `item_code` `IT-001`, `entry_no` `EPC-00001`, `form_batch_id` `PIT-<suffix>-00001`, `dc_number`, `batch_id`, `ticket_no` | Generation logic lives in serializers — port as-is. |
| Response envelope | `{status, msg, data, error}` | Lives in the viewset — carries over. |
| Server-computed fields | `volume`, `grand_total`, `fuel_consumption`, `running_hours`, `net_weight` | Currently in `Document.save()` / serializers. Move `save()` logic into Django model `save()`. |

---

## 3. Technical Approach

**MongoEngine → Django ORM, field by field.**

| MongoEngine | Django ORM |
|-------------|-----------|
| `Document` | `models.Model` |
| `StringField` | `CharField(max_length=...)` / `TextField` |
| `IntField` | `IntegerField` |
| `FloatField` | `FloatField` (or `DecimalField` for money — see risk R4) |
| `BooleanField` | `BooleanField` |
| `DateField` / `DateTimeField` | `DateField` / `DateTimeField` |
| `ReferenceField(X)` | `ForeignKey(X, on_delete=models.PROTECT)` |
| `ListField(ReferenceField(X))` | `ManyToManyField(X)` |
| `EmbeddedDocumentListField(X)` | child model + `ForeignKey` back to parent (`related_name`) |
| `choices=CHOICES` | `choices=CHOICES` (same tuples work) |
| `meta = {'indexes': [...]}` | `class Meta: indexes = [...]` / `unique_together` |
| compound unique index | `Meta.constraints = [UniqueConstraint(...)]` |

### Model diff example — `Item`

```python
# BEFORE (mongoengine)
class Item(Document):
    unique_id = StringField(unique=True, required=True, default=lambda: str(uuid.uuid4()))
    item_code = StringField(unique=True, required=True)
    item_name = StringField(required=True)
    unit = ReferenceField(Unit, required=True)
    is_active = BooleanField(default=True)
    is_deleted = BooleanField(default=False)
    created_at = DateTimeField(default=timezone.now)
    updated_at = DateTimeField(default=timezone.now)

# AFTER (django orm)
class Item(models.Model):
    unique_id = models.CharField(max_length=36, unique=True, default=uuid.uuid4, editable=False)
    item_code = models.CharField(max_length=20, unique=True)
    item_name = models.CharField(max_length=255)
    unit = models.ForeignKey('inventory.Unit', on_delete=models.PROTECT)
    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'items'          # keep legacy table name if useful
        indexes = [models.Index(fields=['item_name']), models.Index(fields=['-created_at'])]
```

### Embedded doc example — `DC` / `DCItem`

`EmbeddedDocumentListField` has no SQL equivalent. Split into two tables:

```python
class DC(models.Model):
    dc_number = models.CharField(max_length=50, unique=True)
    # ... scalar fields ...
    grand_total = models.FloatField(default=0)  # computed in save()

class DCItem(models.Model):
    dc = models.ForeignKey(DC, related_name='items', on_delete=models.CASCADE)
    desc = models.CharField(max_length=255)
    qty = models.FloatField(default=0)
    # ...
```
The serializer stays a nested writable serializer; the viewset writes parent then children in a `transaction.atomic()`.

### What gets DELETED (the win)

- `core/mongo_viewset.py` → replaced by DRF `ModelViewSet` + a small mixin for the `{status,msg,data,error}` envelope + soft-delete `destroy()`.
- `accounts/authentication.py` + `AuthToken` Document → DRF `rest_framework.authtoken`.
- Hand-written `create()`/`update()` in most serializers → `ModelSerializer` (keep custom ones only where auto-codes / computed fields need it).
- `me.connect(...)`, `DATABASES = {}` → standard MySQL `DATABASES` config.

---

## 4. Migration Scope & Sequencing

**Phased, app-by-app, in dependency order.** Not big-bang — too many models, and a phased cut lets us validate each app against golden API tests before moving on.

Dependency order (leaf → root):

1. **core** — `MainScreen`, `Screen`. No FKs out (Screen → MainScreen internal only).
2. **accounts** — `UserType` ← `User` ← `AuthToken`, `LoginHistory`. Blocks everything (User is referenced widely).
3. **inventory** — `Unit` ← `Item`; `Tray`, `Pit`, `Supplier`. Depends on nothing external.
4. **process** — references `accounts.User`, `inventory.{Item,Pit,Supplier,Tray,Unit}`, and `MaterialReceived` internally. Heaviest app (embedded docs, list refs, compound unique constraints, `PitStatus` with 30+ conditional fields).
5. **reports** — mostly standalone (`Measurable`, `Logsheet`, `DC`+`DCItem`, `Reject`, `RejectImage`). `RejectImage` refs `Reject` by string `ticket_no`, not FK — keep as-is.

Run Mongo and MySQL **side by side** during the cut. A feature flag / env switch picks the ORM per environment so we can roll back an app without a redeploy.

---

## 5. Open Decisions (resolve before Phase 2)

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| D1 | Adopt `django.contrib.auth`? | (a) Keep custom `User` Model + custom token (b) Migrate to contrib.auth + DRF TokenAuth | **(b)** — now that we have a relational DB, contrib.auth deletes the most custom code. But it's the riskiest change; can be deferred (keep custom User first, swap auth last). |
| D2 | `screens` storage | (a) Keep comma-separated string (b) Normalize to M2M `User↔Screen` | **(a) first** for a clean lift-and-shift, normalize later. String keeps `has_screen()` and the frontend contract identical. |
| D3 | PK strategy | (a) `BigAutoField` PK + keep `unique_id` (b) Make `unique_id` the PK | **(a)** — standard, and `unique_id` stays the external key. Never expose the integer PK to the frontend. |
| D4 | Money/qty fields | `FloatField` vs `DecimalField` | Keep `FloatField` for lift-and-shift parity (Mongo stored floats); flag `DC.grand_total`/rates for `DecimalField` follow-up. |

---

## 6. Risks & Mitigation

| ID | Risk | Impact | Mitigation |
|----|------|--------|-----------|
| R1 | Contract drift — a field renders differently under ORM | Frontend breaks silently | Golden API tests (record current Mongo responses, diff against MySQL) before/after each app |
| R2 | Auto-code race conditions | Duplicate `item_code`/`entry_no` | Already flagged in code (`_next_item_code` is read-then-increment). Wrap generation + insert in `transaction.atomic()` + `select_for_update()`, backed by a DB unique constraint that forces retry |
| R3 | Embedded docs (`DCItem`, `EggProcessAddon`) | Data shape mismatch | Model as child tables + nested serializers; migrate parent+children together in one transaction |
| R4 | Float precision on money (`grand_total`, `rate`, `tax_rate`) | Rounding errors on invoices | Decision D4; if kept as float, add rounding assertions in tests |
| R5 | Compound unique indexes (culling `entry_date+shift_type+cylinder_no`, oven `entry_date+starting_time`) | Silent dup rows if missed | Port each to `UniqueConstraint`; test the collision explicitly |
| R6 | Soft-delete + unique clash | Can't recreate a soft-deleted `unique` value | Decide: partial unique (`condition=Q(is_deleted=False)`) via `UniqueConstraint`, or accept. Test it. |
| R7 | Auth cutover (D1) | Everyone logged out / locked out | Do auth LAST, behind its own flag; keep custom token working until DRF token is proven |
| R8 | Data migration bugs | Wrong/lost records | ETL script is idempotent + dry-run mode; validate row counts + checksums per collection |
| R9 | `RejectImage.ticket_no` string ref | Orphan refs | Keep as string ref (documented as intentional), don't force a FK |

---

## 7. Success Metrics (baseline before starting)

- **Coverage:** ≥80% models/serializers, ≥70% views (`pytest --cov`).
- **Contract:** 100% of golden API tests pass.
- **Data integrity:** per-table row count match; ≥1 checksum/spot-check per collection.
- **Performance:** capture Mongo p50/p95 for list + create on the 5 highest-traffic endpoints now; MySQL must be ≤ baseline. Add indexes to close any gap.
- **Code deleted:** track LOC removed (`mongo_viewset.py`, custom auth, hand-rolled serializers) as a positive signal.

---

## 8. Out of Scope

- Frontend changes — contract is frozen; none expected.
- New features. This is a migration, not a rewrite.
- MySQL HA / replication / sharding — single instance first.
