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
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getUserCertificates } from "../../services/certificateService";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
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
        subtitle="View and download your official tournament certificates and honors."
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
              No certificates earned yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Participate in tournaments and achieve top placements to earn verifiable SportSphere digital certificates.
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
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "monospace", fontWeight: 800, color: "primary.main" }}>
                      ID: {cert.certificateId}
                    </Typography>
                    <Chip label={cert.achievement} color="warning" size="small" sx={{ fontWeight: 800 }} />
                  </Box>

                  <Typography variant="h6" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif', mb: 1 }}>
                    {cert.tournamentName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    🏆 Participant: <strong>{cert.participantName}</strong>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    ⚽ Sport: {cert.sportName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    📅 Date Issued: {formatDate(cert.issueDate)}
                  </Typography>

                  <Button
                    component={RouterLink}
                    to={`/certificates/${cert.certificateId}`}
                    variant="contained"
                    fullWidth
                    startIcon={<VisibilityIcon />}
                    sx={{ mt: "auto" }}
                  >
                    View & Print Certificate
                  </Button>
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
