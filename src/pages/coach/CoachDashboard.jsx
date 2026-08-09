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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getTournaments } from "../../services/tournamentService";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function CoachDashboard() {
  const { userProfile } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTournaments() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTournaments();
        setTournaments(
          data.filter((t) => {
            if (!t.status) return true;
            const s = t.status.toLowerCase();
            return s === "published" || s === "active" || s === "open";
          })
        );


      } catch (err) {
        console.error("Coach dashboard load failed:", err);
        setError("Unable to load active tournaments.");
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
  }, []);

  const stats = [
    {
      label: "Active Tournaments",
      value: loading ? "..." : tournaments.length,
      hint: "Open for team entry",
      icon: <EmojiEventsIcon sx={{ fontSize: 28, color: "#1e3a8a" }} />,
      bgColor: "#eff6ff",
    },
    {
      label: "Team Roster Status",
      value: "Ready",
      hint: "All player profiles active",
      icon: <GroupsIcon sx={{ fontSize: 28, color: "#059669" }} />,
      bgColor: "#d1fae5",
    },
    {
      label: "Coaching Specialty",
      value: "Multi-Sport",
      hint: "Team & Individual strategy",
      icon: <SportsScoreIcon sx={{ fontSize: 28, color: "#d97706" }} />,
      bgColor: "#fef3c7",
    },
    {
      label: "Season Stage",
      value: "Phase 1",
      hint: "Tournament qualification",
      icon: <EventAvailableIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
      bgColor: "#e0e7ff",
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Coach Portal & Strategy Center"
        subtitle={`Welcome back, Coach ${userProfile?.displayName || ""}. Review active tournaments and manage team strategy.`}
        action={
          <Button
            component={RouterLink}
            to="/tournaments"
            variant="contained"
            startIcon={<EmojiEventsIcon />}
          >
            Browse Tournaments
          </Button>
        }
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Loader message="Loading coach portal data..." />
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
            <Grid item xs={12} lg={8}>
              <Card sx={{ p: 1 }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Published Tournaments
                    </Typography>
                    <Button component={RouterLink} to="/tournaments" endIcon={<ArrowForwardIcon />} size="small">
                      View All
                    </Button>
                  </Box>

                  {tournaments.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 3 }}>
                      <Typography variant="h6" color="text.secondary">
                        No published tournaments right now
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f5f9" }}>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Tournament</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Sport</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tournaments.slice(0, 5).map((t) => (
                            <TableRow key={t.id} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                              <TableCell>{t.sport}</TableCell>
                              <TableCell>
                                <Chip label={t.type} size="small" variant="outlined" color="primary" />
                              </TableCell>
                              <TableCell>
                                <Button
                                  component={RouterLink}
                                  to={`/tournaments/${t.id}`}
                                  size="small"
                                  variant="contained"
                                >
                                  Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ p: 1, bgcolor: "#1e293b", color: "#fff" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ color: "#fff", mb: 1, fontFamily: '"Outfit", sans-serif' }}>
                    Coach Guidelines
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
                    Review sport specifications, dates, and participant requirements before registering your athletes.
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Button
                      component={RouterLink}
                      to="/tournaments"
                      variant="contained"
                      fullWidth
                      sx={{ bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, py: 1.5 }}
                    >
                      Browse All Events
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/profile"
                      variant="outlined"
                      fullWidth
                      sx={{ color: "#fff", borderColor: "rgba(255, 255, 255, 0.3)", py: 1.5 }}
                    >
                      Update Coach Profile
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </DashboardLayout>
  );
}

export default CoachDashboard;

