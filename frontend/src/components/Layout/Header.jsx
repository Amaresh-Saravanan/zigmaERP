import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import zigFlyLogo from '../../assets/images/zig-fly-logo.png';

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    document.body.classList.toggle('vertical-sidebar-enable');
    const size = document.documentElement.getAttribute('data-sidebar-size');
    document.documentElement.setAttribute('data-sidebar-size', size === 'sm' ? 'lg' : 'sm');
  };

  const sidebarEnabled = document.body.classList.contains('vertical-sidebar-enable');

  return (
    <header id="page-topbar">
      <div className="layout-width">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box horizontal-logo">
              <Link to="/" className="logo logo-dark" aria-label="Zigfly home">
                <span className="logo-sm">
                  <img src={zigFlyLogo} alt="" height="62" aria-hidden="true" />
                </span>
                <span className="logo-lg">
                  <img src={zigFlyLogo} alt="" height="47" aria-hidden="true" />
                </span>
              </Link>
            </div>
            <button
              onClick={toggleSidebar}
              type="button"
              className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger material-shadow-none"
              id="topnav-hamburger-icon"
              aria-label="Toggle navigation"
            >
              <i className="ri-arrow-right-line fs-22" aria-hidden="true"></i>
            </button>
            {sidebarEnabled && (
              <div
                className="sidebar-overlay"
                onClick={toggleSidebar}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 999,
                  display: window.innerWidth < 992 ? 'block' : 'none'
                }}
              />
            )}
          </div>

          <div className="d-flex align-items-center">
            <div className="ms-1 header-item d-none d-sm-flex">
              <button
                type="button"
                className="btn btn-icon btn-topbar material-shadow-none btn-ghost-secondary rounded-circle light-dark-mode"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <i
                  className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} fs-22`}
                  aria-hidden="true"
                ></i>
              </button>
            </div>

            <div className="dropdown ms-sm-3 header-item topbar-user">
              <button
                type="button"
                className={`btn material-shadow-none ${isDropdownOpen ? 'show' : ''}`}
                id="page-header-user-dropdown"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="d-flex align-items-center">
                  <span style={{ width: '50px', height: '16px' }} className="ri-user-fill header-profile-user"></span>
                  <span className="text-start ms-xl-2">
                    <span className="d-none d-lg-inline-block ms-1 fw-medium user-name-text">
                      {user?.userName || 'User'}
                    </span>
                    <span className="d-none d-lg-block ms-1 fs-12 user-name-sub-text">
                      {user?.role || 'Role'}
                    </span>
                  </span>
                </span>
              </button>
              <div className={`dropdown-menu dropdown-menu-end shadow ${isDropdownOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0, top: '100%' }}>
                <h6 className="dropdown-header text-muted fs-12">Welcome {user?.userName || 'User'}!</h6>
                <button className="dropdown-item" onClick={logout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
                  <i className="ri-logout-box-r-line text-muted fs-16 align-middle me-1"></i>
                  <span className="align-middle" data-key="t-logout">Logout</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
