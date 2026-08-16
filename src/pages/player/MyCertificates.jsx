import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getUserCertificates } from "../../services/certificateService";
import { downloadCertificatePDF } from "../../utils/pdfGenerator";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function MyCertificates() {
  const { userProfile } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCertificates() {
      if (!userProfile) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getUserCertificates(
          userProfile.uid,
          userProfile.email,
          userProfile.displayName
        );
        setCertificates(data);
      } catch (err) {
        console.error("Failed to load user certificates:", err);
        setError("Unable to load your certificates. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, [userProfile]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your earned certificates..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="My Certificates"
        subtitle="View, print, and download official tournament certificates issued to your account."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {certificates.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <CardContent>
            <WorkspacePremiumIcon sx={{ fontSize: 64, color: "text.secondary", mb: 1.5 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No certificates issued yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Participate in tournaments and achieve placements to earn official SportSphere digital certificates.
            </Typography>
            <Button component={RouterLink} to="/tournaments" variant="contained">
              Explore Active Tournaments
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {certificates.map((cert) => (
            <Grid item xs={12} md={6} key={cert.id}>
              <Card className="hover-lift" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5, alignItems: "center" }}>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 800, color: "primary.main" }}>
                      ID: {cert.certificateId}
                    </Typography>
                    <Chip
                      label={cert.achievement}
                      color={
                        cert.achievement?.includes("Winner")
                          ? "warning"
                          : cert.achievement?.includes("Runner")
                          ? "secondary"
                          : "primary"
                      }
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>

                  <Typography variant="h6" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif', mb: 1 }}>
                    {cert.tournamentName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    🏆 Recipient: <strong>{cert.participantName}</strong>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    ⚽ Sport: <strong>{cert.sportName || cert.sport}</strong>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    📅 Date Issued: {formatDate(cert.issueDate || cert.issuedAt)}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1.5, mt: "auto", flexWrap: "wrap" }}>
                    <Button
                      component={RouterLink}
                      to={`/certificates/${cert.certificateId}`}
                      variant="contained"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      sx={{ flexGrow: 1 }}
                    >
                      View & Print
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadCertificatePDF(cert)}
                    >
                      Download PDF
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardLayout>
  );
}

export default MyCertificates;
