import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import CertificateView from "../../components/certificate/CertificateView";
import { getTournaments } from "../../services/tournamentService";
import { getTournamentParticipants } from "../../services/userService";
import {
  checkExistingCertificate,
  createCertificate,
  generateUniqueCertId,
} from "../../services/certificateService";

const ACHIEVEMENTS = [
  "Winner",
  "Runner-up",
  "3rd Place",
  "Participant",
];

function GenerateCertificatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTournamentId = searchParams.get("tournamentId") || "";

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [tournamentParticipants, setTournamentParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [selectedParticipantUserId, setSelectedParticipantUserId] = useState("");

  const [certificateId, setCertificateId] = useState(generateUniqueCertId());
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [sportName, setSportName] = useState("");
  const [tournamentDate, setTournamentDate] = useState(new Date().toISOString().split("T")[0]);
  const [achievement, setAchievement] = useState("Winner");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [issuedBy, setIssuedBy] = useState("SportSphere Executive Committee");

  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [allowDuplicateOverride, setAllowDuplicateOverride] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Load Tournaments catalog
  useEffect(() => {
    async function loadTournaments() {
      try {
        const data = await getTournaments();
        setTournaments(data);

        // Pre-select if tournamentId query param is present
        if (preselectedTournamentId) {
          const found = data.find((t) => t.id === preselectedTournamentId);
          if (found) {
            handleTournamentSelect(found.id, data);
          }
        }
      } catch (err) {
        console.error("Failed to load tournaments:", err);
      }
    }
    loadTournaments();
  }, [preselectedTournamentId]);

  // Helper when tournament is chosen
  const handleTournamentSelect = async (tId, list = tournaments) => {
    setSelectedTournamentId(tId);
    setSelectedParticipantUserId("");
    setParticipantName("");
    setParticipantEmail("");
    setDuplicateWarning(null);
    setAllowDuplicateOverride(false);

    if (!tId) {
      setTournamentParticipants([]);
      return;
    }

    const found = list.find((t) => t.id === tId);
    if (found) {
      setTournamentName(found.name || "");
      setSportName(found.sport || "");
      if (found.endDate) {
        const d = found.endDate instanceof Date ? found.endDate : new Date(found.endDate);
        if (!isNaN(d.getTime())) {
          setTournamentDate(d.toISOString().split("T")[0]);
        }
      }
    }

    // Load registered participants for this tournament
    setLoadingParticipants(true);
    try {
      const participants = await getTournamentParticipants(tId);
      setTournamentParticipants(participants);
    } catch (pErr) {
      console.error("Failed to load tournament participants:", pErr);
      setTournamentParticipants([]);
    } finally {
      setLoadingParticipants(false);
    }
  };

  // Participant Select Handler
  const handleParticipantChange = async (e) => {
    const val = e.target.value;
    setSelectedParticipantUserId(val);
    setDuplicateWarning(null);
    setAllowDuplicateOverride(false);

    if (val === "CUSTOM") {
      setParticipantName("");
      setParticipantEmail("");
      return;
    }

    const participant = tournamentParticipants.find((p) => p.userId === val);
    if (participant) {
      const name = participant.displayName || "";
      const email = participant.email || "";
      setParticipantName(name);
      setParticipantEmail(email);

      // Perform duplicate check
      if (selectedTournamentId) {
        const existing = await checkExistingCertificate(selectedTournamentId, val, email, name);
        if (existing) {
          setDuplicateWarning(existing);
        }
      }
    }
  };

  // Manual participant name change triggers duplicate check
  const handleNameChange = async (e) => {
    const name = e.target.value;
    setParticipantName(name);
    if (selectedTournamentId && name.trim().length > 2) {
      const existing = await checkExistingCertificate(selectedTournamentId, selectedParticipantUserId, participantEmail, name);
      setDuplicateWarning(existing);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleRegenerateId = () => {
    setCertificateId(generateUniqueCertId());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!participantName.trim() || !tournamentName.trim() || !sportName.trim()) {
      setError("Please fill out all required certificate fields (Participant Name, Tournament, and Sport).");
      return;
    }

    if (duplicateWarning && !allowDuplicateOverride) {
      setError(`Duplicate Issue Warning: A certificate has already been issued to ${duplicateWarning.participantName} for this tournament. Please check the duplicate override box if you still wish to issue a new certificate.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCertId = await createCertificate(
        {
          certificateId: certificateId.trim(),
          userId: selectedParticipantUserId !== "CUSTOM" ? selectedParticipantUserId : "",
          participantUserId: selectedParticipantUserId !== "CUSTOM" ? selectedParticipantUserId : "",
          participantName: participantName.trim(),
          participantEmail: participantEmail.trim(),
          tournamentId: selectedTournamentId,
          tournamentName: tournamentName.trim(),
          sport: sportName.trim(),
          sportName: sportName.trim(),
          achievement,
          tournamentDate,
          issueDate,
          issuedBy: issuedBy.trim(),
        },
        allowDuplicateOverride
      );

      navigate(`/certificates/${newCertId}`);
    } catch (err) {
      console.error(err);
      if (err.existingCert) {
        setDuplicateWarning(err.existingCert);
      }
      setError(err.message || "Failed to create certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Live Certificate Payload for Preview
  const previewCertificateData = {
    certificateId: certificateId || "SP-2026-PREVIEW",
    participantName: participantName || "Participant Full Name",
    tournamentName: tournamentName || "Tournament Event Name",
    sportName: sportName || "Sport Category",
    sport: sportName || "Sport Category",
    achievement: achievement || "Winner",
    tournamentDate: tournamentDate,
    issueDate: issueDate,
    issuedBy: issuedBy || "SportSphere Board",
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Issue Official Certificate"
        subtitle="Generate, preview, print, and download digital certificates for tournament winners and participants."
      />

      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/admin/certificates")}>
          Back to Certificates
        </Button>
        <Button
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => setShowLivePreview(!showLivePreview)}
        >
          {showLivePreview ? "Hide Live Preview" : "Show Live Preview"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {duplicateWarning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            ⚠️ Duplicate Certificate Warning
          </Typography>
          A certificate (ID: <strong>{duplicateWarning.certificateId}</strong>) has already been issued to{" "}
          <strong>{duplicateWarning.participantName}</strong> for tournament <em>{duplicateWarning.tournamentName}</em> with achievement "
          {duplicateWarning.achievement}".
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => navigate(`/certificates/${duplicateWarning.certificateId}`)}
            >
              View Existing Certificate ({duplicateWarning.certificateId})
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allowDuplicateOverride}
                  onChange={(e) => setAllowDuplicateOverride(e.target.checked)}
                  color="warning"
                />
              }
              label={<Typography variant="body2" fontWeight={700}>Issue additional certificate anyway</Typography>}
            />
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Certificate Form */}
        <Grid item xs={12} lg={showLivePreview ? 6 : 12}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2.5 }}>
                  Certificate Details
                </Typography>

                <Grid container spacing={2}>
                  {/* Unique Certificate ID */}
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Unique Certificate ID"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value.toUpperCase())}
                      required
                      helperText="System-generated unique identifier"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<RefreshIcon />}
                      onClick={handleRegenerateId}
                      sx={{ py: 1.8 }}
                    >
                      New ID
                    </Button>
                  </Grid>

                  {/* Step 1: Select Tournament */}
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="1. Select Tournament"
                      value={selectedTournamentId}
                      onChange={(e) => handleTournamentSelect(e.target.value)}
                      helperText="Select a completed or ongoing tournament to load registered participants"
                    >
                      <MenuItem value="">Custom / Manual Entry</MenuItem>
                      {tournaments.map((t) => {
                        const isCompleted =
                          t.status === "Completed" || (t.endDate && new Date(t.endDate) < new Date());
                        return (
                          <MenuItem key={t.id} value={t.id}>
                            {t.name} ({t.sport}) {isCompleted ? "🏆 [Completed]" : `[${t.status || "Published"}]`}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </Grid>

                  {/* Step 2: Select Participant from Tournament */}
                  {selectedTournamentId && (
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        label="2. Select Registered Participant"
                        value={selectedParticipantUserId}
                        onChange={handleParticipantChange}
                        disabled={loadingParticipants}
                        helperText={
                          loadingParticipants
                            ? "Loading registered participants..."
                            : tournamentParticipants.length === 0
                            ? "No participants registered for this tournament. Select Custom Entry."
                            : `${tournamentParticipants.length} registered participant(s) available`
                        }
                      >
                        <MenuItem value="">Select a participant...</MenuItem>
                        {tournamentParticipants.map((p) => (
                          <MenuItem key={p.userId} value={p.userId}>
                            {p.displayName} ({p.email})
                          </MenuItem>
                        ))}
                        <MenuItem value="CUSTOM">➕ Custom / Unregistered Participant</MenuItem>
                      </TextField>
                    </Grid>
                  )}

                  {/* Participant Full Name */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Participant Full Name"
                      value={participantName}
                      onChange={handleNameChange}
                      required
                      placeholder="e.g. Alex Morgan"
                    />
                  </Grid>

                  {/* Participant Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Participant Email (Optional)"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      helperText="Used to map certificate to Player Account"
                    />
                  </Grid>

                  {/* Achievement Dropdown */}
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

                  {/* Tournament Event Name */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tournament Event Name"
                      value={tournamentName}
                      onChange={(e) => setTournamentName(e.target.value)}
                      required
                      placeholder="e.g. Inter-College Football Championship"
                    />
                  </Grid>

                  {/* Tournament Date */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Tournament Date"
                      value={tournamentDate}
                      onChange={(e) => setTournamentDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  {/* Certificate Issue Date */}
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

                  {/* Authorized Issuing Authority */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Authorized Issuing Authority"
                      value={issuedBy}
                      onChange={(e) => setIssuedBy(e.target.value)}
                      placeholder="e.g. SportSphere Executive Committee"
                    />
                  </Grid>

                  {/* Submit Action */}
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
                        {loading ? "Issuing Certificate..." : "Generate & Issue Certificate"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Certificate Preview Panel */}
        {showLivePreview && (
          <Grid item xs={12} lg={6}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#f8fafc" }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                ✨ Real-Time Certificate Preview
              </Typography>
              <CertificateView certificate={previewCertificateData} />
            </Paper>
          </Grid>
        )}
      </Grid>
    </DashboardLayout>
  );
}

export default GenerateCertificatePage;
