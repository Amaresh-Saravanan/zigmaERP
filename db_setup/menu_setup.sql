-- =============================================================
-- Zigma ERP — Menu Setup SQL
-- Run this on the zigfly_erp database (192.168.1.200)
-- Tables: user_screen_main (categories) + user_screen (sub-screens)
-- =============================================================

-- -----------------------------------------------
-- 1. MAIN SCREEN CATEGORIES
-- -----------------------------------------------
-- Using INSERT IGNORE so re-running is safe.
-- unique_id values are fixed so they match user_screen FK references below.

INSERT IGNORE INTO `user_screen_main`
  (`unique_id`, `screen_main_name`, `icon_name`, `order_no`, `is_active`, `is_delete`)
VALUES
  ('msm_admin',      'Admin',             'ri-team-fill',            2, 1, 0),
  ('msm_settings',   'Settings',          'ri-settings-3-fill',      3, 1, 0),
  ('msm_hatching',   'Hatching Center',   'ri-calendar-event-fill',  4, 1, 0),
  ('msm_processing', 'Processing Center', 'ri-stack-fill',           5, 1, 0),
  ('msm_drying',     'Drying Center',     'ri-calendar-check-fill',  6, 1, 0),
  ('msm_report',     'Report',            'ri-file-list-3-fill',     7, 1, 0);

-- -----------------------------------------------
-- 2. SUB-SCREENS
-- -----------------------------------------------
-- screen_main_name column = unique_id of the parent category.

INSERT IGNORE INTO `user_screen`
  (`unique_id`, `screen_name`, `folder_name`, `screen_main_name`, `icon_name`, `order_no`, `actions`, `is_active`, `is_delete`)
VALUES
  -- Admin
  ('us_user',           'User',               'user',             'msm_admin',      '', 1, '', 1, 0),
  ('us_user_type',      'User Type',           'user_type',        'msm_admin',      '', 2, '', 1, 0),
  ('us_user_screen',    'User Screen',         'user_screen',      'msm_admin',      '', 3, '', 1, 0),
  ('us_user_perm',      'User Permission',     'user_permission',  'msm_admin',      '', 4, '', 1, 0),
  ('us_main_screen',    'Main Screen',         'main_screen',      'msm_admin',      '', 5, '', 1, 0),
  ('us_login_history',  'Login History',       'login_history',    'msm_admin',      '', 6, '', 1, 0),

  -- Settings
  ('us_item',     'Item Creation',     'item_creation',     'msm_settings', '', 1, '', 1, 0),
  ('us_tray',     'Tray Creation',     'tray_creation',     'msm_settings', '', 2, '', 1, 0),
  ('us_unit',     'Unit Creation',     'unit_creation',     'msm_settings', '', 3, '', 1, 0),
  ('us_supplier', 'Supplier Creation', 'supplier_creation', 'msm_settings', '', 4, '', 1, 0),
  ('us_pit',      'Pit Creation',      'pit_creation',      'msm_settings', '', 5, '', 1, 0),

  -- Hatching Center
  ('us_screening',  'Screening Process', 'screening_process',  'msm_hatching', '', 1, '', 1, 0),
  ('us_egg',        'Egg Process',        'egg_process',        'msm_hatching', '', 2, '', 1, 0),
  ('us_culling',    'Culling Process',    'culling_process',    'msm_hatching', '', 3, '', 1, 0),
  ('us_mat_recv',   'Material Received',  'material_received',  'msm_hatching', '', 4, '', 1, 0),

  -- Processing Center
  ('us_status_upd',   'Status Update',    'status_update',    'msm_processing', '', 1, '', 1, 0),
  ('us_pit_status',   'Pit Status',        'pit_status',       'msm_processing', '', 2, '', 1, 0),
  ('us_frp_tray',     'FRP Tray Process',  'frp_tray_process', 'msm_processing', '', 3, '', 1, 0),
  ('us_frp_status',   'FRP Status Update', 'frp_status_update','msm_processing', '', 4, '', 1, 0),

  -- Drying Center
  ('us_oven',     'Oven Process', 'oven_process', 'msm_drying', '', 1, '', 1, 0),
  ('us_dry',      'Dry Process',  'dry_process',  'msm_drying', '', 2, '', 1, 0),
  ('us_leachate', 'Leachate',     'leachate',     'msm_drying', '', 3, '', 1, 0),

  -- Report
  ('us_logsheet',        'Logsheet',            'logsheet',            'msm_report', '', 1, '', 1, 0),
  ('us_dc',              'DC',                   'dc',                  'msm_report', '', 2, '', 1, 0),
  ('us_measurable',      'Measurable',           'measurable',          'msm_report', '', 3, '', 1, 0),
  ('us_meas_rpt',        'Measurable Report',    'measurable_report',   'msm_report', '', 4, '', 1, 0),
  ('us_egg_rpt',         'Egg Process Report',   'egg_process_report',  'msm_report', '', 5, '', 1, 0),
  ('us_pit_rpt',         'Pit Status Report',    'pit_status_report',   'msm_report', '', 6, '', 1, 0),
  ('us_rejects_rpt',     'Rejects Report',       'rejects_report',      'msm_report', '', 7, '', 1, 0),
  ('us_rejects_img',     'Rejects Image Upload', 'rejects_image_upload','msm_report', '', 8, '', 1, 0);

-- -----------------------------------------------
-- 3. GRANT ALL SCREENS TO ADMIN USER TYPE
-- -----------------------------------------------
-- user_screen_permission: user_type, main_screen_unique_id, section_unique_id, screen_unique_id
-- Admin user_type = '5f97fc3257f2525529'

INSERT IGNORE INTO `user_screen_permission`
  (`user_type`, `main_screen_unique_id`, `section_unique_id`, `screen_unique_id`)
VALUES
  -- Admin category
  ('5f97fc3257f2525529', 'msm_admin',      '', 'us_user'),
  ('5f97fc3257f2525529', 'msm_admin',      '', 'us_user_type'),
  ('5f97fc3257f2525529', 'msm_admin',      '', 'us_user_screen'),
  ('5f97fc3257f2525529', 'msm_admin',      '', 'us_user_perm'),
  ('5f97fc3257f2525529', 'msm_admin',      '', 'us_main_screen'),
  ('5f97fc3257f2525529', 'msm_admin',      '', 'us_login_history'),
  -- Settings
  ('5f97fc3257f2525529', 'msm_settings',   '', 'us_item'),
  ('5f97fc3257f2525529', 'msm_settings',   '', 'us_tray'),
  ('5f97fc3257f2525529', 'msm_settings',   '', 'us_unit'),
  ('5f97fc3257f2525529', 'msm_settings',   '', 'us_supplier'),
  ('5f97fc3257f2525529', 'msm_settings',   '', 'us_pit'),
  -- Hatching Center
  ('5f97fc3257f2525529', 'msm_hatching',   '', 'us_screening'),
  ('5f97fc3257f2525529', 'msm_hatching',   '', 'us_egg'),
  ('5f97fc3257f2525529', 'msm_hatching',   '', 'us_culling'),
  ('5f97fc3257f2525529', 'msm_hatching',   '', 'us_mat_recv'),
  -- Processing Center
  ('5f97fc3257f2525529', 'msm_processing', '', 'us_status_upd'),
  ('5f97fc3257f2525529', 'msm_processing', '', 'us_pit_status'),
  ('5f97fc3257f2525529', 'msm_processing', '', 'us_frp_tray'),
  ('5f97fc3257f2525529', 'msm_processing', '', 'us_frp_status'),
  -- Drying Center
  ('5f97fc3257f2525529', 'msm_drying',     '', 'us_oven'),
  ('5f97fc3257f2525529', 'msm_drying',     '', 'us_dry'),
  ('5f97fc3257f2525529', 'msm_drying',     '', 'us_leachate'),
  -- Report
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_logsheet'),
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_dc'),
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_measurable'),
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_meas_rpt'),
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_egg_rpt'),
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_pit_rpt'),
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_rejects_rpt'),
  ('5f97fc3257f2525529', 'msm_report',     '', 'us_rejects_img');

-- Done. Verify with:
-- SELECT * FROM user_screen_main ORDER BY order_no;
-- SELECT * FROM user_screen ORDER BY screen_main_name, order_no;
