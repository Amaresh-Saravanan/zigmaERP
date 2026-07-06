# Accounts Folder SQL Commands

Source module: `backend/accounts`

## Tables (collection equivalents)

- `user_types`
- `users`
- `auth_tokens`
- `user_login_details`

## User Types

```sql
-- List active user types
SELECT unique_id, type_name, description, main_screens, screens
FROM user_types
WHERE is_deleted = 0 AND is_active = 1
ORDER BY type_name;

-- Create user type
INSERT INTO user_types (unique_id, type_name, description, main_screens, screens, is_active, is_deleted, created_at)
VALUES ('<uuid>', 'Admin', 'Full access', 'msm_admin,msm_settings', 'user_view,user_create', 1, 0, NOW());

-- Update role permissions
UPDATE user_types
SET screens = 'item_view,item_create,item_edit,item_delete'
WHERE unique_id = '<user_type_uuid>';
```

## Users

```sql
-- List users with their role
SELECT u.unique_id, u.user_name, u.first_name, u.last_name, u.user_email,
       ut.type_name AS user_type, u.is_active, u.created_at
FROM users u
LEFT JOIN user_types ut ON ut.unique_id = u.user_type
WHERE u.is_deleted = 0
ORDER BY u.created_at DESC;

-- Find one user by username
SELECT *
FROM users
WHERE user_name = 'demo' AND is_deleted = 0
LIMIT 1;

-- Soft delete user
UPDATE users
SET is_deleted = 1
WHERE unique_id = '<user_uuid>';
```

## Tokens

```sql
-- Token for a user
SELECT t.key, t.created_at, u.user_name
FROM auth_tokens t
JOIN users u ON u.unique_id = t.user
WHERE u.user_name = 'demo';

-- Revoke token
DELETE FROM auth_tokens
WHERE user = '<user_uuid>';
```

## Login History

```sql
-- Daily login/logout events
SELECT l.entry_date, l.entry_time, l.log_type, u.user_name
FROM user_login_details l
JOIN users u ON u.unique_id = l.user
WHERE l.is_deleted = 0
ORDER BY l.entry_date DESC, l.entry_time DESC;

-- Worked-hours helper (first login / last logout per day)
SELECT l.entry_date,
       MIN(CASE WHEN l.log_type = 1 THEN l.entry_time END) AS first_login,
       MAX(CASE WHEN l.log_type = 2 THEN l.entry_time END) AS last_logout
FROM user_login_details l
WHERE l.user = '<user_uuid>' AND l.is_deleted = 0
GROUP BY l.entry_date
ORDER BY l.entry_date DESC;
```
