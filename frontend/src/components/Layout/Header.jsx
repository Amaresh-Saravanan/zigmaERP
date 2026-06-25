import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <header id="page-topbar">
      <div className="layout-width">
        <div className="navbar-header">
          <div className="d-flex">
            {/* Horizontal LOGO placeholder */}
            <div className="navbar-brand-box horizontal-logo">
              <a href="/" className="logo logo-dark">
                <span className="logo-lg">
                  <h4 className="mt-4 text-primary font-weight-bold">Zigma ERP</h4>
                </span>
              </a>
            </div>
            <button
              type="button"
              className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger material-shadow-none"
              id="topnav-hamburger-icon"
            >
              <span className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
          
          <div className="d-flex align-items-center">
            {user && (
              <div className="dropdown ms-sm-3 header-item topbar-user">
                <button
                  type="button"
                  className="btn material-shadow-none d-flex align-items-center"
                  id="page-header-user-dropdown"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span className="ri-user-fill header-profile-user fs-20 me-2"></span>
                  <span className="text-start ms-xl-2">
                    <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                      {user.userName || 'User'}
                    </span>
                    <span className="d-none d-xl-block ms-1 fs-12 user-name-sub-text">
                      {user.roleName || 'Operator'}
                    </span>
                  </span>
                </button>
                <div className="dropdown-menu dropdown-menu-end">
                  <h6 className="dropdown-header">Welcome {user.userName}!</h6>
                  <button className="dropdown-item btn-link text-start w-100" onClick={handleLogoutClick}>
                    <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{' '}
                    <span className="align-middle">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
