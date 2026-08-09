import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Container } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardLayout from "../components/layout/Navbar";
import Loader from "../components/common/Loader";
import CertificateView from "../components/certificate/CertificateView";
import { getCertificateById } from "../services/certificateService";

function CertificateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCertificate() {
      setLoading(true);
      setError(null);
      try {
        const cert = await getCertificateById(id);
        if (!cert) {
          setError("Certificate not found.");
        } else {
          setCertificate(cert);
        }
      } catch (err) {
        console.error("Failed to load certificate:", err);
        setError("Unable to load certificate details.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCertificate();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading official certificate..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }} className="no-print">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </Box>

      {error ? (
        <Container maxWidth="md">
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
        </Container>
      ) : (
        <CertificateView certificate={certificate} />
      )}
    </DashboardLayout>
  );
}

export default CertificateDetailPage;
