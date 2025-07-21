import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Box,
  Collapse,
  Typography, // <--- CORRECTED: Typography is now properly imported
} from "@mui/material";
import {
  ArrowDropDown,
  Menu as MenuIcon, // Hamburger icon
  ExpandLess, // Icon for expanded state in drawer
  ExpandMore, // Icon for collapsed state in drawer
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";

// Role-based tab configuration
const tabs = [
  { name: "HOME", path: "/" },
  { name: "TICKET", path: "/ticket" },
  { name: "USER", path: "/user" },
  { name: "TIMESHEET", path: "/timesheet" },
  { name: "EMPLOYEE", path: "/employee" },
  { name: "MASTERS", path: null }, // Signifies a dropdown
  { name: "SETTING", path: null }, // Signifies a dropdown
  { name: "REPORTS", path: "/reports" },
  { name: "HELP", path: "/help" },
];

const masterOptions = [
  { name: "Project List", path: "/masters/project-list" },
  { name: "Category", path: "/masters/category" },
  { name: "Department", path: "/masters/department" },
  { name: "Status", path: "/masters/status" },
  { name: "Priority", path: "/masters/priority" },
];

const settingOptions = [
  { name: "Organization Details", path: "/setting/organization-details" },
  { name: "Parameters", path: "/setting/parameters" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Media query to determine if we should show mobile (drawer) navigation
  // 'md' breakpoint is typically 900px. So, screens smaller than 900px will use the mobile nav.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for horizontal dropdown menus
  const [anchorMasters, setAnchorMasters] = useState(null);
  const [anchorSetting, setAnchorSetting] = useState(null);

  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  // States for expandable sections within the mobile drawer
  const [mastersOpen, setMastersOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);

  // Handlers for horizontal dropdown menus
  const handleDropdownClick = (event, type) => {
    if (type === "MASTERS") setAnchorMasters(event.currentTarget);
    if (type === "SETTING") setAnchorSetting(event.currentTarget);
  };

  const handleDropdownClose = (path = null, type) => {
    if (type === "MASTERS") setAnchorMasters(null);
    if (type === "SETTING") setAnchorSetting(null);
    if (path) navigate(path);
  };

  // Handlers for mobile drawer
  const toggleDrawer = (open) => (event) => {
    // Prevent closing if a tab or shift key is pressed (accessibility)
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleDrawerItemClick = (path = null, type) => {
    // Close any open collapsible sections in the drawer when navigating or opening another section
    setMastersOpen(false);
    setSettingOpen(false);

    if (path) {
      navigate(path);
      setDrawerOpen(false); // Close the drawer after navigation
    } else if (type === "MASTERS") {
      setMastersOpen(!mastersOpen); // Toggle Masters collapse
    } else if (type === "SETTING") {
      setSettingOpen(!settingOpen); // Toggle Setting collapse
    }
  };

  // Styles for active NavLink in horizontal menu
  const activeLinkStyle = {
    fontWeight: "bold",
    backgroundColor: "#000", // Active background
    color: "white",
    borderRadius: 0,
    padding: "6px 16px",
    textDecoration: "none", // Ensure no underline
  };

  // Default style for NavLink in horizontal menu
  const defaultLinkStyle = {
    fontWeight: "bold",
    color: "white",
    borderRadius: 0,
    padding: "6px 16px",
    textDecoration: "none", // Ensure no underline
  };

  // Component to render the horizontal navigation for larger screens
  const renderHorizontalNav = () => (
    <AppBar position="static" sx={{ backgroundColor: "#f26522", boxShadow: 0 }}>
      <Toolbar
        sx={{ justifyContent: "center", gap: 2, minHeight: "auto", py: 1 }}
      >
        {tabs.map((tab) => {
          if (tab.name === "MASTERS") {
            return (
              <div key={tab.name}>
                <Button
                  onClick={(e) => handleDropdownClick(e, "MASTERS")}
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderRadius: 0,
                    padding: "6px 16px",
                    "&:hover": {
                      backgroundColor: "#000",
                      opacity: 0.9,
                    },
                  }}
                  endIcon={<ArrowDropDown />}
                >
                  MASTERS
                </Button>
                <Menu
                  anchorEl={anchorMasters}
                  open={Boolean(anchorMasters)}
                  onClose={() => handleDropdownClose(null, "MASTERS")}
                  MenuListProps={{ sx: { py: 0 } }} // Remove default padding from MenuList
                >
                  {masterOptions.map((item) => (
                    <MenuItem
                      key={item.name}
                      onClick={() => handleDropdownClose(item.path, "MASTERS")}
                      sx={{
                        minHeight: 36, // Ensure consistent height for menu items
                        "&:hover": {
                          backgroundColor: "#eee", // Lighter hover for MenuItem
                        },
                      }}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            );
          }

          if (tab.name === "SETTING") {
            return (
              <div key={tab.name}>
                <Button
                  onClick={(e) => handleDropdownClick(e, "SETTING")}
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    borderRadius: 0,
                    padding: "6px 16px",
                    "&:hover": {
                      backgroundColor: "#000",
                      opacity: 0.9,
                    },
                  }}
                  endIcon={<ArrowDropDown />}
                >
                  SETTING
                </Button>
                <Menu
                  anchorEl={anchorSetting}
                  open={Boolean(anchorSetting)}
                  onClose={() => handleDropdownClose(null, "SETTING")}
                  MenuListProps={{ sx: { py: 0 } }}
                >
                  {settingOptions.map((item) => (
                    <MenuItem
                      key={item.name}
                      onClick={() => handleDropdownClose(item.path, "SETTING")}
                      sx={{
                        minHeight: 36,
                        "&:hover": {
                          backgroundColor: "#eee",
                        },
                      }}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            );
          }

          return (
            <Button
              key={tab.name}
              component={NavLink}
              to={tab.path}
              // Uses a function to determine style based on NavLink's isActive state
              style={({ isActive }) =>
                isActive ? activeLinkStyle : defaultLinkStyle
              }
              sx={{
                "&:hover": {
                  backgroundColor: "#000",
                  opacity: 0.9,
                },
              }}
            >
              {tab.name}
            </Button>
          );
        })}
      </Toolbar>
    </AppBar>
  );

  // Component to render the mobile (drawer) navigation for smaller screens
  const renderMobileNav = () => (
    <AppBar position="static" sx={{ backgroundColor: "#f26522", boxShadow: 0 }}>
      <Toolbar sx={{ justifyContent: "flex-start", py: 1 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon /> {/* Hamburger icon */}
        </IconButton>
        {/* Title for the mobile AppBar */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: "white" }}
        >
          Menu
        </Typography>
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250, bgcolor: "#fff", height: "100%" }}
          role="presentation"
          // Close drawer on clicking outside a nested list item, but keep open for collapsible sections
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {tabs.map((tab) => {
              if (tab.name === "MASTERS") {
                return (
                  <React.Fragment key={tab.name}>
                    <ListItem
                      button
                      onClick={() => handleDrawerItemClick(null, "MASTERS")}
                    >
                      <ListItemText primary="MASTERS" />
                      {mastersOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={mastersOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {masterOptions.map((item) => (
                          <ListItem
                            button
                            key={item.name}
                            onClick={() => handleDrawerItemClick(item.path)}
                            sx={{ pl: 4 }} // Indent nested items
                          >
                            <ListItemText primary={item.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
              }

              if (tab.name === "SETTING") {
                return (
                  <React.Fragment key={tab.name}>
                    <ListItem
                      button
                      onClick={() => handleDrawerItemClick(null, "SETTING")}
                    >
                      <ListItemText primary="SETTING" />
                      {settingOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={settingOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {settingOptions.map((item) => (
                          <ListItem
                            button
                            key={item.name}
                            onClick={() => handleDrawerItemClick(item.path)}
                            sx={{ pl: 4 }}
                          >
                            <ListItemText primary={item.name} />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </React.Fragment>
                );
              }

              return (
                <ListItem
                  button
                  key={tab.name}
                  component={NavLink}
                  to={tab.path}
                  // Apply active styles for NavLink within the drawer
                  style={({ isActive }) => ({
                    backgroundColor: isActive
                      ? theme.palette.action.selected
                      : "inherit", // Example active background for Drawer
                    color: isActive ? theme.palette.primary.main : "inherit", // Example active text color for Drawer
                    fontWeight: isActive ? "bold" : "normal",
                    textDecoration: "none", // Remove underline
                  })}
                  onClick={() => handleDrawerItemClick(tab.path)} // Close drawer on click of a main item
                >
                  <ListItemText primary={tab.name} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );

  // Main render logic: show horizontal or mobile nav based on screen size
  return <>{isMobile ? renderMobileNav() : renderHorizontalNav()}</>;
};

export default Navbar;
