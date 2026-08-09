import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1e3a8a", // Deep Royal Navy Blue
      light: "#3b82f6",
      dark: "#1e293b",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#f59e0b", // Warm Gold/Amber
      light: "#fbbf24",
      dark: "#d97706",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    success: {
      main: "#10b981",
      light: "#d1fae5",
    },
    warning: {
      main: "#f59e0b",
      light: "#fef3c7",
    },
    error: {
      main: "#ef4444",
      light: "#fee2e2",
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    "none",
    "0px 1px 2px 0px rgba(15, 23, 42, 0.05)",
    "0px 2px 4px 0px rgba(15, 23, 42, 0.06)",
    "0px 4px 8px -2px rgba(15, 23, 42, 0.08)",
    "0px 8px 16px -4px rgba(15, 23, 42, 0.1)",
    "0px 12px 24px -6px rgba(15, 23, 42, 0.12)",
    ...Array(19).fill("0px 16px 32px -8px rgba(15, 23, 42, 0.15)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(30, 58, 138, 0.2)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          boxShadow: "0px 4px 12px -2px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
  },
});

export default muiTheme;

