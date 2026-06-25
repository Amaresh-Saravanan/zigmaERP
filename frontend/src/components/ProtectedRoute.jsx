import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Or a loading spinner matching Velzon theme
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
