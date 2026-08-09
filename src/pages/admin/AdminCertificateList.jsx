import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getCertificates } from "../../services/certificateService";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function AdminCertificateList() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCertificates() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCertificates();
        setCertificates(data);
      } catch (err) {
        console.error("Failed to load certificates:", err);
        setError("Unable to load issued certificates. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading certificate records..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Certificate Management"
        subtitle="Issue official digital certificates to tournament winners and participants."
        action={
          <Button
            component={RouterLink}
            to="/admin/certificates/create"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Issue New Certificate
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Issued Certificates ({certificates.length})
        </Typography>
      </Box>

      {certificates.length === 0 ? (
        <Card sx={{ p: 3, textAlign: "center" }}>
          <CardContent>
            <WorkspacePremiumIcon sx={{ fontSize: 60, color: "text.secondary", mb: 1 }} />
            <Typography variant="h6" gutterBottom fontWeight={700}>
              No certificates issued yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Generate official certificates for tournament winners and participants.
            </Typography>
            <Button
              component={RouterLink}
              to="/admin/certificates/create"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Issue First Certificate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Certificate ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Participant</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tournament</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sport</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Achievement</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {certificates.map((cert) => (
                <TableRow key={cert.id} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.main" }}>
                    {cert.certificateId}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{cert.participantName}</TableCell>
                  <TableCell>{cert.tournamentName}</TableCell>
                  <TableCell>{cert.sportName}</TableCell>
                  <TableCell>
                    <Chip label={cert.achievement} size="small" color="warning" />
                  </TableCell>
                  <TableCell>{formatDate(cert.issueDate)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      title="View & Print"
                      onClick={() => navigate(`/certificates/${cert.certificateId}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      title="Verify Online"
                      onClick={() => navigate(`/verify-certificate?id=${cert.certificateId}`)}
                    >
                      <VerifiedUserIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardLayout>
  );
}

export default AdminCertificateList;
