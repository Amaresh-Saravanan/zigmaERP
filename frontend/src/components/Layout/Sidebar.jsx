import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import djangoClient from '../../api/djangoClient';
import zigFlyLogo from '../../assets/images/zig-fly-logo.png';
import faviIcon from '../../assets/images/favi-icon.png';

// ponytail: static fallback shown when /api/menu is unavailable (backend offline / demo mode)
// unique_ids here match db_setup/menu_setup.sql so permissions work when DB is live.
// Grouping matches the official ZigmaERP sidebar spec (screen_name labels + section
// placement below reflect that spec, not the legacy PHP grouping — see Migration_Tracker.md).
const DEMO_MENU = [
  {
    unique_id: 'msm_admin', screen_main_name: 'Admin', icon_name: 'ri-team-fill', sub_screens: [
      { unique_id: 'us_main_screen', screen_name: 'Main Screen', folder_name: 'main_screen' },
      { unique_id: 'us_user_screen', screen_name: 'User Screen', folder_name: 'user_screen' },
      { unique_id: 'us_user_type', screen_name: 'User Type', folder_name: 'user_type' },
      { unique_id: 'us_user', screen_name: 'User Creation', folder_name: 'user' },
      { unique_id: 'us_user_perm', screen_name: 'User Permission', folder_name: 'user_permission' },
    ]
  },
  {
    unique_id: 'msm_settings', screen_main_name: 'Settings', icon_name: 'ri-settings-3-fill', sub_screens: [
      { unique_id: 'us_pit', screen_name: 'Pit Creation', folder_name: 'pit_creation' },
      { unique_id: 'us_tray', screen_name: 'Tray Creation', folder_name: 'tray_creation' },
      { unique_id: 'us_unit', screen_name: 'Unit Creation', folder_name: 'unit_creation' },
      { unique_id: 'us_supplier', screen_name: 'Supplier Creation', folder_name: 'supplier_creation' },
      { unique_id: 'us_item', screen_name: 'Item Creation', folder_name: 'item_creation' },
      { unique_id: 'us_rejects_img', screen_name: 'Rejects Image Upload', folder_name: 'rejects_image_upload' },
      { unique_id: 'us_leachate', screen_name: 'Lea Chate', folder_name: 'leachate' },
    ]
  },
  {
    unique_id: 'msm_hatching', screen_main_name: 'Hatching Center', icon_name: 'ri-calendar-event-fill', sub_screens: [
      { unique_id: 'us_mat_recv', screen_name: 'Egg Received', folder_name: 'material_received' },
      { unique_id: 'us_egg', screen_name: 'Egg Process', folder_name: 'egg_process' },
      { unique_id: 'us_status_upd', screen_name: 'Egg Status Update', folder_name: 'status_update' },
      { unique_id: 'us_frp_tray', screen_name: 'FRP Tray Process', folder_name: 'frp_tray_process' },
      { unique_id: 'us_frp_status', screen_name: 'FRP Tray Status Update', folder_name: 'frp_status_update' },
    ]
  },
  {
    unique_id: 'msm_processing', screen_main_name: 'Processing Center', icon_name: 'ri-stack-fill', sub_screens: [
      { unique_id: 'us_pit_status', screen_name: 'Pit Status', folder_name: 'pit_status' },
      { unique_id: 'us_screening', screen_name: 'Screening Process', folder_name: 'screening_process' },
      { unique_id: 'us_measurable', screen_name: 'Measurable', folder_name: 'measurable' },
    ]
  },
  {
    unique_id: 'msm_drying', screen_main_name: 'Drying Center', icon_name: 'ri-calendar-check-fill', sub_screens: [
      { unique_id: 'us_dry', screen_name: 'Dry Process', folder_name: 'dry_process' },
      { unique_id: 'us_culling', screen_name: 'Culling Process', folder_name: 'culling_process' },
      { unique_id: 'us_oven', screen_name: 'Oven Process', folder_name: 'oven_process' },
    ]
  },
  {
    unique_id: 'msm_report', screen_main_name: 'Report', icon_name: 'ri-file-list-3-fill', sub_screens: [
      { unique_id: 'us_egg_rpt', screen_name: 'Egg Process Report', folder_name: 'egg_process_report' },
      { unique_id: 'us_pit_rpt', screen_name: 'Pit Status Report', folder_name: 'pit_status_report' },
      { unique_id: 'us_meas_rpt', screen_name: 'Measurable Report', folder_name: 'measurable_report' },
      { unique_id: 'us_rejects_rpt', screen_name: 'Rejects Report', folder_name: 'rejects_report' },
      { unique_id: 'us_login_history', screen_name: 'Login History', folder_name: 'login_history' },
      { unique_id: 'us_logsheet', screen_name: 'Logsheet', folder_name: 'logsheet' },
      { unique_id: 'us_dc', screen_name: 'DC', folder_name: 'dc' },
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
  const location = useLocation();
  const isCollapsed = useIsCollapsed();

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

  // ponytail: collapsed mode is icons-only (no sub-menu popout) — a click there is a
  // no-op; expand the sidebar via the header toggle to navigate sub-screens.
  const handleIconClick = (e, main) => {
    e.preventDefault();
    if (!isCollapsed) toggle(main.unique_id);
  };

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
                      aria-expanded={isOpen}
                    >
                      {main.icon_name && <i className={main.icon_name}></i>}
                      <span>{main.screen_main_name}</span>
                    </a>

                    {/* Normal expanded accordion — grid-rows animates open/close since
                        toggling bootstrap's collapse/show classes without its JS plugin
                        (which drives the .collapsing height transition) just snaps instantly. */}
                    {!isCollapsed && (
                      <div className={`menu-dropdown-grid${isOpen ? ' is-open' : ''}`}>
                        <div className="menu-dropdown-inner">
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

      <style>{`
        /* Sidebar collapse width transition. MUST match the vendor rule
           .main-content { transition: all .1s ease-out } — otherwise the sidebar and
           the content beside it animate at different speeds and visibly tear/desync. */
        .app-menu {
          transition: width 0.1s ease-out;
        }

        /* Accordion submenu open/close — grid-rows animates height without knowing the
           content height upfront (0fr → 1fr). */
        .menu-dropdown-grid {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s ease;
        }
        .menu-dropdown-grid.is-open {
          grid-template-rows: 1fr;
        }
        .menu-dropdown-inner {
          overflow: hidden;
          min-height: 0;
          /* restore the indent the vendor .menu-dropdown class provided, dropped when
             we swapped it for the grid wrapper — keeps sub-items aligned under the parent. */
          padding-left: 28px;
        }

        /* Smooth the vendor dropdown-arrow rotation to match the panel animation. */
        .menu-link:after {
          transition: transform 0.25s ease;
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
