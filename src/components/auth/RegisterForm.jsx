import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { signUp, getAuthErrorMessage } from "../../services/authService";
import { validatePlayerName } from "../../utils/nameModeration";

function RegisterForm({ onSuccess }) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Moderate Player Display Name
    const nameCheck = validatePlayerName(displayName);
    if (!nameCheck.valid) {
      setError(nameCheck.error);
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      // Immediately invoke onSuccess callback to navigate to /player/dashboard
      // ProtectedRoute will catch the unverified player and render EmailVerificationNotice automatically
      onSuccess?.();
    } catch (err) {
      console.error("Registration failed:", err);
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, sm: 4 },
        width: "100%",
        maxWidth: 440,
        borderRadius: 3,
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h5" component="h1" gutterBottom fontWeight={800} color="#0f172a">
          Create a Player Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Register as a tournament player. Email verification will be sent upon registration.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontWeight: 600 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Full Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          required
          margin="normal"
          placeholder="e.g. John Doe"
          helperText="English letters, spaces, hyphens, and apostrophes allowed"
        />

        <TextField
          label="Email Address"
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
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          startIcon={<PersonAddIcon />}
          disabled={submitting}
          sx={{
            mt: 3,
            py: 1.4,
            fontWeight: 800,
            bgcolor: "#1e3a8a",
            "&:hover": { bgcolor: "#1e40af" },
          }}
        >
          {submitting ? "Creating account..." : "Register Player Account"}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" fontWeight={700}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}

export default RegisterForm;
