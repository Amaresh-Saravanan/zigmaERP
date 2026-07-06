# Reports Folder SQL Commands

Source module: `backend/reports`

## Tables (collection equivalents)

- `measurable`
- `logsheet`
- `dc`
- `reject`
- `reject_image`

## Measurable

```sql
SELECT unique_id, entry_date, location, temp, humi, remarks
FROM measurable
WHERE is_deleted = 0
ORDER BY created_at DESC;

-- Temperature trend by day
SELECT entry_date,
       AVG(temp) AS avg_temp,
       AVG(humi) AS avg_humidity
FROM measurable
WHERE is_deleted = 0
GROUP BY entry_date
ORDER BY entry_date DESC;
```

## Logsheet

```sql
SELECT unique_id, entry_date, remarks, created_at
FROM logsheet
WHERE is_deleted = 0
ORDER BY entry_date DESC;
```

## Delivery Challan (DC)

```sql
SELECT dc_number, challan_date, bill_to_company, po_ref, tax_rate, grand_total
FROM dc
WHERE is_deleted = 0
ORDER BY created_at DESC;

-- Lookup by dc number
SELECT *
FROM dc
WHERE dc_number = 'DC-0001' AND is_deleted = 0
LIMIT 1;
```

## Reject

```sql
SELECT ticket_no, vehicle_no, vendor, date, time,
       empty_weight, loaded_weight, net_weight
FROM reject
WHERE is_deleted = 0
ORDER BY created_at DESC;

-- Daily reject totals
SELECT date,
       SUM(net_weight) AS total_net_weight,
       COUNT(*) AS trips
FROM reject
WHERE is_deleted = 0
GROUP BY date
ORDER BY date DESC;
```

## Reject Images

```sql
SELECT ri.ticket_no, ri.image_path, ri.upload_date, ri.vehicle_no, ri.net_weight
FROM reject_image ri
WHERE ri.is_deleted = 0
ORDER BY ri.created_at DESC;

-- Reject rows with image presence
SELECT r.ticket_no,
       r.vehicle_no,
       CASE WHEN COUNT(ri.unique_id) > 0 THEN 1 ELSE 0 END AS has_image
FROM reject r
LEFT JOIN reject_image ri
  ON ri.ticket_no = r.ticket_no
 AND ri.is_deleted = 0
WHERE r.is_deleted = 0
GROUP BY r.ticket_no, r.vehicle_no
ORDER BY r.ticket_no DESC;
```
