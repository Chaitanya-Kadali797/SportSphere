import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SearchIcon from "@mui/icons-material/Search";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Loader from "../components/common/Loader";
import { getCertificateById } from "../services/certificateService";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function VerifyCertificatePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: urlParamId } = useParams();

  const queryId = searchParams.get("id") || urlParamId || "";
  const [certIdInput, setCertIdInput] = useState(queryId);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performVerification = async (targetId) => {
    if (!targetId || !targetId.trim()) return;
    setLoading(true);
    setSearched(true);
    setCertificate(null);

    try {
      const cert = await getCertificateById(targetId.trim());
      setCertificate(cert);
    } catch (err) {
      console.error("Verification error:", err);
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setCertIdInput(queryId);
      performVerification(queryId);
    }
  }, [queryId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!certIdInput.trim()) return;
    setSearchParams({ id: certIdInput.trim() });
    performVerification(certIdInput.trim());
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="md">
        {/* Header Branding */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44 }}>
              <EmojiEventsIcon />
            </Avatar>
            <Typography variant="h4" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif', color: "#0f172a" }}>
              SportSphere
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Official Certificate Authentication & Verification Portal
          </Typography>
        </Box>

        {/* Certificate Lookup Card */}
        <Card sx={{ p: { xs: 2, sm: 3 }, mb: 4, boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              Verify Certificate Authenticity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the unique Certificate ID (e.g. SP-2026-XXXXX) printed on the certificate or scanned from the QR code.
            </Typography>

            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <TextField
                fullWidth
                placeholder="e.g. SP-2026-A1B2C"
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !certIdInput.trim()}
                startIcon={<VerifiedUserIcon />}
                sx={{ px: 4, fontWeight: 700 }}
              >
                {loading ? "Verifying..." : "Verify ID"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Loading Indicator */}
        {loading && <Loader message="Verifying certificate in official records..." />}

        {/* Verification Result Display */}
        {!loading && searched && (
          <Box>
            {certificate ? (
              /* VALID CERTIFICATE RESULT */
              <Card sx={{ border: "2px solid #10b981", boxShadow: "0 10px 30px rgba(16, 185, 129, 0.12)" }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Alert
                    severity="success"
                    icon={<VerifiedUserIcon fontSize="inherit" />}
                    sx={{ mb: 3, fontWeight: 700, fontSize: "1rem" }}
                  >
                    VALID & AUTHENTIC CERTIFICATE CONFIRMED
                  </Alert>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Certificate ID
                      </Typography>
                      <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ fontFamily: "monospace" }}>
                        {certificate.certificateId}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Issue Date
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {formatDate(certificate.issueDate)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Participant Name
                      </Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif' }}>
                        {certificate.participantName}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Achievement / Honor
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={certificate.achievement}
                          color="warning"
                          sx={{ fontWeight: 800, fontSize: "0.95rem" }}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Tournament Event
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {certificate.tournamentName}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        Sport Category
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {certificate.sportName}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            ISSUED BY AUTHORIZED ORGANIZER
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {certificate.issuedBy || "SportSphere Committee"}
                          </Typography>
                        </Box>

                        <Button
                          component={RouterLink}
                          to={`/certificates/${certificate.certificateId}`}
                          variant="contained"
                          color="primary"
                          startIcon={<VisibilityIcon />}
                        >
                          View Full Certificate
                        </Button>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ) : (
              /* INVALID / UNVERIFIED RESULT */
              <Card sx={{ border: "2px solid #ef4444", boxShadow: "0 10px 30px rgba(239, 68, 68, 0.12)" }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: "center" }}>
                  <Avatar sx={{ bgcolor: "#fee2e2", color: "#ef4444", width: 64, height: 64, mx: "auto", mb: 2 }}>
                    <ReportProblemIcon sx={{ fontSize: 40 }} />
                  </Avatar>


                  <Typography variant="h5" fontWeight={800} color="error.main" gutterBottom sx={{ fontFamily: '"Outfit", sans-serif' }}>
                    Invalid or Unverified Certificate ID
                  </Typography>

                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
                    No official SportSphere record was found matching Certificate ID{" "}
                    <strong>"{certIdInput}"</strong>. Please verify the ID digits and try again.
                  </Typography>

                  <Alert severity="warning" sx={{ textAlign: "left", maxWidth: 540, mx: "auto" }}>
                    If you believe this is an error, please contact the tournament organizer or SportSphere administration for support.
                  </Alert>
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Back Navigation Footer */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button component={RouterLink} to="/login" startIcon={<ArrowBackIcon />}>
            Return to SportSphere Portal
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default VerifyCertificatePage;
