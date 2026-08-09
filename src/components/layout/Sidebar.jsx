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
import { ROLE_LABELS } from "../../utils/constants";

const DRAWER_WIDTH = 260;

function SidebarContent({ onNavigate }) {
  const { userProfile } = useAuth();
  const { role, displayName } = useRole();

  const getRoleColor = () => {
    if (role === "admin") return "error";
    if (role === "coach") return "warning";
    return "primary";
  };

  const navItems = [
    {
      label: "Dashboard",
      path:
        role === "admin"
          ? "/admin/dashboard"
          : role === "coach"
            ? "/coach/dashboard"
            : "/player/dashboard",
      icon: <DashboardIcon />,
    },
  ];

  if (role === "player") {
    navItems.push(
      {
        label: "Browse Tournaments",
        path: "/tournaments",
        icon: <EmojiEventsIcon />,
      },
      {
        label: "My Registrations",
        path: "/my-tournaments",
        icon: <AssignmentTurnedInIcon />,
      }
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#0f172a", color: "#f8fafc" }}>
      <Toolbar sx={{ px: 2.5, py: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
            }}
          >
            <SportsScoreIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif', letterSpacing: -0.5, lineHeight: 1.1 }}>
              SportSphere
            </Typography>
            <Chip
              label={`${ROLE_LABELS[role] || "User"} Portal`}
              color={getRoleColor()}
              size="small"
              sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, mt: 0.5 }}
            />
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)", mb: 2 }} />

      <Box sx={{ flexGrow: 1, px: 2 }}>
        <Typography variant="caption" sx={{ color: "#64748b", textTransform: "uppercase", fontWeight: 700, px: 1.5, letterSpacing: 0.8 }}>
          Navigation
        </Typography>
        <List sx={{ pt: 1 }}>


          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
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
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>
          ))}

          {role === "player" && (
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
                <WorkspacePremiumIcon />
              </ListItemIcon>
              <ListItemText primary="My Certificates" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
            </ListItemButton>
          )}

          {role === "admin" && (
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
                  <WorkspacePremiumIcon />
                </ListItemIcon>
                <ListItemText primary="Certificates" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
              </ListItemButton>
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
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="User Profile" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.92rem" }} />
          </ListItemButton>

        </List>
      </Box>

      {/* User Footer Profile Card */}
      <Box sx={{ p: 2, m: 2, bgcolor: "rgba(255, 255, 255, 0.04)", borderRadius: 3, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "secondary.main",
              color: "#fff",
              width: 38,
              height: 38,
              fontSize: "0.95rem",
              fontWeight: 700,
            }}
          >
            {String(displayName || userProfile?.email || "User").substring(0, 2).toUpperCase()}
          </Avatar>

          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "#ffffff" }}>
              {displayName || "User"}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: "#64748b", display: "block" }}>
              {userProfile?.email || ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Sidebar({ mobileOpen, onMobileClose }) {
  const drawerProps = {
    sx: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
        borderRight: "1px solid #1e293b",
      },
    },
  };

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          ...drawerProps.sx,
        }}
      >
        <SidebarContent onNavigate={onMobileClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          ...drawerProps.sx,
        }}
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}

export default Sidebar;

