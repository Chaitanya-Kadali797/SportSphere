import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Typography,
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getRegisteredTournaments } from "../../services/userService";
import { getTournaments } from "../../services/tournamentService";


function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function PlayerDashboard() {
  const { userProfile, loading: authLoading } = useAuth();
  const [registeredTournaments, setRegisteredTournaments] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    async function loadData() {
      setLoading(true);
      setError(null);

      let myRegs = [];
      let allTournaments = [];

      try {
        if (userProfile?.uid) {
          try {
            myRegs = await getRegisteredTournaments(userProfile.uid);
          } catch (rErr) {
            console.error("Failed to load user registrations:", rErr);
          }
        }

        try {
          allTournaments = await getTournaments();
        } catch (tErr) {
          console.error("Failed to load tournaments in dashboard:", tErr);
        }

        setRegisteredTournaments(myRegs);
        setAvailableTournaments(
          allTournaments.filter((t) => {
            if (!t) return false;
            if (!t.status) return true;
            const s = String(t.status).toLowerCase();
            return s !== "cancelled";
          })
        );
      } catch (err) {
        console.error("Player dashboard load failed:", err);
        setError("Unable to load player statistics.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, userProfile?.uid]);



  const stats = [
    {
      label: "My Registrations",
      value: loading ? "..." : registeredTournaments.length,
      hint: "Enrolled active events",
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 28, color: "#1e3a8a" }} />,
      bgColor: "#eff6ff",
    },
    {
      label: "Available Tournaments",
      value: loading ? "..." : availableTournaments.length,
      hint: "Published & open to enter",
      icon: <EmojiEventsIcon sx={{ fontSize: 28, color: "#d97706" }} />,
      bgColor: "#fef3c7",
    },
    {
      label: "Player Status",
      value: "Active",
      hint: "Verified student profile",
      icon: <SportsScoreIcon sx={{ fontSize: 28, color: "#059669" }} />,
      bgColor: "#d1fae5",
    },
    {
      label: "Participation Badge",
      value: registeredTournaments.length > 0 ? "Competitor" : "Rookie",
      hint: "Level 1 Athlete",
      icon: <PersonIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
      bgColor: "#e0e7ff",
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Player Arena"
        subtitle={`Welcome back, ${userProfile?.displayName || "Player"}. Track your tournament entries and explore new events.`}
        action={

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              component={RouterLink}
              to="/my-certificates"
              variant="outlined"
              startIcon={<WorkspacePremiumIcon />}
            >
              My Certificates
            </Button>
            <Button
              component={RouterLink}
              to="/tournaments"
              variant="contained"
              startIcon={<EmojiEventsIcon />}
            >
              Browse Tournaments
            </Button>
          </Box>
        }

      />

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Loader message="Loading player dashboard..." />
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={3} key={stat.label}>
                <Card className="hover-lift" sx={{ height: "100%", p: 0.5 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {stat.label}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif', my: 0.5, color: "#0f172a" }}>
                          {stat.value}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: stat.bgColor, width: 48, height: 48, borderRadius: 3 }}>
                        {stat.icon}
                      </Avatar>
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {stat.hint}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {/* My Active Registrations */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ p: 1, height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      My Registered Tournaments
                    </Typography>
                    <Button component={RouterLink} to="/my-tournaments" endIcon={<ArrowForwardIcon />} size="small">
                      View All ({registeredTournaments.length})
                    </Button>
                  </Box>

                  {registeredTournaments.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 3 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        You haven't registered for any tournaments yet.
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Explore active tournaments and register with 1-click!
                      </Typography>
                      <Button component={RouterLink} to="/tournaments" variant="contained" size="small">
                        Browse Tournaments
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {registeredTournaments.slice(0, 3).map((t) => (
                        <Grid item xs={12} key={t.id}>
                          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "#f8fafc" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {t.name}
                              </Typography>
                              <Chip label={t.sport} size="small" color="primary" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                              {formatDate(t.startDate)} — {formatDate(t.endDate)}
                            </Typography>
                            <Button component={RouterLink} to={`/tournaments/${t.id}`} size="small" variant="outlined">
                              View Details
                            </Button>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Featured Available Tournaments */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ p: 1, height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Featured Tournaments
                    </Typography>
                    <Button component={RouterLink} to="/tournaments" endIcon={<ArrowForwardIcon />} size="small">
                      Explore All
                    </Button>
                  </Box>

                  {availableTournaments.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 3 }}>
                      <Typography variant="h6" color="text.secondary">
                        No active tournaments available
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {availableTournaments.slice(0, 3).map((t) => (
                        <Grid item xs={12} key={t.id}>
                          <Paper elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {t.name}
                              </Typography>
                              <Chip label={t.type} size="small" variant="outlined" color="secondary" />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                              {t.sport} • Location: {t.location || "Main Stadium"}
                            </Typography>
                            <Button component={RouterLink} to={`/tournaments/${t.id}`} size="small" variant="contained">
                              Register Now
                            </Button>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </DashboardLayout>
  );
}

export default PlayerDashboard;

