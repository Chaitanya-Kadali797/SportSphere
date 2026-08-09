import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { signIn, getAuthErrorMessage } from "../../services/authService";

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      onSuccess?.();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, sm: 4 },
        width: "100%",
        maxWidth: 420,
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" gutterBottom fontWeight={700}>
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your credentials to access your SportSphere portal.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          autoComplete="email"
          margin="normal"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          autoComplete="current-password"
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          startIcon={<LoginIcon />}
          disabled={submitting}
          sx={{ mt: 3 }}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2.5 }}>
          Don't have an account yet?{' '}
          <Link component={RouterLink} to="/register" fontWeight={700}>
            Register here
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}

export default LoginForm;

