import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";

function RegisterPage() {
  const navigate = useNavigate();

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
