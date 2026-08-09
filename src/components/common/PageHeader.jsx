import { Box, Typography } from "@mui/material";

function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        mb: 4,
        pb: 2,
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={800}
          sx={{
            fontFamily: '"Outfit", sans-serif',
            color: "#0f172a",
            letterSpacing: "-0.5px",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}

export default PageHeader;

