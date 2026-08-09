import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PublishIcon from "@mui/icons-material/Publish";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import { deleteTournament, getTournaments, updateTournament } from "../../services/tournamentService";
import { TOURNAMENT_STATUSES } from "../../utils/constants";

function formatDate(value) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString();
}

function TournamentList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    async function loadTournaments() {
      setLoading(true);
      setError(null);

      try {
        const data = await getTournaments();
        setTournaments(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadTournaments();
  }, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handlePublish = async (id) => {
    try {
      await updateTournament(id, { status: "Published" });
      setTournaments((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Published" } : t))
      );
      setSuccessMessage("Tournament published successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to publish tournament. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this tournament? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTournament(id);
      setTournaments((prev) => prev.filter((tournament) => tournament.id !== id));
      setSuccessMessage("Tournament deleted successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to delete tournament. Please try again.");
    }
  };

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.organizer?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading tournaments..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Tournament Management" subtitle="Create, edit, search, and manage tournaments." />

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={700}>
          Tournament Directory ({filteredTournaments.length})
        </Typography>
        <Button
          component={RouterLink}
          to="/admin/tournaments/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Create Tournament
        </Button>
      </Box>

      {/* Search & Status Filter Controls */}
      <Card sx={{ mb: 3, p: 1 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tournaments by name, sport, or organizer..."
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
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status Filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {TOURNAMENT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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

      {filteredTournaments.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              No tournaments found
            </Typography>
            <Typography color="text.secondary">
              {tournaments.length === 0
                ? "Start by creating your first tournament."
                : "No tournaments match your filter terms. Try resetting your search."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sport</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Organizer</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTournaments.map((tournament) => (
                <TableRow key={tournament.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{tournament.name}</TableCell>
                  <TableCell>{tournament.sport}</TableCell>
                  <TableCell>
                    <Chip
                      label={tournament.status}
                      size="small"
                      color={
                        tournament.status === "Published"
                          ? "success"
                          : tournament.status === "Draft"
                          ? "warning"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}
                  </TableCell>
                  <TableCell>{tournament.organizer || "—"}</TableCell>
                  <TableCell align="right">
                    {tournament.status === "Draft" && (
                      <IconButton
                        size="small"
                        color="success"
                        aria-label="Publish"
                        title="Publish Tournament"
                        onClick={() => handlePublish(tournament.id)}
                      >
                        <PublishIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      aria-label="View"
                      title="View Details"
                      onClick={() => navigate(`/admin/tournaments/${tournament.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Edit"
                      title="Edit"
                      onClick={() => navigate(`/admin/tournaments/${tournament.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Delete"
                      title="Delete"
                      onClick={() => handleDelete(tournament.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </DashboardLayout>
  );
}

export default TournamentList;
