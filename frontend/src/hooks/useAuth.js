import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Safe no-op fallback so components remain renderable in isolation (e.g. unit
// tests) without an AuthProvider — mirrors useTheme's fallback.
const FALLBACK = {
  user: null,
  loading: false,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
};

export default function useAuth() {
  return useContext(AuthContext) ?? FALLBACK;
}
