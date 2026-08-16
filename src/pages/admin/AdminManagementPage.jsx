import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SecurityIcon from "@mui/icons-material/Security";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import DashboardLayout from "../../components/layout/Navbar";
import Loader from "../../components/common/Loader";
import { useAuth, useRole } from "../../hooks/useAuth";
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  toggleAdminStatus,
} from "../../services/userService";

function AdminManagementPage() {
  const { user, userProfile } = useAuth();
  const { isSuperAdmin } = useRole();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dialog state
  const [openModal, setOpenModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");
      const adminList = await getAdminAccounts();
      setAdmins(adminList);
    } catch (err) {
      console.error("Failed to load admins:", err);
      setError("Failed to load Admin accounts. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  if (!isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const activeCount = admins.filter((a) => a.active !== false).length;
  const isLimitReached = activeCount >= 3;

  const handleOpenModal = () => {
    if (!isSuperAdmin) {
      setError("Only Super Admin can modify this");
      return;
    }
    if (isLimitReached) {
      setError("Maximum of 3 Admin accounts reached.");
      return;
    }
    setFormData({
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setFormErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.displayName.trim()) {
      errors.displayName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isSuperAdmin) {
      setError("Only Super Admin can modify this");
      handleCloseModal();
      return;
    }

    if (!validateForm()) return;

    if (isLimitReached) {
      setError("Maximum of 3 Admin accounts reached.");
      handleCloseModal();
      return;
    }

    try {
      setActionLoading(true);
      await createAdminAccount({
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
        superAdminUid: user?.uid,
      });

      setSuccessMessage(`Admin account for ${formData.displayName} created successfully!`);
      handleCloseModal();
      await fetchAdmins();
    } catch (err) {
      console.error("Failed to create admin:", err);
      if (err.message && err.message.includes("Maximum of 3")) {
        setError("Maximum of 3 Admin accounts reached.");
      } else {
        setError(err.message || "Failed to create Admin account. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    if (!isSuperAdmin) {
      setError("Only Super Admin can modify this");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      const newStatus = !(admin.active !== false);
      await toggleAdminStatus(admin.uid, newStatus);

      setSuccessMessage(
        `Admin ${admin.displayName || admin.email} ${newStatus ? "activated" : "deactivated"} successfully.`
      );
      await fetchAdmins();
    } catch (err) {
      console.error("Failed to toggle admin status:", err);
      if (err.message && err.message.includes("Maximum of 3")) {
        setError("Maximum of 3 Admin accounts reached.");
      } else {
        setError("Failed to update Admin status. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (!isSuperAdmin) {
      setError("Only Super Admin can modify this");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to remove Admin account for "${admin.displayName || admin.email}"?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      await deleteAdminAccount(admin.uid);
      setSuccessMessage(`Admin ${admin.displayName || admin.email} removed successfully.`);
      await fetchAdmins();
    } catch (err) {
      console.error("Failed to delete admin:", err);
      setError("Failed to remove Admin account.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading Admin Management..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: "#0f172a", display: "flex", alignItems: "center", gap: 1.5 }}>
              <AdminPanelSettingsIcon sx={{ color: "#6b091f", fontSize: "2.2rem" }} />
              Admin Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Manage system Admin accounts (Maximum limit: 3 active Admins)
            </Typography>
          </Box>

          {isSuperAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenModal}
              disabled={isLimitReached || actionLoading}
              sx={{
                bgcolor: "#6b091f",
                "&:hover": { bgcolor: "#4a0615" },
                px: 3,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              Create Admin
            </Button>
          )}
        </Stack>
      </Box>

      {/* Restricted Alert for non-Super Admin */}
      {!isSuperAdmin && (
        <Alert severity="warning" icon={<SecurityIcon />} sx={{ mb: 3, fontWeight: 700 }}>
          Only Super Admin can modify this
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, fontWeight: 600 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, fontWeight: 600 }}>
          {successMessage}
        </Alert>
      )}

      {/* Super Admin Info Header Card */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "#0f172a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SecurityIcon sx={{ color: "#ffd700", fontSize: "2.4rem" }} />
          <Box>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
              System Authority
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#ffffff" }}>
              {userProfile?.displayName || "Chaitanya"} (Super Admin)
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
              {userProfile?.email || ""}
            </Typography>
          </Box>
        </Box>
        <Chip
          label="Super Admin"
          sx={{ bgcolor: "#ffd700", color: "#0f172a", fontWeight: 900, px: 1.5, py: 0.5, fontSize: "0.85rem" }}
        />
      </Paper>

      {isLimitReached && (
        <Alert severity="info" sx={{ mb: 3, fontWeight: 600 }}>
          Maximum of 3 Admin accounts reached. Deactivate an existing account to create a new one.
        </Alert>
      )}

      {/* Active Count Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          bgcolor: "#faf7f2",
          border: "1px solid #d4af37",
          display: "flex",
          alignItems: "center",
          justify: "space-between",
        }}
      >
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "#6b091f" }}>
          Active Admin Slots Used
        </Typography>
        <Chip
          label={`${activeCount} / 3 Active Admins`}
          color={activeCount >= 3 ? "error" : "success"}
          sx={{ fontWeight: 800, fontSize: "0.9rem", px: 1.5 }}
        />
      </Paper>

      {/* Admin Account Cards / List */}
      <Grid container spacing={3}>
        {[0, 1, 2].map((index) => {
          const admin = admins[index];
          const slotNum = index + 1;

          if (!admin) {
            return (
              <Grid item xs={12} md={4} key={`empty-slot-${slotNum}`}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "2px dashed #cbd5e1",
                    bgcolor: "#f8fafc",
                    textAlign: "center",
                    py: 5,
                    px: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justify: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={800} color="text.secondary" gutterBottom>
                    Admin {slotNum}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Slot Available
                  </Typography>
                  {isSuperAdmin && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={handleOpenModal}
                      disabled={isLimitReached}
                      sx={{ bgcolor: "#6b091f", "&:hover": { bgcolor: "#4a0615" }, color: "#fff", fontWeight: 700 }}
                    >
                      Create Admin {slotNum}
                    </Button>
                  )}
                </Card>
              </Grid>
            );
          }

          const isActive = admin.active !== false;

          return (
            <Grid item xs={12} md={4} key={admin.uid || `admin-slot-${slotNum}`}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  borderTop: `4px solid ${isActive ? "#16a34a" : "#dc2626"}`,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justify: "space-between",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary">
                      Admin {slotNum}
                    </Typography>
                    <Chip
                      label={isActive ? "Active" : "Inactive"}
                      color={isActive ? "success" : "error"}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  <Typography variant="h6" fontWeight={800} sx={{ color: "#0f172a", mb: 0.5 }}>
                    {admin.displayName || `Admin ${slotNum}`}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: "break-all" }}>
                    {admin.email}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="caption" color="text.secondary" display="block">
                    Role: <strong>Admin</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Status: <strong>{isActive ? "Active" : "Deactivated"}</strong>
                  </Typography>
                </CardContent>

                {/* Actions */}
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                  {isSuperAdmin ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant={isActive ? "outlined" : "contained"}
                        color={isActive ? "warning" : "success"}
                        startIcon={isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        onClick={() => handleToggleStatus(admin)}
                        disabled={actionLoading}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteAdmin(admin)}
                        disabled={actionLoading}
                      >
                        Remove
                      </Button>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="error" fontWeight={700} sx={{ display: "block", textAlign: "center" }}>
                      Only Super Admin can modify this
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Admin Dialog Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#6b091f", pt: 3 }}>
          Create New Admin Account
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create an official Admin account with login credentials. (Max 3 active Admins allowed).
          </Typography>

          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              error={Boolean(formErrors.displayName)}
              helperText={formErrors.displayName}
            />

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password || "Minimum 6 characters"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={Boolean(formErrors.confirmPassword)}
              helperText={formErrors.confirmPassword}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateAdmin}
            variant="contained"
            disabled={actionLoading}
            sx={{ bgcolor: "#6b091f", "&:hover": { bgcolor: "#4a0615" } }}
          >
            {actionLoading ? "Creating Admin..." : "Create Admin Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default AdminManagementPage;
