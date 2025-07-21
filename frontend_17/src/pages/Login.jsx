import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import logo from "../assets/favicon.png";
import { loginUser } from "../api/authApi";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // isXs true for screens smaller than 'sm' (600px)

  // Use a ref to prevent race conditions or stale state if onLogin or navigate
  // cause immediate re-renders, though generally not strictly necessary for navigate.
  // We primarily use this useEffect for *initial* load checks.
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If a token and role exist on initial load, navigate directly
    // This handles cases where user refreshes or revisits the login page while already logged in
    if (token && role) {
      if (role === "admin") {
        navigate("/");
      } else if (role === "employee") {
        navigate("/employee/e_home");
      } else if (role === "client") {
        navigate("/client/c_home");
      }
    }
  }, [navigate]); // navigate is stable in React Router v6, so no re-renders for this dependency

  const handleLogin = async () => {
    setError(""); // Clear previous errors
    try {
      const normalizedEmail = email.trim();
      const normalizedPass = password.trim();

      // Basic validation
      if (!normalizedEmail || !normalizedPass) {
        setError("Email and password are required.");
        return;
      }

      const data = await loginUser(normalizedEmail, normalizedPass);

      // Save user data to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.name);
      localStorage.setItem("email", data.user.email);

      // Call the onLogin prop to update parent state/context (e.g., AuthContext)
      // It's crucial that this update doesn't cause a blocking render or re-direct
      // if the navigation is handled immediately below.
      onLogin(data.user.role); // This might trigger a state update in App.js or similar

      // Navigate based on user role immediately after successful login and data storage
      if (data.user.role === "admin") {
        navigate("/");
      } else if (data.user.role === "employee") {
        navigate("/employee/e_home");
      } else if (data.user.role === "client") {
        navigate("/client/e_home");
      } else {
        navigate("/unauthorized"); // Fallback for unknown roles
      }
    } catch (err) {
      // Handle API errors
      console.error("Login error:", err);
      // More specific error message if available from the backend
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to right, #f26522, #f9a826)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2, // Padding on all sides for small screens
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: isXs ? 3 : 5, // Smaller padding on extra small screens
          maxWidth: 420,
          width: "100%", // Ensures it takes full width up to maxWidth
          borderRadius: 4,
          textAlign: "center",
          backgroundColor: "#fff",
          boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
          // minHeight can prevent layout shifts on content load if needed
          minHeight: isXs ? "350px" : "450px", // Adjusted minHeight for xs to be slightly less rigid but still present
          display: "flex", // Use flexbox for inner content to help vertical alignment
          flexDirection: "column", // Stack children vertically
          justifyContent: "center", // Center content vertically within the paper
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: isXs ? 60 : 80, // Smaller logo on extra small screens
              height: isXs ? 60 : 80,
              objectFit: "contain",
              borderRadius: "50%",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
          />
        </Box>

        {/* Title */}
        <Typography variant={isXs ? "h6" : "h5"} fontWeight="bold" gutterBottom>
          Welcome
        </Typography>
        <Typography
          variant={isXs ? "body2" : "body1"}
          color="text.secondary"
          mb={3}
        >
          Please login to your account
        </Typography>

        {/* Email */}
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          size={isXs ? "small" : "medium"} // Smaller size on xs
        />

        {/* Password with Toggle */}
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          size={isXs ? "small" : "medium"} // Smaller size on xs
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  size={isXs ? "small" : "medium"} // Smaller icon button on xs
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Login Button */}
        <Button
          variant="contained"
          // Changed to primary for consistency with MUI's default theming,
          // or use your custom orange color explicitly if not configured in theme palette.
          // For example: sx={{ backgroundColor: "#f26522", "&:hover": { backgroundColor: "#e05a1d" } }}
          color="primary"
          fullWidth
          sx={{
            mt: 3,
            py: isXs ? 1 : 1.4, // Smaller padding on xs
            fontWeight: "bold",
            fontSize: isXs ? "14px" : "16px", // Smaller font size on xs
            borderRadius: "8px",
            backgroundColor: "#f26522", // Explicitly set your orange color
            "&:hover": {
              backgroundColor: "#e05a1d", // Darker orange on hover
            },
          }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
