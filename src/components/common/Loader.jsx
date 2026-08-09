import { Box, CircularProgress } from "@mui/material";

function Loader({ message = "Loading..." }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 2,
      }}
    >
      <CircularProgress color="primary" />
      <Box component="span" sx={{ color: "text.secondary", fontSize: 14 }}>
        {message}
      </Box>
    </Box>
  );
}

export default Loader;
