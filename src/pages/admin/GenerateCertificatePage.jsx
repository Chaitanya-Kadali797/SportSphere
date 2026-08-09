import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import { getTournaments } from "../../services/tournamentService";
import { createCertificate, generateUniqueCertId } from "../../services/certificateService";

const ACHIEVEMENTS = [
  "1st Place (Winner)",
  "2nd Place (Runner-up)",
  "3rd Place",
  "Participation Certificate",
  "Best Player / MVP",
  "Sportsmanship Award",
];

function GenerateCertificatePage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");

  const [certificateId, setCertificateId] = useState(generateUniqueCertId());
  const [participantName, setParticipantName] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [sportName, setSportName] = useState("");
  const [achievement, setAchievement] = useState("1st Place (Winner)");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [issuedBy, setIssuedBy] = useState("SportSphere Executive Committee");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTournaments() {
      try {
        const data = await getTournaments();
        setTournaments(data);
      } catch (err) {
        console.error("Failed to load tournaments:", err);
      }
    }
    loadTournaments();
  }, []);

  const handleTournamentChange = (e) => {
    const tournamentId = e.target.value;
    setSelectedTournamentId(tournamentId);

    const found = tournaments.find((t) => t.id === tournamentId);
    if (found) {
      setTournamentName(found.name || "");
      setSportName(found.sport || "");
    }
  };

  const handleRegenerateId = () => {
    setCertificateId(generateUniqueCertId());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!participantName.trim() || !tournamentName.trim() || !sportName.trim()) {
      setError("Please fill out all required certificate fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCertId = await createCertificate({
        certificateId: certificateId.trim(),
        participantName: participantName.trim(),
        tournamentId: selectedTournamentId,
        tournamentName: tournamentName.trim(),
        sportName: sportName.trim(),
        achievement,
        issueDate,
        issuedBy: issuedBy.trim(),
      });

      navigate(`/certificates/${newCertId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Issue Official Certificate"
        subtitle="Generate and publish a verifiable digital certificate for an athlete or winner."
      />

      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/certificates")}>
          Back to Certificates
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 1, maxWidth: 800, mx: "auto" }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              Certificate Details
            </Typography>

            <Grid container spacing={2.5}>
              {/* Unique Certificate ID */}
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Unique Certificate ID"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                  required
                  helperText="Guaranteed unique identifier used for QR code verification"
                />
              </Grid>

              <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "flex-start", pt: { sm: 1 } }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<RefreshIcon />}
                  onClick={handleRegenerateId}
                  sx={{ py: 1.8 }}
                >
                  Generate ID
                </Button>
              </Grid>

              {/* Tournament Dropdown */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Select Tournament (Optional Shortcut)"
                  value={selectedTournamentId}
                  onChange={handleTournamentChange}
                  helperText="Selecting a tournament automatically populates Event & Sport names"
                >
                  <MenuItem value="">Custom / Manual Entry</MenuItem>
                  {tournaments.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name} ({t.sport})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Participant Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Participant Full Name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  required
                  placeholder="e.g. Alex Morgan"
                />
              </Grid>

              {/* Achievement */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Achievement / Position"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  required
                >
                  {ACHIEVEMENTS.map((ach) => (
                    <MenuItem key={ach} value={ach}>
                      {ach}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Tournament Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tournament Event Name"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  required
                  placeholder="e.g. Annual Inter-College Football Championship"
                />
              </Grid>

              {/* Sport Category */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sport Category"
                  value={sportName}
                  onChange={(e) => setSportName(e.target.value)}
                  required
                  placeholder="e.g. Football / Basketball"
                />
              </Grid>

              {/* Issue Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Issue Date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {/* Issued By */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Authorized Issuing Authority"
                  value={issuedBy}
                  onChange={(e) => setIssuedBy(e.target.value)}
                  placeholder="e.g. SportSphere Committee"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                  <Button variant="outlined" onClick={() => navigate("/admin/certificates")}>
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={<WorkspacePremiumIcon />}
                  >
                    {loading ? "Issuing Certificate..." : "Issue Certificate"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

export default GenerateCertificatePage;
