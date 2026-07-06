import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import djangoClient from '../../api/djangoClient';
import zigFlyLogo from '../../assets/images/zig-fly-logo.png';
import faviIcon from '../../assets/images/favi-icon.png';

// ponytail: static fallback shown when /api/menu is unavailable (backend offline / demo mode)
// unique_ids here match db_setup/menu_setup.sql so permissions work when DB is live
const DEMO_MENU = [
  {
    unique_id: 'msm_admin', screen_main_name: 'Admin', icon_name: 'ri-team-fill', sub_screens: [
      { unique_id: 'us_user', screen_name: 'User', folder_name: 'user' },
      { unique_id: 'us_user_type', screen_name: 'User Type', folder_name: 'user_type' },
      { unique_id: 'us_user_screen', screen_name: 'User Screen', folder_name: 'user_screen' },
      { unique_id: 'us_user_perm', screen_name: 'User Permission', folder_name: 'user_permission' },
      { unique_id: 'us_main_screen', screen_name: 'Main Screen', folder_name: 'main_screen' },
      { unique_id: 'us_login_history', screen_name: 'Login History', folder_name: 'login_history' },
    ]
  },
  {
    unique_id: 'msm_settings', screen_main_name: 'Settings', icon_name: 'ri-settings-3-fill', sub_screens: [
      { unique_id: 'us_item', screen_name: 'Item Creation', folder_name: 'item_creation' },
      { unique_id: 'us_tray', screen_name: 'Tray Creation', folder_name: 'tray_creation' },
      { unique_id: 'us_unit', screen_name: 'Unit Creation', folder_name: 'unit_creation' },
      { unique_id: 'us_supplier', screen_name: 'Supplier Creation', folder_name: 'supplier_creation' },
      { unique_id: 'us_pit', screen_name: 'Pit Creation', folder_name: 'pit_creation' },
    ]
  },
  {
    unique_id: 'msm_hatching', screen_main_name: 'Hatching Center', icon_name: 'ri-calendar-event-fill', sub_screens: [
      { unique_id: 'us_screening', screen_name: 'Screening Process', folder_name: 'screening_process' },
      { unique_id: 'us_egg', screen_name: 'Egg Process', folder_name: 'egg_process' },
      { unique_id: 'us_culling', screen_name: 'Culling Process', folder_name: 'culling_process' },
      { unique_id: 'us_mat_recv', screen_name: 'Material Received', folder_name: 'material_received' },
    ]
  },
  {
    unique_id: 'msm_processing', screen_main_name: 'Processing Center', icon_name: 'ri-stack-fill', sub_screens: [
      { unique_id: 'us_status_upd', screen_name: 'Status Update', folder_name: 'status_update' },
      { unique_id: 'us_pit_status', screen_name: 'Pit Status', folder_name: 'pit_status' },
      { unique_id: 'us_frp_tray', screen_name: 'FRP Tray Process', folder_name: 'frp_tray_process' },
      { unique_id: 'us_frp_status', screen_name: 'FRP Status Update', folder_name: 'frp_status_update' },
    ]
  },
  {
    unique_id: 'msm_drying', screen_main_name: 'Drying Center', icon_name: 'ri-calendar-check-fill', sub_screens: [
      { unique_id: 'us_oven', screen_name: 'Oven Process', folder_name: 'oven_process' },
      { unique_id: 'us_dry', screen_name: 'Dry Process', folder_name: 'dry_process' },
      { unique_id: 'us_leachate', screen_name: 'Leachate', folder_name: 'leachate' },
    ]
  },
  {
    unique_id: 'msm_report', screen_main_name: 'Report', icon_name: 'ri-file-list-3-fill', sub_screens: [
      { unique_id: 'us_logsheet', screen_name: 'Logsheet', folder_name: 'logsheet' },
      { unique_id: 'us_dc', screen_name: 'DC', folder_name: 'dc' },
      { unique_id: 'us_measurable', screen_name: 'Measurable', folder_name: 'measurable' },
      { unique_id: 'us_meas_rpt', screen_name: 'Measurable Report', folder_name: 'measurable_report' },
      { unique_id: 'us_egg_rpt', screen_name: 'Egg Process Report', folder_name: 'egg_process_report' },
      { unique_id: 'us_pit_rpt', screen_name: 'Pit Status Report', folder_name: 'pit_status_report' },
      { unique_id: 'us_rejects_rpt', screen_name: 'Rejects Report', folder_name: 'rejects_report' },
      { unique_id: 'us_rejects_img', screen_name: 'Rejects Image Upload', folder_name: 'rejects_image_upload' },
    ]
  },
];

// ponytail: read collapse state from the HTML attribute set by Header.jsx's toggleSidebar()
function useIsCollapsed() {
  const [collapsed, setCollapsed] = useState(
    () => document.documentElement.getAttribute('data-sidebar-size') === 'sm'
  );
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setCollapsed(document.documentElement.getAttribute('data-sidebar-size') === 'sm');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-sidebar-size'] });
    return () => obs.disconnect();
  }, []);
  return collapsed;
}

export default function Sidebar() {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const [openId, setOpenId] = useState(null); // ponytail: single-accordion
  const [flyoutId, setFlyoutId] = useState(null); // collapsed pill: click-pinned open (shows dropdown)
  const [hoverId, setHoverId] = useState(null); // collapsed pill: hover-shown (name only, no dropdown)
  const [pillTop, setPillTop] = useState(0);
  const location = useLocation();
  const isCollapsed = useIsCollapsed();
  const flyoutRef = useRef(null);

  useEffect(() => {
    djangoClient.get('/menu', { suppressError: true }).then(res => {
      if (res.data?.status === 1 && res.data.data?.length) {
        setMenu(res.data.data);
      }
    }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeMenu = menu.length ? menu : DEMO_MENU;

  useEffect(() => {
    if (!openId) {
      const active = activeMenu.find(m =>
        m.sub_screens?.some(s => location.pathname.startsWith(`/${s.folder_name}`))
      );
      if (active) setOpenId(active.unique_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

  // Close pill/flyout when sidebar expands
  useEffect(() => {
    if (!isCollapsed) { setFlyoutId(null); setHoverId(null); }
  }, [isCollapsed]);

  // Close pill/flyout on outside click
  const closeFlyout = useCallback((e) => {
    if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
      setFlyoutId(null);
      setHoverId(null);
    }
  }, []);
  useEffect(() => {
    if (flyoutId || hoverId) document.addEventListener('mousedown', closeFlyout);
    return () => document.removeEventListener('mousedown', closeFlyout);
  }, [flyoutId, hoverId, closeFlyout]);

  const hasScreen = (id) => {
    if (!user?.screens) return false;
    if (Array.isArray(user.screens)) return user.screens.includes(id);
    return user.screens.split(',').includes(id);
  };

  const visibleSubs = (main) =>
    menu.length
      ? (main.sub_screens?.filter(s => hasScreen(s.unique_id)) ?? [])
      : (main.sub_screens ?? []);

  const isWorker = user?.userType === '6213273aa04b228161';
  const toggle = (id) => setOpenId(prev => (prev === id ? null : id));

  const handleIconClick = (e, main) => {
    e.preventDefault();
    if (!isCollapsed) {
      toggle(main.unique_id);
      return;
    }
    // Position the pill at the clicked icon's Y position, pin it open (dropdown shows)
    const rect = e.currentTarget.getBoundingClientRect();
    setPillTop(rect.top);
    setHoverId(main.unique_id);
    setFlyoutId(prev => (prev === main.unique_id ? null : main.unique_id));
  };

  const handleIconEnter = (e, main) => {
    if (!isCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPillTop(rect.top);
    setHoverId(main.unique_id);
  };

  const handleIconLeave = (main) => {
    if (!isCollapsed) return;
    if (flyoutId !== main.unique_id) setHoverId(null);
  };

  // pillMenu drives the visible white pill: shown on hover OR click; the dropdown
  // body only expands when flyoutId matches (i.e. the pill was clicked, not just hovered).
  const pillId = flyoutId || hoverId;
  const pillMenu = pillId ? activeMenu.find(m => m.unique_id === pillId) : null;
  const pillSubs = pillMenu ? visibleSubs(pillMenu) : [];

  return (
    <>
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box mt-2 pb-2">
          <a href="/" className="logo logo-dark" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
            <span className="logo-sm">
              <img src={faviIcon} alt="Zigfly Logo Small" height="32" />
            </span>
            <span className="logo-lg">
              <img src={zigFlyLogo} alt="Zigfly Logo" height="64" />
            </span>
          </a>
          <a href="/" className="logo logo-light" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
            <span className="logo-sm">
              <img src={faviIcon} alt="Zigfly Logo Small" height="32" />
            </span>
            <span className="logo-lg">
              <img src={zigFlyLogo} alt="Zigfly Logo" height="64" />
            </span>
          </a>
          <button type="button" className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover" id="vertical-hover" aria-label="Toggle sidebar size">
            <i className="ri-record-circle-line" aria-hidden="true"></i>
          </button>
        </div>

        <div id="scrollbar">
          <div className="container-fluid">
            <div id="two-column-menu"></div>
            <ul className="navbar-nav" id="navbar-nav">
              <li className="menu-title"><span data-key="t-menu">Menu</span></li>

              {/* Dashboards — direct link, no sub-menu */}
              {!isWorker && (
                <li className="nav-item">
                  <Link
                    className={`nav-link menu-link ${location.pathname === '/' ? 'active' : ''}`}
                    to="/"
                  >
                    <i className="ri-home-3-fill"></i>
                    <span>Dashboards</span>
                  </Link>
                </li>
              )}

              {/* Dynamic menu categories */}
              {activeMenu.map(main => {
                const subs = visibleSubs(main);
                const isOpen = openId === main.unique_id;
                const isActive = subs.some(s => location.pathname.startsWith(`/${s.folder_name}`));

                return (
                  <li className="nav-item" key={main.unique_id}>
                    <a
                      className={`nav-link menu-link${isActive ? ' active' : ''}`}
                      href="#"
                      onClick={e => handleIconClick(e, main)}
                      onMouseEnter={e => handleIconEnter(e, main)}
                      onMouseLeave={() => handleIconLeave(main)}
                      aria-expanded={isCollapsed ? flyoutId === main.unique_id : isOpen}
                    >
                      {main.icon_name && <i className={main.icon_name}></i>}
                      <span>{main.screen_main_name}</span>
                    </a>

                    {/* Normal expanded accordion */}
                    {!isCollapsed && (
                      <div className={`collapse menu-dropdown ${isOpen ? 'show' : ''}`}>
                        <ul className="nav nav-sm flex-column">
                          {subs.map(sub => {
                            const path = `/${sub.folder_name}/list`;
                            const isSubActive = location.pathname.startsWith(`/${sub.folder_name}`);
                            return (
                              <li className={`nav-item ${isSubActive ? 'active' : ''}`} key={sub.unique_id}>
                                <Link to={path} className={`nav-link ${isSubActive ? 'active' : ''}`}>
                                  {sub.screen_name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="sidebar-background"></div>
      </div>

      {/* Collapsed pill — white "name" pill on hover/click, expands into a connected
          white dropdown on click. Rendered outside the sidebar so it can overflow. */}
      {isCollapsed && pillMenu && (
        <div
          ref={flyoutRef}
          className={`sb-pill${flyoutId === pillMenu.unique_id ? ' sb-pill-open' : ''}`}
          style={{ top: pillTop }}
          onMouseEnter={() => setHoverId(pillMenu.unique_id)}
          onMouseLeave={() => { if (flyoutId !== pillMenu.unique_id) setHoverId(null); }}
        >
          <button
            type="button"
            className="sb-pill-head"
            onClick={e => handleIconClick(e, pillMenu)}
          >
            {pillMenu.icon_name && <i className={pillMenu.icon_name}></i>}
            <span>{pillMenu.screen_main_name}</span>
          </button>

          <div className="sb-pill-body-wrap">
            <div className="sb-pill-body">
              <ul className="sb-pill-list">
                {pillSubs.map(sub => {
                  const path = `/${sub.folder_name}/list`;
                  const isSubActive = location.pathname.startsWith(`/${sub.folder_name}`);
                  return (
                    <li key={sub.unique_id}>
                      <Link
                        to={path}
                        className={`sb-pill-link${isSubActive ? ' active' : ''}`}
                        onClick={() => { setFlyoutId(null); setHoverId(null); }}
                      >
                        {sub.screen_name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sbPillIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        /* Collapsed-sidebar "expanding pill" — icon+name pill on hover/click; on click
           the grid row below animates open to reveal the submenu, seamlessly connected
           to the pill above (single white surface, no separate floating box). */
        .sb-pill {
          position: fixed;
          left: 76px;
          z-index: 1100;
          display: grid;
          grid-template-rows: auto 0fr;
          min-width: 190px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.08);
          overflow: hidden;
          animation: sbPillIn 0.18s ease;
          transition: grid-template-rows 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sb-pill-open {
          grid-template-rows: auto 1fr;
        }
        .sb-pill-head {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          border: none;
          background: transparent;
          padding: 12px 18px;
          font-size: 0.86rem;
          font-weight: 600;
          color: #1a2232;
          white-space: nowrap;
          text-align: left;
          cursor: pointer;
        }
        .sb-pill-head i {
          font-size: 1.05rem;
          color: #25a96b;
        }
        .sb-pill-body-wrap {
          min-height: 0;
          overflow: hidden;
        }
        .sb-pill-body {
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          padding: 4px 0;
        }
        .sb-pill-list {
          list-style: none;
          margin: 0;
          padding: 4px 0;
        }
        .sb-pill-link {
          display: block;
          padding: 8px 18px 8px 40px;
          font-size: 0.82rem;
          color: #333c4d;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .sb-pill-link:hover {
          background: #f1f3f6;
          color: #1a2232;
        }
        .sb-pill-link.active {
          background: #eafaf1;
          color: #25a96b;
          font-weight: 600;
        }
        /* Center the favicon when sidebar is in sm (collapsed) mode */
        [data-sidebar-size='sm'] .navbar-brand-box {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
        [data-sidebar-size='sm'] .logo-sm img {
          display: block;
          margin: 0 auto;
        }
        [data-sidebar-size='sm'] .logo-lg {
          display: none !important;
        }
      `}</style>
    </>
  );
}
