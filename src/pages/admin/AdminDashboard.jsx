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
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getTournaments } from "../../services/tournamentService";
import { getSports } from "../../services/sportService";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function AdminDashboard() {
  const { userProfile } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError(null);

      try {
        const [tournamentsData, sportsData] = await Promise.all([getTournaments(), getSports()]);
        setTournaments(tournamentsData);
        setSports(sportsData);
      } catch (err) {
        console.error("Admin dashboard load failed:", err);
        if (err?.code === "permission-denied") {
          setError(
            "Unable to load dashboard statistics due to Firestore permissions. Verify Firebase rules and authenticated user access."
          );
        } else {
          setError("Unable to load dashboard statistics.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const activeSportsCount = sports.filter((s) => s.active).length;
  const publishedTournamentsCount = tournaments.filter((t) => t.status === "Published").length;

  const stats = [
    {
      label: "Total Sports",
      value: loading ? "..." : sports.length,
      hint: `${activeSportsCount} Active in Catalog`,
      icon: <SportsSoccerIcon sx={{ fontSize: 28, color: "#1e3a8a" }} />,
      bgColor: "#eff6ff",
    },
    {
      label: "Total Tournaments",
      value: loading ? "..." : tournaments.length,
      hint: `${publishedTournamentsCount} Published Events`,
      icon: <EmojiEventsIcon sx={{ fontSize: 28, color: "#d97706" }} />,
      bgColor: "#fef3c7",
    },
    {
      label: "Active Sports Ratio",
      value: loading ? "..." : `${sports.length ? Math.round((activeSportsCount / sports.length) * 100) : 0}%`,
      hint: "Sports available for creation",
      icon: <CheckCircleIcon sx={{ fontSize: 28, color: "#059669" }} />,
      bgColor: "#d1fae5",
    },
    {
      label: "System Status",
      value: "Operational",
      hint: "Firebase Firestore Syncing",
      icon: <PeopleIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
      bgColor: "#e0e7ff",
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Admin Control Center"
        subtitle={`Welcome back, ${userProfile?.displayName || "Admin"}. Here is your live system overview.`}
        action={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              component={RouterLink}
              to="/admin/sports/create"
              variant="outlined"
              startIcon={<AddIcon />}
            >
              Add Sport
            </Button>
            <Button
              component={RouterLink}
              to="/admin/tournaments/create"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Create Tournament
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
        <Loader message="Loading dashboard analytics..." />
      ) : (
        <>
          {/* Stats Section */}
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
                        <Typography variant="h3" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif', my: 0.5, color: "#0f172a" }}>
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

          {/* Quick Actions & Recent Tournaments */}
          <Grid container spacing={3}>
            {/* Recent Tournaments */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ p: 1, height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Recent Tournaments
                    </Typography>
                    <Button
                      component={RouterLink}
                      to="/admin/tournaments"
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                    >
                      View All ({tournaments.length})
                    </Button>
                  </Box>

                  {tournaments.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 3 }}>
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Tournaments Created Yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Start by creating your first multi-sport tournament.
                      </Typography>
                      <Button component={RouterLink} to="/admin/tournaments/create" variant="contained" size="small" startIcon={<AddIcon />}>
                        Create Tournament
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #f1f5f9" }}>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f8fafc" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Tournament Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Sport</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tournaments.slice(0, 5).map((t) => (
                            <TableRow key={t.id} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                              <TableCell>{t.sport || "—"}</TableCell>
                              <TableCell>{formatDate(t.startDate)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={t.status}
                                  size="small"
                                  color={
                                    t.status === "Published"
                                      ? "success"
                                      : t.status === "Draft"
                                      ? "warning"
                                      : "default"
                                  }
                                />
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

            {/* Quick Management Shortcuts */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ p: 1, height: "100%", bgcolor: "#0f172a", color: "#fff" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ color: "#fff", mb: 1, fontFamily: '"Outfit", sans-serif' }}>
                    Quick Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
                    Fast shortcuts to administer sports, tournaments, and rules.
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Button
                      component={RouterLink}
                      to="/admin/sports"
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        justifyContent: "flex-start",
                        py: 1.5,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                      }}
                      startIcon={<SportsSoccerIcon />}
                    >
                      Manage Sports Catalog ({sports.length})
                    </Button>

                    <Button
                      component={RouterLink}
                      to="/admin/tournaments"
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        justifyContent: "flex-start",
                        py: 1.5,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                      }}
                      startIcon={<EmojiEventsIcon />}
                    >
                      Manage Tournaments ({tournaments.length})
                    </Button>

                    <Button
                      component={RouterLink}
                      to="/admin/certificates"
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        justifyContent: "flex-start",
                        py: 1.5,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                      }}
                      startIcon={<EmojiEventsIcon />}
                    >
                      Issue & Manage Certificates
                    </Button>

                    <Button
                      component={RouterLink}
                      to="/profile"
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                        justifyContent: "flex-start",
                        py: 1.5,
                        px: 2,
                        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
                      }}
                      startIcon={<PeopleIcon />}
                    >
                      View Profile & Account Settings
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

export default AdminDashboard;

