import React from "react";
import Navbar from "./Navbar";
import MinimalNavbar from "./MinimalNavbar";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../assets/favicon.png";
import { useNavigate } from "react-router-dom";

const Header = ({ role, setIsAuthenticated, setRole }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  // Media queries for different screen sizes
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up("lg")); // Greater than or equal to large
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md")); // Greater than or equal to medium
  const isMediumScreen = useMediaQuery(theme.breakpoints.between("sm", "md")); // Between small and medium
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Less than or equal to small
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("xs")); // Less than or equal to extra small

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setRole("");
    navigate("/login");
  };

  const username = localStorage.getItem("username") || "Unknown";

  // Helper to get current time and date
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const currentDate = new Date().toLocaleDateString();

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#fff",
        borderBottom: "1px solid #ddd",
        boxShadow: 2, // Add a subtle shadow for better visual separation
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: isSmallScreen ? 1 : 2, // Less padding on small screens
          py: isSmallScreen ? 0.5 : 1, // Less padding on small screens
          flexWrap: isSmallScreen ? "wrap" : "nowrap", // Allow wrapping on small screens
          gap: isSmallScreen ? 1 : 2, // Adjust gap
        }}
      >
        {/* Logo & Tagline */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
        >
          {" "}
          {/* minWidth:0 helps with shrinking */}
          <img
            src={logo}
            alt="Logo"
            style={{ height: isSmallScreen ? "35px" : "50px" }} // Smaller logo on small screens
          />
          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Typography
              sx={{
                color: "orange",
                fontWeight: "bold",
                fontSize: {
                  xs: "0.8rem", // Very small
                  sm: "1rem", // Small
                  md: "1.1rem", // Medium
                  lg: "1.25rem", // Large (original size)
                },
                whiteSpace: isSmallScreen ? "normal" : "nowrap", // Allow text wrapping on small screens
                overflow: "hidden", // Hide overflow if still too long
                textOverflow: "ellipsis", // Add ellipsis for overflowed text
                lineHeight: 1.2, // Adjust line height for wrapped text
              }}
            >
              CLICK ERP SERVICES PVT. LTD.
            </Typography>
            {!isExtraSmallScreen && ( // Hide tagline on very small screens
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: {
                    xs: "0.6rem", // Even smaller for very small screens
                    sm: "0.75rem", // Default caption size
                  },
                }}
              >
                Success… Just a Click Away…
              </Typography>
            )}
          </Box>
        </Box>

        {/* CLICK SUPPORT PORTAL Title */}
        {isLargeScreen && ( // Only show on large screens and above
          <Typography
            sx={{
              position: "absolute", // Keep position absolute for centering
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: "bold",
              fontSize: {
                md: "1rem",
                lg: "1.3rem", // Original size
              },
              color: "#333",
              whiteSpace: "nowrap",
              display: isLargeScreen ? "block" : "none", // Explicitly control display
            }}
          >
            CLICK SUPPORT PORTAL
          </Typography>
        )}

        {/* Time, Date, Logged In Info and Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: isSmallScreen ? 0.5 : 2, // Smaller gap on small screens
            ml: "auto", // Push this section to the right
            flexShrink: 0, // Prevent shrinking
          }}
        >
          {isLargeScreen && ( // Only show full time/date/role info on large screens
            <Box
              sx={{
                textAlign: "right",
                fontSize: "14px",
                color: "gray",
                whiteSpace: "nowrap",
              }}
            >
              <div>Time: {currentTime}</div>
              <div>Date: {currentDate}</div>
              <div>
                Logged in as <strong>{username}</strong> [{role}]
              </div>
            </Box>
          )}

          {!isLargeScreen &&
            !isExtraSmallScreen && ( // Show simplified info on medium/small screens, hide on extra small
              <Box
                sx={{
                  textAlign: "right",
                  fontSize: "12px",
                  color: "gray",
                  whiteSpace: "nowrap",
                }}
              >
                <div>
                  Hello, <strong>{username}</strong>!
                </div>
                <div>[{role}]</div>
              </Box>
            )}

          {!isLargeScreen &&
            isExtraSmallScreen && ( // Only username for extra small screens
              <Box
                sx={{
                  textAlign: "right",
                  fontSize: "10px",
                  color: "gray",
                  whiteSpace: "nowrap",
                }}
              >
                <div>
                  Hi, <strong>{username}</strong>
                </div>
              </Box>
            )}

          {/* Notifications & Logout always present, but maybe smaller */}
          <Tooltip title="Notifications">
            <IconButton
              color="primary"
              size={isSmallScreen ? "small" : "medium"}
            >
              <NotificationsNoneIcon
                sx={{ fontSize: isSmallScreen ? "1.2rem" : "inherit" }}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton
              color="error"
              onClick={handleLogout}
              size={isSmallScreen ? "small" : "medium"}
            >
              <LogoutIcon
                sx={{ fontSize: isSmallScreen ? "1.2rem" : "inherit" }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Role-based Navbar */}
      <Box sx={{ display: isExtraSmallScreen ? "none" : "block" }}>
        {" "}
        {/* Hide main nav completely on extra small screens */}
        {role === "admin" ? <Navbar /> : <MinimalNavbar />}
      </Box>
    </Box>
  );
};

export default Header;
