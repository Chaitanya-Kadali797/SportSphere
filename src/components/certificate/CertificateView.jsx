import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function CertificateView({ certificate }) {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  if (!certificate) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const verifyUrl = `${origin}/verify-certificate?id=${encodeURIComponent(certificate.certificateId)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verifyUrl);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box>
      {/* Screen Action Bar (Hidden during PDF print) */}
      <Box
        className="no-print"
        sx={{
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={<VerifiedUserIcon color="success" />}
            label={`Verified Certificate: ${certificate.certificateId}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={handleShare}
          >
            Copy Verification Link
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<VerifiedUserIcon />}
            onClick={() => navigate(`/verify-certificate?id=${certificate.certificateId}`)}
          >
            Verify Online
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print / Save as PDF
          </Button>
        </Box>
      </Box>

      {/* Embedded Print CSS to force print styling */}
      <style>
        {`
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .no-print, header, nav, sidebar, footer {
              display: none !important;
            }
            #printable-certificate {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 40px !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
              border: 8px double #1e3a8a !important;
              background: #ffffff !important;
              z-index: 999999 !important;
            }
          }
        `}
      </style>

      {/* Official Certificate Paper Document */}
      <Paper
        id="printable-certificate"
        elevation={6}
        sx={{
          p: { xs: 3, sm: 5, md: 6 },
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "8px double #1e3a8a",
          borderRadius: 3,
          position: "relative",
          maxWidth: 900,
          mx: "auto",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
          overflow: "hidden",
        }}
      >
        {/* Background Decorative Gold Watermark Badge */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.04,
            pointerEvents: "none",
          }}
        >
          <WorkspacePremiumIcon sx={{ fontSize: 450, color: "#1e3a8a" }} />
        </Box>

        {/* Certificate Header Emblem */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "#eff6ff",
              border: "2px solid #1e3a8a",
              color: "#d97706",
              mb: 1.5,
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.2)",
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 38 }} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#1e3a8a",
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
            }}
          >
            SportSphere Official Management System
          </Typography>

          <Typography
            variant="h3"
            fontWeight={900}
            sx={{
              fontFamily: '"Outfit", sans-serif',
              color: "#0f172a",
              mt: 1,
              mb: 0.5,
              letterSpacing: -0.5,
            }}
          >
            Certificate of Achievement
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
            PROUDLY PRESENTED TO
          </Typography>
        </Box>

        {/* Participant Name Section */}
        <Box sx={{ textAlign: "center", my: 3.5 }}>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              fontFamily: '"Outfit", sans-serif',
              color: "#1e3a8a",
              borderBottom: "3px solid #d97706",
              display: "inline-block",
              px: 4,
              pb: 1,
              letterSpacing: -0.5,
            }}
          >
            {certificate.participantName}
          </Typography>
        </Box>

        {/* Certificate Description & Achievement Details */}
        <Box sx={{ textAlign: "center", maxWidth: 680, mx: "auto", mb: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.7 }}>
            For outstanding performance and achieving{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 800,
                color: "#d97706",
                fontSize: "1.2rem",
                textDecoration: "underline",
              }}
            >
              {certificate.achievement}
            </Box>{" "}
            in the official tournament
          </Typography>

          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ color: "#0f172a", mt: 1.5, fontFamily: '"Outfit", sans-serif' }}
          >
            {certificate.tournamentName}
          </Typography>

          <Chip
            label={`Sport Category: ${certificate.sportName}`}
            color="primary"
            size="small"
            sx={{ mt: 1.5, fontWeight: 700, px: 1.5 }}
          />
        </Box>

        {/* Certificate Footer (Signatures, QR Code, Issue Date) */}
        <Box
          sx={{
            display: "flex",
            justify: "space-between",
            alignItems: "flex-end",
            mt: 5,
            pt: 3,
            borderTop: "1px dashed #cbd5e1",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Left: Issue Date & Sign Off */}
          <Box sx={{ minWidth: 180 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block" }}>
              ISSUE DATE
            </Typography>
            <Typography variant="body1" fontWeight={700} color="#0f172a">
              {formatDate(certificate.issueDate)}
            </Typography>

            <Box sx={{ mt: 3, pt: 1, borderTop: "1.5px solid #0f172a", width: 160 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {certificate.issuedBy || "Tournament Director"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                Authorized Signature
              </Typography>
            </Box>
          </Box>

          {/* Center: Gold Medal Seal */}
          <Box sx={{ textAlign: "center", display: { xs: "none", sm: "block" } }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                boxShadow: "0 6px 16px rgba(217, 119, 6, 0.4)",
              }}
            >
              <WorkspacePremiumIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography variant="caption" fontWeight={800} color="#b45309" sx={{ display: "block", mt: 0.5 }}>
              OFFICIAL SEAL
            </Typography>
          </Box>

          {/* Right: Dynamic QR Code Verification */}
          <Box sx={{ textAlign: "right" }}>
            <Box
              component="img"
              src={qrCodeImageUrl}
              alt="Certificate Verification QR Code"
              sx={{
                width: 90,
                height: 90,
                border: "2px solid #e2e8f0",
                borderRadius: 2,
                bgcolor: "#ffffff",
                p: 0.5,
              }}
            />
            <Typography
              variant="caption"
              fontWeight={800}
              sx={{ display: "block", mt: 0.5, fontFamily: "monospace", color: "#1e3a8a" }}
            >
              ID: {certificate.certificateId}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
              Scan QR to Verify Authenticity
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Verification link copied to clipboard!"
      />
    </Box>
  );
}

export default CertificateView;
