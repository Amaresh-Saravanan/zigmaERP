import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}
