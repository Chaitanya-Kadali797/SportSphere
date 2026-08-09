import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getRegisteredTournaments } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function MyTournaments() {
  const { userProfile, user, loading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const uid = userProfile?.uid || user?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    async function loadTournaments() {
      setLoading(true);
      setError(null);

      try {
        console.log(`[MyTournaments] Loading registrations for uid: ${uid}`);
        const data = await getRegisteredTournaments(uid);
        console.log(`[MyTournaments] Loaded ${data.length} registered tournaments:`, data);
        setTournaments(data);
      } catch (err) {
        console.error("[MyTournaments] Failed to load registrations:", err);
        setError("Unable to load your tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadTournaments();
  }, [authLoading, userProfile?.uid, user?.uid]);

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your registrations..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="My Registrations" subtitle="View tournaments you have signed up for." />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {tournaments.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight={700}>
                  No registrations found
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  You have not registered for any tournaments yet.
                </Typography>
                <Button component={RouterLink} to="/tournaments" variant="contained">
                  Browse Tournaments
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          tournaments.map((tournament) => (
            <Grid item xs={12} md={6} key={tournament.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontFamily: '"Outfit", sans-serif' }}>
                    {tournament.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {tournament.sport} • {tournament.type === "team" ? "Team Format" : "Individual Format"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📅 {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
                  </Typography>
                  <Button component={RouterLink} to={`/tournaments/${tournament.id}`} size="small" variant="outlined">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </DashboardLayout>
  );
}

export default MyTournaments;
