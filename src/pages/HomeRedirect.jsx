import { Navigate } from "react-router-dom";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME_PATHS } from "../utils/constants";

function HomeRedirect() {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <Loader message="Loading SportSphere..." />;
  }

  if (isAuthenticated && role) {
    return <Navigate to={ROLE_HOME_PATHS[role]} replace />;
  }

  return <Navigate to="/login" replace />;
}

export default HomeRedirect;
