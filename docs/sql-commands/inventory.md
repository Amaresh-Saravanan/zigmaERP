# Inventory Folder SQL Commands

Source module: `backend/inventory`

## Tables (collection equivalents)

- `units`
- `items`
- `trays`
- `pits`
- `suppliers`

## Units

```sql
SELECT unique_id, unit_name, is_active
FROM units
WHERE is_deleted = 0
ORDER BY unit_name;
```

## Items

```sql
-- Item list with unit
SELECT i.unique_id, i.item_code, i.item_name, u.unit_name, i.is_active, i.created_at
FROM items i
JOIN units u ON u.unique_id = i.unit
WHERE i.is_deleted = 0
ORDER BY i.created_at DESC;

-- Create item
INSERT INTO items (unique_id, item_code, item_name, unit, is_active, is_deleted, created_at, updated_at)
VALUES ('<uuid>', 'IT-001', 'Organic Waste', '<unit_uuid>', 1, 0, NOW(), NOW());

-- Search items by name
SELECT *
FROM items
WHERE is_deleted = 0
  AND LOWER(item_name) LIKE LOWER('%egg%');
```

## Trays

```sql
-- tray_type: 1 = EGG Tray, 2 = FRP Tray
SELECT unique_id, tray_type, bin_name, is_active, created_at
FROM trays
WHERE is_deleted = 0
ORDER BY created_at DESC;

-- Count active non-test trays (matches dashboard intent)
SELECT COUNT(*) AS active_non_test_trays
FROM trays
WHERE is_deleted = 0
  AND is_active = 1
  AND LOWER(bin_name) NOT LIKE '%test%';
```

## Pits

```sql
SELECT unique_id, pit_name, location, length, width, height, volume, is_active
FROM pits
WHERE is_deleted = 0
ORDER BY pit_name;

-- Update pit dimensions
UPDATE pits
SET length = 10.0, width = 5.0, height = 2.0
WHERE unique_id = '<pit_uuid>';
```

## Suppliers

```sql
SELECT unique_id, supplier_name, label, contact_no, email, gst_no, is_active
FROM suppliers
WHERE is_deleted = 0
ORDER BY supplier_name;

-- Soft delete supplier
UPDATE suppliers
SET is_deleted = 1
WHERE unique_id = '<supplier_uuid>';
```
