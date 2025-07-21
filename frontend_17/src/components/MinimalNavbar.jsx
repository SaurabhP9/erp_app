import React from "react";
import {
  AppBar,
  Toolbar,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { NavLink } from "react-router-dom";

// Role-based tab configuration
const TABS = {
  employee: [
    { name: "HOME", path: "/employee/e_home" },
    { name: "TICKET", path: "/employee/my-tickets" },
    { name: "TIMESHEET", path: "/employee/my-timesheet" },
  ],
  client: [
    { name: "HOME", path: "/client/e_home" },
    { name: "TICKET", path: "/client/my-tickets" },
  ],
};

const MinimalNavbar = () => {
  const role = localStorage.getItem("role");
  const tabs = TABS[role] || [];

  const theme = useTheme();
  // Check if screen is small (e.g., mobile)
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Hide navbar for undefined roles or if tabs are empty
  if (tabs.length === 0) return null;

  return (
    <AppBar position="static" sx={{ backgroundColor: "#f26522", boxShadow: 0 }}>
      {" "}
      {/* Remove default shadow */}
      <Toolbar
        sx={{
          justifyContent: isSmallScreen ? "flex-start" : "center", // Align left on small screens
          gap: isSmallScreen ? 0.5 : 2, // Smaller gap on small screens
          px: isSmallScreen ? 1 : 2, // Smaller horizontal padding on small screens
          minHeight: "auto", // Allow toolbar to shrink vertically if content wraps
          flexWrap: "wrap", // Allow items to wrap to the next line
          py: isSmallScreen ? 0.5 : 1, // Add vertical padding to ensure wrapped items are visible
        }}
      >
        {tabs.map(({ name, path }) => (
          <Button
            key={name}
            component={NavLink}
            to={path}
            style={({ isActive }) => ({
              fontWeight: "bold",
              backgroundColor: isActive ? "#000" : "inherit",
              color: "white",
              borderRadius: 0,
              // Responsive padding
              padding: isSmallScreen ? "4px 8px" : "6px 16px",
              // Responsive font size
              fontSize: isSmallScreen ? "0.7rem" : "0.875rem", // '0.875rem' is default body2/button font size
              minWidth: 0, // Allow button to shrink content
              flexShrink: 0, // Prevent button from shrinking too much if space is tight
              whiteSpace: "nowrap", // Prevent text from wrapping inside button
            })}
            sx={{
              // Add hover effect with MUI's sx prop for better consistency
              "&:hover": {
                backgroundColor: "#000",
                opacity: 0.9,
              },
            }}
          >
            {name}
          </Button>
        ))}
      </Toolbar>
    </AppBar>
  );
};

export default MinimalNavbar;
