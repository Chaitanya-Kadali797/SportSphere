import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { signOut } from "../../services/authService";
import { useAuth, useRole } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../utils/constants";
import Sidebar from "./Sidebar";

function Navbar({ onMenuClick }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { userProfile } = useAuth();
  const { role, displayName } = useRole();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 1.5, color: "text.primary" }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        )}

        {isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <SportsScoreIcon sx={{ color: "primary.main" }} />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "text.primary",
                fontWeight: 800,
                fontFamily: '"Outfit", sans-serif',
              }}
            >
              SportSphere
            </Typography>
          </Box>
        )}

        {!isMobile && (
          <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ flexGrow: 1 }}>
            Multi-Sport Tournament Management Platform
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, color: "text.primary" }}>
              {displayName || userProfile?.email}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {ROLE_LABELS[role] || "User"}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: "primary.main",
              color: "#fff",
              width: 36,
              height: 36,
              fontSize: "0.88rem",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(30, 58, 138, 0.25)",
            }}
          >
            {String(displayName || userProfile?.email || "User").substring(0, 2).toUpperCase()}
          </Avatar>


          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            size="small"
            sx={{
              borderRadius: 2,
              px: 2,
              py: 0.6,
              fontWeight: 600,
              borderColor: "#cbd5e1",
              color: "#475569",
              "&:hover": {
                borderColor: "#94a3b8",
                bgcolor: "#f1f5f9",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            py: { xs: 2.5, sm: 4 },
            px: { xs: 2, sm: 4 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export default DashboardLayout;

