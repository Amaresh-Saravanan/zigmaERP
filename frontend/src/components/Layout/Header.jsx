import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    document.body.classList.toggle('vertical-sidebar-enable');
    const size = document.documentElement.getAttribute('data-sidebar-size');
    document.documentElement.setAttribute('data-sidebar-size', size === 'sm' ? 'lg' : 'sm');
  };

  return (
    <header id="page-topbar">
      <div className="layout-width">
        <div className="navbar-header">
          <div className="d-flex">
            <div className="navbar-brand-box horizontal-logo">
              <Link to="/" className="logo logo-dark">
                <span className="logo-sm">
                  <img src="/assets/images/zig-fly-logo.png" alt="" height="62" />
                </span>
                <span className="logo-lg">
                  <img src="/assets/images/zig-fly-logo.png" alt="" height="47" />
                </span>
              </Link>
            </div>
            <button
              onClick={toggleSidebar}
              type="button"
              className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger material-shadow-none"
              id="topnav-hamburger-icon"
            >
              <span className="hamburger-icon">
                <span></span><span></span><span></span>
              </span>
            </button>
          </div>

          <div className="d-flex align-items-center">
            <div className="dropdown ms-sm-3 header-item topbar-user">
              <button
                type="button"
                className="btn material-shadow-none"
                id="page-header-user-dropdown"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span className="d-flex align-items-center">
                  <span style={{ width: '50px', height: '16px' }} className="ri-user-fill header-profile-user"></span>
                  <span className="text-start ms-xl-2">
                    <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                      {user?.userName || 'User'}
                    </span>
                    <span className="d-none d-xl-block ms-1 fs-12 user-name-sub-text">
                      Role
                    </span>
                  </span>
                </span>
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <h6 className="dropdown-header">Welcome {user?.userName || 'User'}!</h6>
                <button className="dropdown-item" onClick={logout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
                  <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
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
