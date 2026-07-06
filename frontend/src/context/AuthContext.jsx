import { createContext, useState, useEffect } from 'react';
import djangoClient, { mapDjangoUser } from '../api/djangoClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      // Django token auth: /auth/me validates the stored token → { status:1, data:user }.
      const res = await djangoClient.get('/auth/me', { suppressError: true });
      if (res.data?.status === 1) {
        const mapped = mapDjangoUser(res.data.data);
        setUser(mapped);
        localStorage.setItem('auth_user', JSON.stringify(mapped));
      } else {
        setUser(null);
        localStorage.removeItem('auth_user');
      }
    } catch {
      // ponytail: no/invalid token or backend offline → fall back to the last
      // known user (keeps demo mode and cached sessions working when :8000 is down)
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
      await djangoClient.post('/auth/logout', {}, { suppressError: true });
    } catch {
      // Ignored — clear local state regardless
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
