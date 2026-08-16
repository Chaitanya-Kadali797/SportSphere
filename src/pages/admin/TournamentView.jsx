import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import PeopleIcon from "@mui/icons-material/People";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { deleteTournament, getTournament, updateTournament } from "../../services/tournamentService";
import { getTournamentParticipants } from "../../services/userService";

import { useRole } from "../../hooks/useAuth";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function TournamentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useRole();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTournament(id);
      if (!data) {
        setError("Tournament not found.");
        return;
      }
      setTournament(data);

      try {
        const participantList = await getTournamentParticipants(id);
        setParticipants(participantList);
      } catch (pErr) {
        console.error("Failed to load participants:", pErr);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load tournament details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handlePublish = async () => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      await updateTournament(id, { status: "Published" });
      setTournament((prev) => ({ ...prev, status: "Published" }));
      setSuccessMessage("Tournament published successfully! It is now visible to players for registration.");
    } catch (err) {
      console.error("Publish failed:", err);
      setError("Failed to publish tournament. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isSuperAdmin) {
      setError("Only Super Admin can modify this");
      return;
    }

    const confirmed = window.confirm(
      "Delete this tournament? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTournament(id);
      navigate("/admin/tournaments");
    } catch (err) {
      console.error(err);
      setError("Unable to delete tournament. Please try again.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading tournament details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Tournament Management View" subtitle="Review tournament configuration, publish draft status, and view registered participants." />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {tournament ? (
        <Stack spacing={3}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif' }} gutterBottom>
                    {tournament.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Chip
                      label={tournament.status}
                      color={
                        tournament.status === "Published"
                          ? "success"
                          : tournament.status === "Draft"
                          ? "warning"
                          : "default"
                      }
                      sx={{ fontWeight: 800 }}
                    />
                    <Chip label={tournament.sport} color="primary" variant="outlined" size="small" />
                    <Chip label={tournament.type === "team" ? "Team Format" : "Individual Format"} size="small" variant="outlined" />
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<WorkspacePremiumIcon />}
                    onClick={() => navigate(`/admin/certificates/create?tournamentId=${tournament.id}`)}
                  >
                    Issue Certificate
                  </Button>
                  {tournament.status === "Draft" && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<PublishIcon />}
                      onClick={handlePublish}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Publishing..." : "Publish Tournament"}
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/admin/tournaments/${tournament.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Location & Venue
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                    {tournament.location || "—"}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Organizer
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                    {tournament.organizer || "—"}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Max Participant Capacity
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {participants.length} / {tournament.maxParticipants || "—"} Registered
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Tournament Event Dates
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                    {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Registration Open Window
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(tournament.registrationStartDate)} — {formatDate(tournament.registrationEndDate)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Description & Rules
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                    {tournament.description || "No description added."}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Registered Participants Section */}
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <PeopleIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Registered Participants ({participants.length})
                </Typography>
              </Box>

              {participants.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2 }}>
                  <Typography color="text.secondary">
                    No participants have registered for this tournament yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Participant Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Registration Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participants.map((p) => (
                        <TableRow key={p.registrationId} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{p.displayName}</TableCell>
                          <TableCell>{p.email}</TableCell>
                          <TableCell>{p.organization}</TableCell>
                          <TableCell>{formatDate(p.registeredAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Stack>
      ) : (
        <Card>
          <CardContent>
            <Typography>No tournament details available.</Typography>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default TournamentView;
