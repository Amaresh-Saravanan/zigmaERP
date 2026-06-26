import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import client from '../../api/client';

export default function Sidebar() {
  const { user } = useAuth();
  const [menu, setMenu] = useState([]);
  const location = useLocation();

  useEffect(() => {
    // Fetch full menu structure from backend
    client.get('folders/login/menu.php').then(res => {
      if (res.data?.status === 1) {
        setMenu(res.data.menu);
      }
    });
  }, []);

  // Filter based on user permissions
  // user.mainScreens and user.screens might be strings or arrays depending on how they were fetched.
  const hasMainScreen = (id) => {
    if (!user?.mainScreens) return false;
    if (Array.isArray(user.mainScreens)) return user.mainScreens.includes(id);
    return user.mainScreens.split(',').includes(id);
  };

  const hasScreen = (id) => {
    if (!user?.screens) return false;
    if (Array.isArray(user.screens)) return user.screens.includes(id);
    return user.screens.split(',').includes(id);
  };

  const isWorker = user?.userType === '6213273aa04b228161';

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box mt-2 pb-2">
        <Link to="/" className="logo logo-dark">
          <span className="logo-sm">
            <img src="/assets/images/favi-icon.png" alt="" height="32" />
          </span>
          <span className="logo-lg">
            <img src="/assets/images/zig-fly-logo.png" alt="" height="64" />
          </span>
        </Link>
        <Link to="/" className="logo logo-light">
          <span className="logo-sm">
            <img src="/assets/images/favi-icon.png" alt="" height="32" />
          </span>
          <span className="logo-lg">
            <img src="/assets/images/zig-fly-logo.png" alt="" height="64" />
          </span>
        </Link>
        <button type="button" className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover" id="vertical-hover">
          <i className="ri-record-circle-line"></i>
        </button>
      </div>

      <div id="scrollbar">
        <div className="container-fluid">
          <div id="two-column-menu"></div>
          <ul className="navbar-nav" id="navbar-nav">
            <li className="menu-title"><span data-key="t-menu">Menu</span></li>
            
            <li className="nav-item">
              {!isWorker && (
                <Link className={`nav-link menu-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
                  <i className="ri-home-3-fill"></i> <span data-key="t-dashboards">Dashboards</span>
                </Link>
              )}
            </li>

            {menu.filter(m => hasMainScreen(m.unique_id)).map(main => (
              <li className="nav-item" key={main.unique_id}>
                <a
                  className="nav-link menu-link collapsed"
                  href={`#sidebarDashboards${main.unique_id}`}
                  data-bs-toggle="collapse"
                  role="button"
                  aria-expanded="false"
                  aria-controls={`sidebarDashboards${main.unique_id}`}
                >
                  {main.icon_name && <i className={`nav-icon ${main.icon_name}`}></i>}
                  <span data-key="t-dashboards">{main.screen_main_name}</span>
                </a>
                <div className="collapse menu-dropdown" id={`sidebarDashboards${main.unique_id}`}>
                  <ul className={`nav nav-sm flex-column ${main.unique_id}`}>
                    {main.sub_screens.filter(sub => hasScreen(sub.unique_id)).map(sub => {
                      const path = `/${sub.folder_name}/list`;
                      const isActive = location.pathname.startsWith(`/${sub.folder_name}`);
                      return (
                        <li className={`nav-item ${isActive ? 'active' : ''}`} key={sub.unique_id}>
                          <Link to={path} className={`nav-link ${isActive ? 'active' : ''}`} data-key="t-analytics">
                            {sub.screen_name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="sidebar-background"></div>
    </div>
  );
}
