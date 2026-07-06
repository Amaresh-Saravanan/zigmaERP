# Process Folder SQL Commands

Source module: `backend/process`

## Tables (collection equivalents)

- `material_received`
- `culling_process`
- `oven_process`
- `dry_process`
- `leachate`
- `egg_process`
- `status_update`
- `pit_status`
- `frp_tray_process`
- `frp_status_update`

## Material Received

```sql
SELECT mr.unique_id, mr.date, mr.batch_id, mr.batch_status, mr.qty,
       s.supplier_name, i.item_name, u.unit_name
FROM material_received mr
JOIN suppliers s ON s.unique_id = mr.supplier
JOIN items i ON i.unique_id = mr.item
JOIN units u ON u.unique_id = mr.unit
WHERE mr.is_deleted = 0
ORDER BY mr.created_at DESC;

-- Pending batches
SELECT batch_id, qty, date
FROM material_received
WHERE is_deleted = 0 AND batch_status = 'pending';
```

## Culling Process

```sql
SELECT entry_date, shift_type, cylinder_type, cylinder_no,
       starting_weight, ending_weight, fuel_consumption,
       raw_material_weight, final_larvae_weight, work_done
FROM culling_process
WHERE is_deleted = 0
ORDER BY created_at DESC;
```

## Oven Process

```sql
SELECT entry_date, starting_time, closing_time, running_hours,
       diesel_topup, raw_larvae_process, dried_larvae_production, dried_larvae_stock
FROM oven_process
WHERE is_deleted = 0
ORDER BY created_at DESC;
```

## Dry Process

```sql
-- type: 1 = In, 2 = Out; drying_method: 1 = Solar, 2 = Electric
SELECT date, type, drying_method, quantity, qty_manure
FROM dry_process
WHERE is_deleted = 0
ORDER BY created_at DESC;
```

## Leachate

```sql
SELECT entry_date, qty_leachate, remarks
FROM leachate
WHERE is_deleted = 0
ORDER BY created_at DESC;
```

## Egg Process

```sql
SELECT ep.entry_no, ep.entry_date, ep.tot_qty, ep.tray_utilized,
       mr.batch_id, s.supplier_name, u.user_name AS staff_name
FROM egg_process ep
JOIN material_received mr ON mr.unique_id = ep.batch
JOIN suppliers s ON s.unique_id = ep.supplier
JOIN users u ON u.unique_id = ep.staff
WHERE ep.is_deleted = 0
ORDER BY ep.created_at DESC;

-- Search by entry number
SELECT *
FROM egg_process
WHERE is_deleted = 0
  AND LOWER(entry_no) LIKE LOWER('%epc-0001%');
```

## Status Update

```sql
SELECT su.entry_date, su.day, su.hatching_status, su.remarks,
       mr.batch_id, u.user_name AS staff_name
FROM status_update su
JOIN material_received mr ON mr.unique_id = su.batch
JOIN users u ON u.unique_id = su.staff
WHERE su.is_deleted = 0
ORDER BY su.created_at DESC;
```

## Pit Status

```sql
-- org_status:
-- 1 Organic Waste Added, 2 Baby Larvae Added, 3 Aeration,
-- 4 Measurement, 5 Harvest, 6 Vibro Screen, 7 Tippi
SELECT ps.entry_date, ps.form_batch_id, p.pit_name, ps.org_status,
       ps.feed_qty, ps.larvae_qty_in, ps.larvae_qty, ps.qty_manure_1, ps.qty_rejets
FROM pit_status ps
JOIN pits p ON p.unique_id = ps.pit
WHERE ps.is_deleted = 0
ORDER BY ps.created_at DESC;

-- Monthly KPI helper example
SELECT DATE_FORMAT(entry_date, '%Y-%m') AS month,
       SUM(COALESCE(feed_qty, 0)) AS feed_total,
       SUM(COALESCE(larvae_qty, 0)) AS larvae_total,
       SUM(COALESCE(qty_rejets, 0)) AS rejects_total
FROM pit_status
WHERE is_deleted = 0
GROUP BY DATE_FORMAT(entry_date, '%Y-%m')
ORDER BY month DESC;
```

## FRP Tray Process

```sql
SELECT ftp.entry_date, ftp.frp_tray_count, ftp.batch_status, mr.batch_id
FROM frp_tray_process ftp
JOIN material_received mr ON mr.unique_id = ftp.batch
WHERE ftp.is_deleted = 0
ORDER BY ftp.created_at DESC;
```

## FRP Status Update

```sql
SELECT fsu.entry_date, fsu.day, fsu.hatching_status, fsu.remarks,
       ftp.unique_id AS frp_batch_ref, u.user_name AS staff_name
FROM frp_status_update fsu
JOIN frp_tray_process ftp ON ftp.unique_id = fsu.batch
JOIN users u ON u.unique_id = fsu.staff
WHERE fsu.is_deleted = 0
ORDER BY fsu.created_at DESC;
```
