import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { auth, loading } = useAuth();

  if (loading) {
    return <div className="screen-center">Loading your workspace...</div>;
  }

  if (!auth?.token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
