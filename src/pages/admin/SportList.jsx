import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import DashboardLayout from "../../components/layout/Navbar";
import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import {
  deleteSport,
  getSports,
  isSportSafeToDelete,
  seedSports,
  toggleSportStatus,
} from "../../services/sportService";
import { useAuth, useRole } from "../../hooks/useAuth";

function SportList() {
  const navigate = useNavigate();
  const { isSuperAdmin } = useRole();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const { isAuthenticated, loading: authLoading } = useAuth();

  const loadSports = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSports();
      setSports(data);
    } catch (err) {
      console.error("getSports failed:", err);
      if (err?.code === "permission-denied") {
        setError(
          "Unable to load sports due to Firestore permissions. Verify Firebase rules and authenticated user access."
        );
      } else {
        setError("Unable to load sports. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setError("Please sign in to view sports.");
      setLoading(false);
      return;
    }

    loadSports();
  }, [isAuthenticated, authLoading]);

  const handleSeedSports = async () => {
    setSeeding(true);
    setError(null);
    setSuccessMessage("");

    try {
      await seedSports();
      const updated = await getSports();
      setSports(updated);
      setSuccessMessage("Default sports seeded successfully!");
    } catch (err) {
      console.error("Seed sports failed:", err);
      setError("Unable to seed default sports. Please check Firestore permissions.");
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleStatus = async (sport) => {
    try {
      await toggleSportStatus(sport.id, !sport.active);
      setSports((prev) =>
        prev.map((item) =>
          item.id === sport.id ? { ...item, active: !sport.active } : item
        )
      );
      setSuccessMessage(
        `${sport.name} has been ${sport.active ? "deactivated" : "activated"}.`
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update sport status. Please try again.");
    }
  };

  const handleDelete = async (sport) => {
    if (!isSuperAdmin) {
      setError("Only Super Admin can modify this");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${sport.name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const safe = await isSportSafeToDelete(sport.id, sport.name);
      if (!safe) {
        setError(
          "Sport cannot be deleted while tournaments are linked to it. Deactivate it instead."
        );
        return;
      }

      await deleteSport(sport.id);
      setSports((prev) => prev.filter((item) => item.id !== sport.id));
      setSuccessMessage("Sport deleted successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to delete sport. Please try again.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading sports..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader title="Sport Management" subtitle="Manage available sports for tournaments." />

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="h6">Sports Catalog ({sports.length})</Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AutoFixHighIcon />}
            onClick={handleSeedSports}
            disabled={seeding}
          >
            {seeding ? "Seeding..." : "Seed Default Sports"}
          </Button>
          <Button
            component={RouterLink}
            to="/admin/sports/create"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Sport
          </Button>
        </Box>
      </Box>

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

      {sports.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6" gutterBottom fontWeight={700}>
              No sports catalog items found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
              Add custom sports or click below to automatically populate default multi-sport entries (Cricket, Football, Basketball, Tennis, etc.).
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AutoFixHighIcon />}
                onClick={handleSeedSports}
                disabled={seeding}
              >
                {seeding ? "Seeding Sports..." : "Seed Default Sports"}
              </Button>
              <Button
                component={RouterLink}
                to="/admin/sports/create"
                variant="outlined"
                startIcon={<AddIcon />}
              >
                Add Custom Sport
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sports.map((sport) => (
                <TableRow key={sport.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{sport.name}</TableCell>
                  <TableCell>{sport.type === "team" ? "Team Sport" : "Individual Sport"}</TableCell>
                  <TableCell>
                    <Chip
                      label={sport.active ? "Active" : "Inactive"}
                      color={sport.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      aria-label="Edit"
                      onClick={() => navigate(`/admin/sports/${sport.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={sport.active ? "Deactivate" : "Activate"}
                      onClick={() => handleToggleStatus(sport)}
                    >
                      {sport.active ? (
                        <ToggleOffIcon fontSize="small" />
                      ) : (
                        <ToggleOnIcon fontSize="small" />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label="Delete"
                      onClick={() => handleDelete(sport)}
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

export default SportList;

