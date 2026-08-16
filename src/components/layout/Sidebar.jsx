import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { NavLink } from "react-router-dom";
import { useAuth, useRole } from "../../hooks/useAuth";
import { ROLE_LABELS, ROLES } from "../../utils/constants";

const DRAWER_WIDTH = 260;

function SidebarContent({ onNavigate }) {
  const { userProfile } = useAuth();
  const { role, isSuperAdmin, isAdmin, isAnyAdmin } = useRole();

  const getRoleColor = () => {
    if (isSuperAdmin) return "error";
    if (isAdmin) return "error";
    if (role === ROLES.COACH) return "warning";
    return "primary";
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return "Super Admin";
    if (isAdmin) return "Admin";
    return ROLE_LABELS[role] || "User";
  };

  const dashboardPath = isAnyAdmin
    ? "/admin/dashboard"
    : role === ROLES.COACH
    ? "/coach/dashboard"
    : "/player/dashboard";

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#0f172a", color: "#f8fafc" }}>
      <Toolbar sx={{ px: 3, py: 2 }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: "#ffffff", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
          <SportsSoccerIcon sx={{ color: "#2563eb" }} /> SportSphere
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

      {/* User Profile Card */}
      <Box sx={{ p: 2.5, mx: 2, my: 2, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Avatar sx={{ bgcolor: "#2563eb", width: 40, height: 40, fontWeight: 700 }}>
            {(userProfile?.displayName || "U")[0].toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: "#ffffff" }}>
              {userProfile?.displayName || "User"}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: "#94a3b8", display: "block" }}>
              {userProfile?.email || ""}
            </Typography>
          </Box>
        </Box>
        <Chip
          label={getRoleLabel()}
          color={getRoleColor()}
          size="small"
          sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
        />
      </Box>

      {/* Nav Menu */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        <ListItemButton
          component={NavLink}
          to={dashboardPath}
          onClick={onNavigate}
          sx={{
            borderRadius: 2.5,
            mb: 0.8,
            px: 2,
            py: 1.2,
            color: "#94a3b8",
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
            },
            "&.active": {
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              "& .MuiListItemIcon-root": { color: "#ffffff" },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
        </ListItemButton>

        {/* Player Navigation */}
        {role === ROLES.PLAYER && (
          <>
            <ListItemButton
              component={NavLink}
              to="/tournaments"
              onClick={onNavigate}
              sx={{
                borderRadius: 2.5,
                mb: 0.8,
                px: 2,
                py: 1.2,
                color: "#94a3b8",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
                "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <EmojiEventsIcon />
              </ListItemIcon>
              <ListItemText primary="Browse Tournaments" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>

            <ListItemButton
              component={NavLink}
              to="/my-tournaments"
              onClick={onNavigate}
              sx={{
                borderRadius: 2.5,
                mb: 0.8,
                px: 2,
                py: 1.2,
                color: "#94a3b8",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
                "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <AssignmentTurnedInIcon />
              </ListItemIcon>
              <ListItemText primary="My Registrations" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>

            <ListItemButton
              component={NavLink}
              to="/my-certificates"
              onClick={onNavigate}
              sx={{
                borderRadius: 2.5,
                mb: 0.8,
                px: 2,
                py: 1.2,
                color: "#94a3b8",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
                "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <WorkspacePremiumIcon />
              </ListItemIcon>
              <ListItemText primary="My Certificates" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>
          </>
        )}

        {/* Admin Navigation */}
        {isAnyAdmin && (
          <>
            <ListItemButton
              component={NavLink}
              to="/admin/sports"
              onClick={onNavigate}
              sx={{
                borderRadius: 2.5,
                mb: 0.8,
                px: 2,
                py: 1.2,
                color: "#94a3b8",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
                "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <SportsSoccerIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Sports" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>

            <ListItemButton
              component={NavLink}
              to="/admin/tournaments"
              onClick={onNavigate}
              sx={{
                borderRadius: 2.5,
                mb: 0.8,
                px: 2,
                py: 1.2,
                color: "#94a3b8",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
                "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <EmojiEventsIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Tournaments" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>

            <ListItemButton
              component={NavLink}
              to="/admin/certificates"
              onClick={onNavigate}
              sx={{
                borderRadius: 2.5,
                mb: 0.8,
                px: 2,
                py: 1.2,
                color: "#94a3b8",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
                "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <WorkspacePremiumIcon />
              </ListItemIcon>
              <ListItemText primary="Certificates" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>

            {isSuperAdmin && (
              <ListItemButton
                component={NavLink}
                to="/admin/users"
                onClick={onNavigate}
                sx={{
                  borderRadius: 2.5,
                  mb: 0.8,
                  px: 2,
                  py: 1.2,
                  color: "#94a3b8",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
                  "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Admin Management" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
              </ListItemButton>
            )}
          </>
        )}

        <ListItemButton
          component={NavLink}
          to="/verify-certificate"
          onClick={onNavigate}
          sx={{
            borderRadius: 2.5,
            mb: 0.8,
            px: 2,
            py: 1.2,
            color: "#94a3b8",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
            "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <VerifiedUserIcon />
          </ListItemIcon>
          <ListItemText primary="Verify Certificate" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
        </ListItemButton>

        <ListItemButton
          component={NavLink}
          to="/profile"
          onClick={onNavigate}
          sx={{
            borderRadius: 2.5,
            mb: 0.8,
            px: 2,
            py: 1.2,
            color: "#94a3b8",
            "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)", color: "#ffffff" },
            "&.active": { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile Settings" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
        </ListItemButton>
      </List>
    </Box>
  );
}

export function Sidebar({ mobileOpen, onClose }) {
  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH, border: "none" },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: DRAWER_WIDTH, border: "none" },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
}

export default Sidebar;
