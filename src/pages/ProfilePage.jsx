import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DashboardLayout from "../components/layout/Navbar";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { updateUserProfile } from "../services/userService";
import { SPORTS } from "../utils/constants";
import { updateProfile } from "firebase/auth";

function ProfilePage() {
  const { user, userProfile, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [organization, setOrganization] = useState(userProfile?.organization || "");
  const [preferredSport, setPreferredSport] = useState(userProfile?.preferredSport || "");
  const [bio, setBio] = useState(userProfile?.bio || "");

  // Sync form inputs whenever userProfile finishes loading from Firebase
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setPhone(userProfile.phone || "");
      setOrganization(userProfile.organization || "");
      setPreferredSport(userProfile.preferredSport || "");
      setBio(userProfile.bio || "");
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage("");

    try {
      const updates = {
        displayName: displayName.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        preferredSport,
        bio: bio.trim(),
      };

      if (userProfile?.uid) {
        await updateUserProfile(userProfile.uid, updates);
      }

      if (user && displayName.trim() !== user.displayName) {
        await updateProfile(user, { displayName: displayName.trim() });
      }

      if (userProfile) {
        Object.assign(userProfile, updates);
      }

      setSuccessMessage("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError(null);
    setDisplayName(userProfile?.displayName || "");
    setPhone(userProfile?.phone || "");
    setOrganization(userProfile?.organization || "");
    setPreferredSport(userProfile?.preferredSport || "");
    setBio(userProfile?.bio || "");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="User Profile"
        subtitle="Manage your personal information, role status, and sport preferences."
        action={
          !editing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : null
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* User Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 1, textAlign: "center" }}>
            <CardContent>
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  boxShadow: "0 4px 14px rgba(30, 58, 138, 0.3)",
                }}
              >
                {(userProfile?.displayName || userProfile?.email || "U").substring(0, 2).toUpperCase()}
              </Avatar>

              <Typography variant="h6" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif' }}>
                {userProfile?.displayName || userProfile?.email || "User"}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {userProfile?.email}
              </Typography>

              <Chip
                label={`${(role || "player").toUpperCase()} ACCOUNT`}
                color={role === "admin" ? "error" : role === "coach" ? "warning" : "primary"}
                size="small"
                sx={{ fontWeight: 700, px: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Account & Personal Information
                </Typography>
                {!editing && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              {editing ? (
                /* EDIT FORM */
                <Box component="form" onSubmit={handleSave} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="School / Organization"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="e.g. State University / Sports Club"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Preferred Sport"
                        value={preferredSport}
                        onChange={(e) => setPreferredSport(e.target.value)}
                      >
                        <MenuItem value="">Select Preferred Sport</MenuItem>
                        {SPORTS.map((sport) => (
                          <MenuItem key={sport.id} value={sport.name}>
                            {sport.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Bio / Athlete Notes"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Brief overview of playing experience or athletic achievements..."
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 1 }}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<CancelIcon />}
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                /* DISPLAY VIEW */
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                      {userProfile?.email || "—"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Display Name
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                      {userProfile?.displayName || "Not configured"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                      {userProfile?.phone || "Not configured"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      School / Organization
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                      {userProfile?.organization || "Not configured"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Preferred Sport
                    </Typography>
                    <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                      {userProfile?.preferredSport || "Not configured"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      User Account ID (UID)
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: "break-all", mt: 0.5, fontFamily: "monospace" }}>
                      {userProfile?.uid || "—"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      Bio / Athlete Notes
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 0.5, color: "text.secondary", whiteSpace: "pre-line" }}>
                      {userProfile?.bio || "No bio provided."}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default ProfilePage;



