import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_HOME_PATHS } from "../../utils/constants";
import Loader from "../common/Loader";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, loading, role, profileError } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (profileError && !role) {
    return <Navigate to="/login" state={{ profileError }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const homePath = ROLE_HOME_PATHS[role] || "/login";
    return <Navigate to={homePath} replace />;
  }

  return children;
}

export default ProtectedRoute;
