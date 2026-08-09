import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { getTournaments } from "../../services/tournamentService";
import { getSports } from "../../services/sportService";
import { useAuth } from "../../hooks/useAuth";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function TournamentBrowse() {
  const { user, loading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    console.log("[TournamentBrowse DIAGNOSTIC LOG]");
    console.log("-> Authenticated UID:", user?.uid || "NOT_AUTHENTICATED");
    console.log("-> Authenticated Email:", user?.email || "N/A");
    console.log("-> Auth Loading State:", authLoading);

    if (authLoading) {
      console.log("[TournamentBrowse] Auth still loading, waiting...");
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        let tournamentsData = [];
        let sportsData = [];

        try {
          console.log("[TournamentBrowse] Executing getTournaments query...");
          tournamentsData = await getTournaments();
          console.log(`[TournamentBrowse] Direct Firestore documents returned count: ${tournamentsData.length}`);
          tournamentsData.forEach((t, i) => {
            console.log(` -> Doc [${i + 1}] ID: ${t.id} | Status: "${t.status}" | Name: "${t.name}" | StartDate: ${t.startDate} | EndDate: ${t.endDate}`);
          });
        } catch (tErr) {
          console.error("[TournamentBrowse] Firestore query failed:", tErr);
        }

        try {
          sportsData = await getSports({ onlyActive: true });
          console.log(`[TournamentBrowse] Active sports returned count: ${sportsData.length}`);
        } catch (sErr) {
          console.error("[TournamentBrowse] Failed to load sports:", sErr);
        }

        const validTournaments = tournamentsData.filter((tournament) => {
          if (!tournament) return false;
          if (!tournament.status) return true;
          const s = String(tournament.status).toLowerCase();
          return s !== "cancelled";
        });

        console.log(`[TournamentBrowse] Valid non-cancelled tournaments count: ${validTournaments.length}`);
        setTournaments(validTournaments);
        setSports(sportsData);
      } catch (err) {
        console.error("[TournamentBrowse] Load data error:", err);
        setError("Unable to load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authLoading, user?.uid, user?.email]);

  const filteredTournaments = tournaments.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      t.name?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.organizer?.toLowerCase().includes(q) ||
      t.sport?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q);

    const matchesSport =
      selectedSport === "all" ||
      !selectedSport ||
      t.sport?.toLowerCase() === selectedSport?.toLowerCase() ||
      t.sportId?.toLowerCase() === selectedSport?.toLowerCase();

    const matchesType =
      selectedType === "all" ||
      !selectedType ||
      t.type?.toLowerCase() === selectedType?.toLowerCase() ||
      t.format?.toLowerCase() === selectedType?.toLowerCase();

    const keep = matchesSearch && matchesSport && matchesType;
    if (!keep) {
      console.log(`[TournamentBrowse FILTERED OUT] ID: ${t.id}, Name: "${t.name}", Status: "${t.status}": matchesSearch=${matchesSearch}, matchesSport=${matchesSport}, matchesType=${matchesType}`);
    } else {
      console.log(`[TournamentBrowse PASSED FILTER] ID: ${t.id}, Name: "${t.name}", Status: "${t.status}"`);
    }
    return keep;
  });

  console.log(`[TournamentBrowse] Final number of tournaments after filtering: ${filteredTournaments.length}`);

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <Loader message="Loading available tournaments..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Browse Tournaments" subtitle="Discover active events, filter by sport, and register with one click." />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search & Filter Toolbar */}
      <Card sx={{ mb: 4, p: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by tournament, venue, or organizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Sport Dropdown Filter */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Sport Category"
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterAltIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Sports</MenuItem>
                {sports.map((sport) => (
                  <MenuItem key={sport.id} value={sport.name}>
                    {sport.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Type Filter Chips */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Format:
                </Typography>
                <Chip
                  label="All"
                  clickable
                  color={selectedType === "all" ? "primary" : "default"}
                  onClick={() => setSelectedType("all")}
                  size="small"
                />
                <Chip
                  label="Team"
                  clickable
                  color={selectedType === "team" ? "primary" : "default"}
                  onClick={() => setSelectedType("team")}
                  size="small"
                />
                <Chip
                  label="Individual"
                  clickable
                  color={selectedType === "individual" ? "primary" : "default"}
                  onClick={() => setSelectedType("individual")}
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tournament Cards Grid */}
      <Grid container spacing={3}>
        {filteredTournaments.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                No tournaments match your search or filter criteria.
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search terms or filter selection.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSport("all");
                  setSelectedType("all");
                }}
              >
                Reset Filters
              </Button>
            </Card>
          </Grid>
        ) : (
          filteredTournaments.map((tournament) => (
            <Grid item xs={12} md={6} key={tournament.id}>
              <Card className="hover-lift" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Outfit", sans-serif' }}>
                      {tournament.name}
                    </Typography>
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

                  <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                    <Chip label={tournament.sport} size="small" variant="outlined" color="primary" />
                    <Chip label={tournament.type === "team" ? "Team Format" : "Individual Format"} size="small" variant="outlined" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    📅 Dates: {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📍 Venue: {tournament.location || "Main Stadium"}
                  </Typography>

                  <Button
                    component={RouterLink}
                    to={`/tournaments/${tournament.id}`}
                    variant="contained"
                    fullWidth
                    sx={{ mt: "auto" }}
                  >
                    View Details & Register
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

export default TournamentBrowse;
