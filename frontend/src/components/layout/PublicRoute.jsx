import { Navigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Already logged in, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicRoute;