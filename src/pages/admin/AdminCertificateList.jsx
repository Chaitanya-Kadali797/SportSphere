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
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getCertificates } from "../../services/certificateService";
import { downloadCertificatePDF } from "../../utils/pdfGenerator";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

function AdminCertificateList() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredCertificates = certificates.filter((cert) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      cert.certificateId?.toLowerCase().includes(q) ||
      cert.participantName?.toLowerCase().includes(q) ||
      cert.tournamentName?.toLowerCase().includes(q) ||
      cert.sportName?.toLowerCase().includes(q) ||
      cert.achievement?.toLowerCase().includes(q)
    );
  });

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
        subtitle="Generate, manage, print, and download digital certificates for tournament winners and participants."
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

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Issued Certificates ({filteredCertificates.length})
        </Typography>

        <TextField
          size="small"
          placeholder="Search by ID, Participant, Tournament..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {certificates.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <CardContent>
            <WorkspacePremiumIcon sx={{ fontSize: 64, color: "text.secondary", mb: 1.5 }} />
            <Typography variant="h6" gutterBottom fontWeight={700}>
              No certificates issued yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Generate official SportSphere digital certificates for tournament winners and participants.
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
      ) : filteredCertificates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            No certificates found matching "{searchQuery}".
          </Typography>
        </Paper>
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
              {filteredCertificates.map((cert) => (
                <TableRow key={cert.id} hover>
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 800, color: "primary.main" }}>
                    {cert.certificateId}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{cert.participantName}</TableCell>
                  <TableCell>{cert.tournamentName}</TableCell>
                  <TableCell>{cert.sportName || cert.sport}</TableCell>
                  <TableCell>
                    <Chip
                      label={cert.achievement}
                      size="small"
                      color={
                        cert.achievement?.includes("Winner")
                          ? "warning"
                          : cert.achievement?.includes("Runner")
                          ? "secondary"
                          : cert.achievement?.includes("3rd")
                          ? "info"
                          : "default"
                      }
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(cert.issueDate || cert.issuedAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      title="View & Preview"
                      onClick={() => navigate(`/certificates/${cert.certificateId}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      title="Download PDF"
                      onClick={() => downloadCertificatePDF(cert)}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="info"
                      title="Print Certificate"
                      onClick={() => navigate(`/certificates/${cert.certificateId}`)}
                    >
                      <PrintIcon fontSize="small" />
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
