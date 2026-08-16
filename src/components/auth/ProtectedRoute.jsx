import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, ROLE_HOME_PATHS } from "../../utils/constants";
import Loader from "../common/Loader";
import EmailVerificationNotice from "./EmailVerificationNotice";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading, role, userProfile, profileError } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message="Checking your session..." />;
  }

  if (profileError || (role === ROLES.ADMIN && userProfile?.active === false)) {
    return (
      <Navigate
        to="/login"
        state={{
          profileError: profileError || "Your Admin account has been deactivated. Please contact the Super Admin.",
        }}
        replace
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Super Admin has access to all Admin allowed routes
  const effectiveAllowedRoles = [...allowedRoles];
  if (allowedRoles.includes(ROLES.ADMIN) && !effectiveAllowedRoles.includes(ROLES.SUPER_ADMIN)) {
    effectiveAllowedRoles.push(ROLES.SUPER_ADMIN);
  }

  if (effectiveAllowedRoles.length > 0 && !effectiveAllowedRoles.includes(role)) {
    const homePath = ROLE_HOME_PATHS[role] || "/login";
    return <Navigate to={homePath} replace />;
  }

  // EMAIL VERIFICATION GUARD: APPLIES ONLY TO PLAYER ACCOUNTS
  // Super Admin (Chaitanya) and Admin accounts bypass email verification completely.
  if (role === ROLES.PLAYER && user && !user.emailVerified) {
    return <EmailVerificationNotice user={user} />;
  }

  return children;
}

export default ProtectedRoute;
