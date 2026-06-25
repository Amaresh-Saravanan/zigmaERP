import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout({ user, onLogout }) {
  // If not authenticated, redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div id="layout-wrapper">
      <Header user={user} onLogout={onLogout} />
      <Sidebar user={user} />
      
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
