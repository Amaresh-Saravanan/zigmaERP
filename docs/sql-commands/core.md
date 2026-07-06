# Core Folder SQL Commands

Source module: `backend/core`

## Tables (collection equivalents)

- `main_screens`
- `screens`

## Main Screens

```sql
-- All sidebar categories
SELECT unique_id, screen_main_name, icon_name, is_active
FROM main_screens
WHERE is_deleted = 0
ORDER BY screen_main_name;

-- Create main screen
INSERT INTO main_screens (unique_id, screen_main_name, icon_name, is_active, is_deleted)
VALUES ('<uuid>', 'Processing', 'layers', 1, 0);
```

## Sub Screens

```sql
-- Sub screens under each main screen
SELECT s.unique_id, s.screen_name, s.folder_name, s.icon_name, s.order_no,
       m.screen_main_name
FROM screens s
JOIN main_screens m ON m.unique_id = s.main_screen
WHERE s.is_deleted = 0 AND s.is_active = 1
ORDER BY m.screen_main_name, s.order_no, s.screen_name;

-- Search by screen name
SELECT *
FROM screens
WHERE is_deleted = 0
  AND LOWER(screen_name) LIKE LOWER('%status%');

-- Reorder a screen
UPDATE screens
SET order_no = 3
WHERE unique_id = '<screen_uuid>';
```

## Permission Menu View (role + menu)

```sql
-- Expand role-visible screens conceptually
SELECT ut.type_name, ut.main_screens, ut.screens
FROM user_types ut
WHERE ut.unique_id = '<user_type_uuid>';
```
