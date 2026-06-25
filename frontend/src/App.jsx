import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/Items/ItemList';
import './App.css';

// ponytail: keep simple routing structures in one file for readability and YAGNI.
export default function App() {
  const [user, setUser] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('zigma_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user session', e);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('zigma_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zigma_user');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Protected Dashboard/App Routes */}
        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/items" element={<ItemList />} />
          
          {/* Fallback routes for other menu stubs */}
          <Route
            path="/trays"
            element={
              <div className="container-fluid py-4">
                <h4 className="text-primary font-weight-bold">Tray Creation</h4>
                <p className="text-muted">Module migration in progress. (Phase 6)</p>
              </div>
            }
          />
          <Route
            path="/pits"
            element={
              <div className="container-fluid py-4">
                <h4 className="text-primary font-weight-bold">Pit Creation</h4>
                <p className="text-muted">Module migration in progress. (Phase 6)</p>
              </div>
            }
          />
          <Route
            path="/egg-process"
            element={
              <div className="container-fluid py-4">
                <h4 className="text-primary font-weight-bold">Egg Process</h4>
                <p className="text-muted">Module migration in progress. (Phase 6)</p>
              </div>
            }
          />
          <Route
            path="/screening-process"
            element={
              <div className="container-fluid py-4">
                <h4 className="text-primary font-weight-bold">Screening Process</h4>
                <p className="text-muted">Module migration in progress. (Phase 6)</p>
              </div>
            }
          />
          <Route
            path="/culling-process"
            element={
              <div className="container-fluid py-4">
                <h4 className="text-primary font-weight-bold">Culling Process</h4>
                <p className="text-muted">Module migration in progress. (Phase 6)</p>
              </div>
            }
          />
          <Route
            path="/users"
            element={
              <div className="container-fluid py-4">
                <h4 className="text-primary font-weight-bold">User Management</h4>
                <p className="text-muted">Module migration in progress. (Phase 6)</p>
              </div>
            }
          />
        </Route>

        {/* Fallback Catch-All */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
