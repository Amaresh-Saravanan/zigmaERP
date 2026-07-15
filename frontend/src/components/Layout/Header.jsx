import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import zigFlyLogo from '../../assets/images/zig-fly-logo.png';

// Derive initials from a display name ("John Doe" → "JD", "admin" → "A")
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ponytail: sidebarOpen only drives the mobile overlay + hamburger icon animation.
  // On desktop the Sidebar can flip data-sidebar-size back to 'lg' on its own (icon
  // click expand), so this state can drift from the actual attribute there — harmless,
  // since desktop rendering reads the attribute, not this state.
  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    if (window.innerWidth < 992) {
      // mobile: overlay show/hide only — always full-width menu, never icon rail
      document.body.classList.toggle('vertical-sidebar-enable', next);
      document.documentElement.setAttribute('data-sidebar-size', 'lg');
    } else {
      // desktop: collapse/expand the fixed rail
      const size = document.documentElement.getAttribute('data-sidebar-size');
      document.documentElement.setAttribute('data-sidebar-size', size === 'sm' ? 'lg' : 'sm');
    }
  };

  const initials = getInitials(user?.userName);

  return (
    <header id="page-topbar">
      <div className="layout-width">
        <div className="navbar-header">

          {/* ── Left: hamburger + logo ── */}
          <div className="d-flex align-items-center gap-2">
            

            {/* Hamburger — animated 3-bar → X */}
            <button
              onClick={toggleSidebar}
              type="button"
              className="btn btn-sm px-2 header-item vertical-menu-btn topnav-hamburger material-shadow-none"
              id="topnav-hamburger-icon"
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={sidebarOpen}
            >
              <span className={`hamburger-icon${sidebarOpen ? ' open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>

          {/* ── Right: theme toggle, bell, user ── */}
          <div className="d-flex align-items-center gap-1">

            {/* Theme toggle */}
            <button
              type="button"
              className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle light-dark-mode"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <i className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} fs-20`} aria-hidden="true"></i>
            </button>

            {/* Notification bell */}
            <button
              type="button"
              className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle position-relative"
              aria-label="Notifications"
              title="Notifications"
            >
              <i className="ri-notification-3-line fs-20" aria-hidden="true"></i>
              {/* Green dot indicator */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', top: 7, right: 7,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#25a96b',
                  border: '2px solid var(--vz-header-bg, #161b22)',
                }}
              ></span>
            </button>

            {/* User dropdown (U-09 — initials avatar) */}
            <div className="dropdown ms-1" ref={dropdownRef}>
              <button
                type="button"
                className="btn d-flex align-items-center gap-2 px-2 topbar-user material-shadow-none"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen(o => !o)}
              >
                {/* Avatar initials badge */}
                <span
                  className="avatar-initials"
                  aria-hidden="true"
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(37,169,107,0.15)',
                    border: '1.5px solid rgba(37,169,107,0.4)',
                    color: '#25a96b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: '0.75rem', fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials || <i className="ri-user-line" style={{ fontSize: '1rem' }}></i>}
                </span>

                <span className="d-none d-lg-flex flex-column align-items-start" style={{ lineHeight: 1.2 }}>
                  <span className="fw-medium" style={{ fontSize: '0.82rem', color: 'var(--vz-emphasis-color)' }}>
                    {user?.userName || 'User'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--vz-secondary-color)' }}>
                    {user?.role || 'Role'}
                  </span>
                </span>

                <i className={`ri-arrow-down-s-line d-none d-lg-block ${dropdownOpen ? 'rotate-180' : ''}`}
                   style={{ transition: 'transform 0.2s', color: 'var(--vz-header-item-sub-color)', fontSize: '1rem' }}
                ></i>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end shadow show"
                  style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', minWidth: 180 }}
                >
                  <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--vz-border-color)' }}>
                    <p className="mb-0 fw-semibold" style={{ fontSize: '0.82rem', color: 'var(--vz-emphasis-color)' }}>
                      {user?.userName || 'User'}
                    </p>
                    <p className="mb-0" style={{ fontSize: '0.72rem', color: 'var(--vz-secondary-color)' }}>
                      {user?.role || 'Role'}
                    </p>
                  </div>
                  <button
                    className="dropdown-item d-flex align-items-center gap-2 mt-1"
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', fontSize: '0.85rem' }}
                  >
                    <i className="ri-logout-box-r-line text-danger" style={{ fontSize: '1rem' }}></i>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay (U-11) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={toggleSidebar}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 999,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
    </header>
  );
}
