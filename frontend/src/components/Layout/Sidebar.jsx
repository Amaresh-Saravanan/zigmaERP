import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ user }) {
  const location = useLocation();

  // Define menu items based on Zigma ERP modules
  const menuItems = [
    {
      title: 'Menu',
      isTitle: true,
    },
    {
      name: 'Dashboard',
      icon: 'ri-home-3-fill',
      path: '/dashboard',
    },
    {
      title: 'Inventory Management',
      isTitle: true,
    },
    {
      name: 'Item Creation',
      icon: 'ri-archive-line',
      path: '/items',
    },
    {
      name: 'Tray Creation',
      icon: 'ri-checkbox-multiple-blank-line',
      path: '/trays',
    },
    {
      name: 'Pit Creation',
      icon: 'ri-database-2-line',
      path: '/pits',
    },
    {
      title: 'Production Processes',
      isTitle: true,
    },
    {
      name: 'Egg Process',
      icon: 'ri-temp-hot-line',
      path: '/egg-process',
    },
    {
      name: 'Screening Process',
      icon: 'ri-filter-2-line',
      path: '/screening-process',
    },
    {
      name: 'Culling Process',
      icon: 'ri-close-circle-line',
      path: '/culling-process',
    },
    {
      title: 'Administration',
      isTitle: true,
    },
    {
      name: 'User Management',
      icon: 'ri-user-settings-line',
      path: '/users',
    },
  ];

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box mt-2 pb-2">
        <Link to="/dashboard" className="logo logo-dark">
          <span className="logo-sm">
            <h4 className="text-primary mt-3">Z</h4>
          </span>
          <span className="logo-lg">
            <h4 className="text-primary mt-3 font-weight-bold">Zigma ERP</h4>
          </span>
        </Link>
      </div>

      <div id="scrollbar" style={{ overflowY: 'auto', height: 'calc(100% - 70px)' }}>
        <div className="container-fluid">
          <ul className="navbar-nav" id="navbar-nav">
            {menuItems.map((item, idx) => {
              if (item.isTitle) {
                return (
                  <li key={idx} className="menu-title">
                    <span>{item.title}</span>
                  </li>
                );
              }

              const isActive = location.pathname === item.path;

              return (
                <li key={idx} className="nav-item">
                  <Link
                    to={item.path}
                    className={`nav-link menu-link ${isActive ? 'active' : ''}`}
                  >
                    <i className={item.icon}></i> <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="sidebar-background"></div>
    </div>
  );
}
