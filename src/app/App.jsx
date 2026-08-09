import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ErrorBoundary from "../components/common/ErrorBoundary";
import muiTheme from "../theme/muiTheme";
import { routes } from "./routes";

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
