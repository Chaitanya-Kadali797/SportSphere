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
  LinearProgress,
  Typography,
} from "@mui/material";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getTournament } from "../../services/tournamentService";
import { useAuth, useRole } from "../../hooks/useAuth";
import {
  getTournamentRegistrationCount,
  getUserRegistrations,
  registerForTournament,
  unregisterFromTournament,
} from "../../services/userService";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { role } = useRole();
  const isAdmin = role === "admin";

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(0);

  const loadRegistrationStats = async () => {
    try {
      const count = await getTournamentRegistrationCount(id);
      setRegisteredCount(count);
    } catch (err) {
      console.error("Failed to load registration count:", err);
    }
  };

  useEffect(() => {
    async function loadTournament() {
      setLoading(true);
      setError(null);

      try {
        const data = await getTournament(id);
        if (!data) {
          setError("Tournament not found.");
          return;
        }
        setTournament(data);

        let userRegs = [];
        let count = 0;

        if (userProfile?.uid) {
          try {
            userRegs = await getUserRegistrations(userProfile.uid);
          } catch (rErr) {
            console.error("Failed to load user registrations:", rErr);
          }
        }

        try {
          count = await getTournamentRegistrationCount(id);
        } catch (cErr) {
          console.error("Failed to load registration count:", cErr);
        }

        setIsRegistered(userRegs.some((registration) => registration.tournamentId === id));
        setRegisteredCount(count);
      } catch (err) {
        console.error(err);
        setError("Unable to load tournament details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadTournament();
    }
  }, [id, userProfile?.uid]);

  const handleRegister = async () => {
    if (!userProfile?.uid) {
      setError("Please log in to register for tournaments.");
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      await registerForTournament(userProfile.uid, id);
      setSuccessMessage("You have successfully registered for this tournament!");
      setIsRegistered(true);
      await loadRegistrationStats();
    } catch (err) {
      console.error("Registration error:", err);
      setError(err?.message || "Unable to register for tournament. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!userProfile?.uid) return;

    setActionLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      await unregisterFromTournament(userProfile.uid, id);
      setSuccessMessage("Your registration has been removed.");
      setIsRegistered(false);
      await loadRegistrationStats();
    } catch (err) {
      console.error(err);
      setError("Unable to remove registration. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading tournament details..." />
      </DashboardLayout>
    );
  }

  const maxCapacity = Number(tournament?.maxParticipants) || 100;
  const capacityPercent = Math.min(100, Math.round((registeredCount / maxCapacity) * 100));
  const isFull = registeredCount >= maxCapacity;

  const now = new Date();
  const regStart = tournament?.registrationStartDate ? new Date(tournament.registrationStartDate) : null;
  const regEnd = tournament?.registrationEndDate ? new Date(tournament.registrationEndDate) : null;

  const startOfDay = regStart ? new Date(regStart.getTime()) : null;
  if (startOfDay) startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = regEnd ? new Date(regEnd.getTime()) : null;
  if (endOfDay) endOfDay.setHours(23, 59, 59, 999);

  const isRegNotStarted = startOfDay && now < startOfDay;
  const isRegEnded = endOfDay && now > endOfDay;
  const isDraft = String(tournament?.status || "").toLowerCase() === "draft";


  return (
    <DashboardLayout>
      <PageHeader title="Tournament Details" subtitle="Review information, view capacity, and manage registration." />

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
        <Card sx={{ p: 1 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif' }} gutterBottom>
                  {tournament.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip label={tournament.sport} color="primary" size="small" />
                  <Chip label={tournament.type === "team" ? "Team Event" : "Individual Event"} size="small" variant="outlined" />
                  <Chip
                    label={tournament.status}
                    color={
                      tournament.status === "Published"
                        ? "success"
                        : tournament.status === "Draft"
                        ? "warning"
                        : "default"
                    }
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "flex-start" }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Back
                </Button>

                {isAdmin ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/admin/tournaments/${id}`)}
                  >
                    Manage / Edit Tournament
                  </Button>
                ) : isRegistered ? (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleUnregister}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Unregister"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRegister}
                    disabled={actionLoading || isFull || isDraft || isRegNotStarted || isRegEnded}
                  >
                    {actionLoading
                      ? "Processing..."
                      : isFull
                      ? "Capacity Full"
                      : isRegNotStarted
                      ? "Registration Not Open"
                      : isRegEnded
                      ? "Registration Closed"
                      : isDraft
                      ? "Draft Event"
                      : "Register Now"}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Validation Alerts for Players */}
            {!isAdmin && (
              <Box sx={{ mb: 2 }}>
                {isDraft && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    This tournament is currently in Draft status and is not accepting registrations.
                  </Alert>
                )}
                {isRegNotStarted && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Registration has not opened yet. Window opens on {formatDate(tournament.registrationStartDate)}.
                  </Alert>
                )}
                {isRegEnded && (
                  <Alert severity="error" sx={{ mb: 1 }}>
                    Registration window closed on {formatDate(tournament.registrationEndDate)}.
                  </Alert>
                )}
                {isFull && !isRegistered && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    This tournament has reached maximum registration capacity.
                  </Alert>
                )}
              </Box>
            )}

            {/* Participant Progress Bar Component */}
            <Box sx={{ bgcolor: "#f8fafc", p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                  Tournament Capacity & Enrolled Participants
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} color={isFull ? "error.main" : "primary.main"}>
                  {registeredCount} / {maxCapacity} Spots Filled ({capacityPercent}%)
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={capacityPercent}
                color={capacityPercent >= 90 ? "error" : capacityPercent >= 75 ? "warning" : "primary"}
                sx={{ height: 10, borderRadius: 5, bgcolor: "#e2e8f0" }}
              />

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                {isFull
                  ? "This tournament has reached maximum registration capacity."
                  : `${maxCapacity - registeredCount} remaining spot(s) available for registration.`}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Venue & Location
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                  {tournament.location || "Main Stadium"}
                </Typography>

                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Organizer
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                  {tournament.organizer || "SportSphere Administration"}
                </Typography>

                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Maximum Capacity Limit
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {tournament.maxParticipants} {tournament.type === "team" ? "Teams" : "Players"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Event Schedule Dates
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
                  Tournament Description & Rules
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                  {tournament.description || "No specific rules provided."}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography>Tournament not found.</Typography>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}

export default TournamentDetails;
