import React from "react";
import { Box, Button, Typography, Paper } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f8fafc",
            p: 3,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: "100%", textAlign: "center", borderRadius: 3 }}>
            <Typography variant="h5" color="error" fontWeight={800} gutterBottom>
              Application Error
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              An unexpected error occurred while rendering the page.
            </Typography>
            {this.state.error && (
              <Box
                sx={{
                  bgcolor: "#fee2e2",
                  color: "#991b1b",
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                  textAlign: "left",
                  fontFamily: "monospace",
                  fontSize: 13,
                  overflowX: "auto",
                }}
              >
                <strong>Error:</strong> {this.state.error.toString()}
              </Box>
            )}
            <Button variant="contained" color="primary" onClick={this.handleReset}>
              Reload Application
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
