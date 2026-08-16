import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_HOME_PATHS } from "../../utils/constants";

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, role } = useAuth();

  const redirectPath = location.state?.from;

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      const homePath = redirectPath || ROLE_HOME_PATHS[role];
      navigate(homePath, { replace: true });
    }
  }, [loading, isAuthenticated, role, redirectPath, navigate]);

  if (!loading && isAuthenticated && role) {
    return <Navigate to={redirectPath || ROLE_HOME_PATHS[role]} replace />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
          SportSphere
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Register to browse active tournaments and manage your student profile.
        </Typography>
      </Box>

      <RegisterForm onSuccess={() => navigate("/player/dashboard", { replace: true })} />
    </Box>
  );
}

export default RegisterPage;
