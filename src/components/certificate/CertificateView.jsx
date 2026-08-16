import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { downloadCertificatePDF } from "../../utils/pdfGenerator";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

function CertificateView({ certificate }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  if (!certificate) return null;

  const PRODUCTION_BASE_URL = "https://sportsphere-81746.web.app";
  const verifyUrl = `${PRODUCTION_BASE_URL}/certificates/${encodeURIComponent(certificate.certificateId)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}&color=6b091f`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    await downloadCertificatePDF(certificate);
    setSnackbarOpen(true);
  };

  const tournamentDateFormatted = formatDate(certificate.tournamentDate || certificate.issueDate);
  const issueDateFormatted = formatDate(certificate.issueDate || certificate.issuedAt);

  return (
    <Box>
      {/* Screen Action Bar (Hidden during printing) */}
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
            icon={<WorkspacePremiumIcon sx={{ color: "#d4af37 !important" }} />}
            label={`Certificate ID: ${certificate.certificateId}`}
            sx={{
              fontWeight: 800,
              bgcolor: "#6b091f",
              color: "#ffffff",
              border: "1px solid #d4af37",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={handleDownloadPDF}
            startIcon={<DownloadIcon />}
            sx={{
              bgcolor: "#6b091f",
              color: "#ffffff",
              fontWeight: 700,
              border: "1px solid #d4af37",
              "&:hover": { bgcolor: "#580c1e" },
            }}
          >
            Download PDF
          </Button>

          <Button
            variant="outlined"
            onClick={handlePrint}
            startIcon={<PrintIcon />}
            sx={{
              borderColor: "#6b091f",
              color: "#6b091f",
              fontWeight: 700,
              "&:hover": { borderColor: "#580c1e", bgcolor: "rgba(107, 9, 31, 0.04)" },
            }}
          >
            Print Certificate
          </Button>
        </Box>
      </Box>

      {/* Embedded Print CSS to force A4 Landscape printing */}
      <style>
        {`
          @media print {
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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
              padding: 24px !important;
              box-sizing: border-box !important;
              box-shadow: none !important;
              background: #faf7f2 !important;
              z-index: 999999 !important;
            }
          }
        `}
      </style>

      {/* Official Premium Certificate Paper Document */}
      <Paper
        id="printable-certificate"
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4, md: 5 },
          background: "linear-gradient(135deg, #fdfcf9 0%, #faf6f0 50%, #f7f1e7 100%)",
          position: "relative",
          maxWidth: 960,
          mx: "auto",
          boxShadow: "0 15px 40px rgba(88, 12, 30, 0.15)",
          overflow: "hidden",
          borderRadius: 2,
          color: "#1e293b",
        }}
      >
        {/* Deep Maroon & Gold Double Border Frame */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            border: "4px solid #6b091f",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 18,
            left: 18,
            right: 18,
            bottom: 18,
            border: "2px solid #d4af37",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 22,
            left: 22,
            right: 22,
            bottom: 22,
            border: "1px dashed rgba(107, 9, 31, 0.25)",
            pointerEvents: "none",
          }}
        />

        {/* Refined Ornamental Corner Accents */}
        {[
          { top: 12, left: 12 },
          { top: 12, right: 12 },
          { bottom: 12, left: 12 },
          { bottom: 12, right: 12 },
        ].map((pos, idx) => (
          <Box
            key={idx}
            sx={{
              position: "absolute",
              width: 24,
              height: 24,
              bgcolor: "#6b091f",
              border: "2px solid #d4af37",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              ...pos,
            }}
          >
            <Box sx={{ width: 8, height: 8, bgcolor: "#d4af37", transform: "rotate(45deg)" }} />
          </Box>
        ))}

        {/* Background Watermark Emblem */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.035,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <EmojiEventsIcon sx={{ fontSize: 480, color: "#6b091f" }} />
        </Box>

        {/* Inner Content Area */}
        <Box sx={{ position: "relative", zIndex: 1, px: { xs: 1, sm: 3 }, py: 1 }}>
          
          {/* Header - SportSphere Branding */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <EmojiEventsIcon sx={{ color: "#d4af37", fontSize: 28 }} />
              <Typography
                variant="h6"
                sx={{
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#6b091f",
                  fontWeight: 900,
                  fontFamily: '"Cinzel", "Outfit", serif',
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                }}
              >
                SPORT SPHERE
              </Typography>
              <EmojiEventsIcon sx={{ color: "#d4af37", fontSize: 28 }} />
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#78350f",
                fontWeight: 700,
                fontSize: "0.72rem",
              }}
            >
              Official Sports Tournament Management Organization
            </Typography>
          </Box>

          {/* Certificate Main Title */}
          <Box sx={{ textAlign: "center", mb: 2.5 }}>
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                fontFamily: '"Cinzel", serif',
                color: "#6b091f",
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: { xs: "1.6rem", sm: "2.3rem", md: "2.6rem" },
                textShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              Certificate of Achievement
            </Typography>
            <Box
              sx={{
                width: 140,
                height: 2,
                background: "linear-gradient(90deg, transparent, #d4af37, #6b091f, #d4af37, transparent)",
                mx: "auto",
                mt: 1,
                mb: 1.5,
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#475569",
                fontWeight: 700,
                fontSize: "0.82rem",
              }}
            >
              PROUDLY PRESENTED TO
            </Typography>
          </Box>

          {/* Participant Name Section */}
          <Box sx={{ textAlign: "center", my: 2 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: '"Playfair Display", "Outfit", serif',
                fontWeight: 800,
                fontStyle: "italic",
                color: "#6b091f",
                display: "inline-block",
                px: 3,
                py: 0.5,
                fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                wordBreak: "break-word",
              }}
            >
              {certificate.participantName}
            </Typography>
            <Box
              sx={{
                width: "60%",
                maxWidth: 420,
                height: 2,
                bgcolor: "#d4af37",
                mx: "auto",
                mt: 0.5,
              }}
            />
          </Box>

          {/* Achievement Description & Details */}
          <Box sx={{ textAlign: "center", maxWidth: 720, mx: "auto", my: 2.5 }}>
            <Typography variant="body1" sx={{ color: "#334155", fontSize: { xs: "0.95rem", sm: "1.1rem" }, lineHeight: 1.6 }}>
              For outstanding athletic performance and securing{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 800,
                  color: "#6b091f",
                  bgcolor: "rgba(212, 175, 55, 0.15)",
                  px: 1.5,
                  py: 0.3,
                  borderRadius: 1,
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  display: "inline-block",
                  mx: 0.5,
                }}
              >
                🏆 {certificate.achievement}
              </Box>{" "}
              in the official tournament event
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                color: "#0f172a",
                mt: 1.5,
                fontFamily: '"Cinzel", "Outfit", serif',
                fontSize: { xs: "1.1rem", sm: "1.4rem" },
              }}
            >
              {certificate.tournamentName}
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ color: "#6b091f", mt: 0.8, textTransform: "uppercase", letterSpacing: 1 }}
            >
              Sport Category: {certificate.sportName || certificate.sport || "General Sport"}
            </Typography>
          </Box>

          {/* Bottom Section: QR Code, Circular Seal, Signature & Dates */}
          <Box
            sx={{
              display: "flex",
              justify: "space-between",
              alignItems: "flex-end",
              mt: 3,
              pt: 2,
              borderTop: "1px solid rgba(212, 175, 55, 0.4)",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {/* Left Column: Dates & Scannable QR Code */}
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2.5 }}>
              {/* Functional Verification QR Code */}
              <Box sx={{ textAlign: "center" }}>
                <Box
                  component="img"
                  src={qrCodeImageUrl}
                  alt="Certificate Verification QR Code"
                  sx={{
                    width: 76,
                    height: 76,
                    border: "2px solid #d4af37",
                    borderRadius: 1.5,
                    bgcolor: "#ffffff",
                    p: 0.5,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 0.5, fontWeight: 800, fontSize: "0.65rem", letterSpacing: 1, color: "#6b091f" }}
                >
                  SCAN TO VERIFY
                </Typography>
              </Box>

              {/* Tournament & Issue Dates */}
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, display: "block", fontSize: "0.68rem" }}>
                  TOURNAMENT DATE
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1 }}>
                  {tournamentDateFormatted}
                </Typography>

                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, display: "block", fontSize: "0.68rem" }}>
                  ISSUE DATE
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#0f172a">
                  {issueDateFormatted}
                </Typography>
              </Box>
            </Box>

            {/* Center Column: Premium Circular SportSphere Seal */}
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  position: "relative",
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #fef08a 0%, #d4af37 60%, #b8860b 100%)",
                  border: "3px solid #6b091f",
                  color: "#6b091f",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  boxShadow: "0 4px 15px rgba(184, 134, 11, 0.4)",
                  p: 1,
                }}
              >
                {/* Inner Decorative Ring */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 4,
                    borderRadius: "50%",
                    border: "1px dashed #6b091f",
                    pointerEvents: "none",
                  }}
                />
                
                <Typography
                  sx={{
                    fontSize: "0.55rem",
                    fontWeight: 900,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    fontFamily: '"Cinzel", serif',
                    lineHeight: 1,
                  }}
                >
                  SPORTSPHERE
                </Typography>
                
                <EmojiEventsIcon sx={{ fontSize: 26, my: 0.2, color: "#6b091f" }} />

                <Typography
                  sx={{
                    fontSize: "0.52rem",
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    fontFamily: '"Cinzel", serif',
                    lineHeight: 1,
                  }}
                >
                  SINCE 2007
                </Typography>
              </Box>
            </Box>

            {/* Right Column: Dual Independent Authorized Signature Blocks */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: { xs: 2, sm: 3.5 },
                textAlign: "center",
                transform: { xs: "none", sm: "translateX(42px)" },
              }}
            >
              {/* Primary Signature Block: Kadali Chaitanya */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: '"Great Vibes", cursive',
                    fontSize: "1.6rem",
                    color: "#6b091f",
                    lineHeight: 1,
                    mb: -0.3,
                    transform: "rotate(-3deg)",
                    display: "block",
                    whiteSpace: "nowrap",
                  }}
                >
                  Kadali Chaitanya
                </Typography>

                <Box sx={{ borderTop: "1.5px solid #6b091f", pt: 0.5, width: 135, mt: 0.5, mx: "auto" }}>
                  <Typography variant="body2" fontWeight={900} sx={{ color: "#0f172a", letterSpacing: 0.5, fontSize: "0.78rem" }}>
                    KADALI CHAITANYA
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, letterSpacing: 0.8, display: "block", fontSize: "0.65rem" }}>
                    AUTHORIZED SIGNATORY
                  </Typography>
                </Box>
              </Box>

              {/* Secondary Signature Block: Magnus Carlsen */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: '"Great Vibes", cursive',
                    fontSize: "1.6rem",
                    color: "#6b091f",
                    lineHeight: 1,
                    mb: -0.3,
                    transform: "rotate(-2deg)",
                    display: "block",
                    whiteSpace: "nowrap",
                  }}
                >
                  Magnus Carlsen
                </Typography>

                <Box sx={{ borderTop: "1.5px solid #6b091f", pt: 0.5, width: 125, mt: 0.5, mx: "auto" }}>
                  <Typography variant="body2" fontWeight={900} sx={{ color: "#0f172a", letterSpacing: 0.5, fontSize: "0.78rem" }}>
                    MAGNUS CARLSEN
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800, letterSpacing: 0.8, display: "block", fontSize: "0.65rem" }}>
                    SUB ORGANIZER
                  </Typography>
                </Box>
              </Box>
            </Box>

          </Box>

          {/* Certificate Footer Meta: ID & Digital Authenticity Statement */}
          <Box
            sx={{
              display: "flex",
              justify: "space-between",
              alignItems: "center",
              mt: 2,
              pt: 1,
              borderTop: "1px solid rgba(107, 9, 31, 0.1)",
              fontSize: "0.7rem",
              color: "#64748b",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: "monospace", color: "#6b091f" }}>
              UNIQUE CERTIFICATE ID: {certificate.certificateId}
            </Typography>

            <Typography variant="caption" sx={{ fontStyle: "italic", fontSize: "0.68rem", color: "#64748b" }}>
              This official certificate is digitally encrypted & authenticated by SportSphere Management System.
            </Typography>
          </Box>

        </Box>
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="PDF certificate generated and downloaded successfully!"
      />
    </Box>
  );
}

export default CertificateView;
