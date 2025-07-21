// import React from "react";
// import { Box, Typography } from "@mui/material";

// const Footer = () => {
// return (
// <Box
// component="footer"
// sx={{
// backgroundColor: "#1f2225",
// color: "#ccc",
// textAlign: "center",
// py: 1.5,
// mt: "auto",
// }}
// >
// <Typography variant="body2">
// ©2025 Click ERP Services Pvt. Ltd.
// </Typography>
// </Box>
// );
// };

// export default Footer;

import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

const Footer = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // True for screens smaller than 'sm' (e.g., mobile)

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1f2225",
        color: "#ccc",
        textAlign: "center",
        py: isSmallScreen ? 1 : 1.5, // Smaller vertical padding on small screens
        mt: "auto", // Pushes the footer to the bottom of the page
        width: "100%", // Ensures it spans the full width
        boxSizing: "border-box", // Includes padding in the width calculation
      }}
    >
      <Typography
        variant={isSmallScreen ? "caption" : "body2"}
        sx={{ fontSize: isSmallScreen ? "0.7rem" : "0.875rem" }}
      >
        ©2025 Click ERP Services Pvt. Ltd.
      </Typography>
    </Box>
  );
};

export default Footer;
