import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  checkAndUpdateEmailVerification,
  resendVerificationEmail,
  signOut,
} from "../../services/authService";

function maskEmail(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return email || "your registered email";
  }
  const [name, domain] = email.split("@");
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  const maskedName = `${name[0]}${"*".repeat(Math.min(name.length - 2, 4))}${name[name.length - 1]}`;
  return `${maskedName}@${domain}`;
}

function EmailVerificationNotice({ user, onVerified }) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const masked = maskEmail(user?.email);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleCheckStatus = async () => {
    setChecking(true);
    setInfoMessage("");
    setErrorMessage("");

    try {
      const isVerified = await checkAndUpdateEmailVerification(user);
      if (isVerified) {
        setInfoMessage("Email verified successfully! Loading your dashboard...");
        setTimeout(() => {
          onVerified?.();
          window.location.reload();
        }, 1000);
      } else {
        setErrorMessage("Email is not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err) {
      console.error("Error checking verification status:", err);
      setErrorMessage("Unable to verify status right now. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setInfoMessage("");
    setErrorMessage("");

    try {
      await resendVerificationEmail(user);
      setInfoMessage(`Verification email sent to ${masked}. Please check your inbox and spam folder.`);
      setTimer(60);
    } catch (err) {
      console.error("Error resending verification email:", err);
      if (err.code === "auth/too-many-requests") {
        setErrorMessage("Too many requests. Please wait a few minutes before resending.");
      } else {
        setErrorMessage("Failed to resend verification email. Please try again.");
      }
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            bgcolor: "#e0f2fe",
            color: "#0284c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <MarkEmailReadIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h5" fontWeight={800} color="#0f172a" gutterBottom>
          Verify Your Email Address
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please verify your email address to continue using SportSphere.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
            Verification link sent to:
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} color="#1e3a8a">
            {masked}
          </Typography>
        </Paper>

        {/* Noticeable, non-alarming Spam/Junk folder reminder note */}
        <Box
          sx={{
            p: 1.8,
            mb: 3,
            bgcolor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: 2,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.2,
            textAlign: "left",
          }}
        >
          <InfoOutlinedIcon sx={{ color: "#0284c7", fontSize: "1.25rem", mt: 0.2 }} />
          <Typography variant="body2" color="#0369a1" fontWeight={500} sx={{ fontSize: "0.875rem", lineHeight: 1.45 }}>
            Please check your <strong>Spam</strong> or <strong>Junk</strong> folder if you don't see the verification email in your inbox.
          </Typography>
        </Box>

        {infoMessage && (
          <Alert severity="success" sx={{ mb: 2, fontWeight: 600 }}>
            {infoMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="warning" sx={{ mb: 2, fontWeight: 600 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={handleCheckStatus}
            disabled={checking}
            sx={{
              py: 1.3,
              fontWeight: 800,
              bgcolor: "#1e3a8a",
              "&:hover": { bgcolor: "#1e40af" },
            }}
          >
            {checking ? "Checking Status..." : "Check / Refresh Verification Status"}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<SendIcon />}
            onClick={handleResendEmail}
            disabled={resending || timer > 0}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            {resending
              ? "Resending..."
              : timer > 0
              ? `Resend Email (${timer}s)`
              : "Resend Verification Email"}
          </Button>

          <Button
            variant="text"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ fontWeight: 700 }}
          >
            Log Out / Switch Account
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EmailVerificationNotice;
