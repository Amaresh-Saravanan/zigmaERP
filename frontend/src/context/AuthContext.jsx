import { createContext, useState, useEffect } from 'react';
import client from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const res = await client.get('folders/login/session.php');
      if (res.data?.isAuthenticated) {
        setUser(res.data.user);
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      } else {
        setUser(null);
        localStorage.removeItem('auth_user');
      }
    } catch {
      // ponytail: fallback to localStorage if backend is offline/502
      try {
        const saved = localStorage.getItem('auth_user');
        setUser(saved ? JSON.parse(saved) : null);
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('auth_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await client.post('logout.php', 'logout=true');
    } catch {
      // Ignored
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('django_token');
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
