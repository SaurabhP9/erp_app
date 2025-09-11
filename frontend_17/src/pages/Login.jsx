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
  CircularProgress, // Import CircularProgress for the spinner
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
  const [loading, setLoading] = useState(false); // New state for loading

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // isXs true for screens smaller than 'sm' (600px)

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "admin") {
        navigate("/");
      } else if (role === "employee") {
        navigate("/employee/e_home");
      } else if (role === "client") {
        // navigate("/client/e_home");
        window.location.href = "/client/e_home";
      }
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError(""); // Clear previous errors
    setLoading(true); // Set loading to true when login attempt starts
    try {
      const normalizedEmail = email.trim();
      const normalizedPass = password.trim();

      // Basic validation
      if (!normalizedEmail || !normalizedPass) {
        setError("Email and password are required.");
        setLoading(false); // Stop loading if validation fails
        return;
      }

      const data = await loginUser(normalizedEmail, normalizedPass);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.name);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("department", data.user.department);
      console.log(data.user);

      onLogin(data.user.role);

      if (data.user.role === "admin") {
        navigate("/");
      } else if (data.user.role === "employee") {
        navigate("/employee/e_home");
      } else if (data.user.role === "client") {
        navigate("/client/e_home");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false); // Set loading to false once the API call finishes (success or failure)
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
        p: 2,
        position: "relative", // Added for the overlay positioning
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: isXs ? 3 : 5,
          maxWidth: 420,
          width: "100%",
          borderRadius: 4,
          textAlign: "center",
          backgroundColor: "#fff",
          boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
          minHeight: isXs ? "350px" : "450px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 3 }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: isXs ? 60 : 80,
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
          size={isXs ? "small" : "medium"}
          disabled={loading} // Disable while loading
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
          size={isXs ? "small" : "medium"}
          disabled={loading} // Disable while loading
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  size={isXs ? "small" : "medium"}
                  disabled={loading} // Disable while loading
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
          color="primary"
          fullWidth
          sx={{
            mt: 3,
            py: isXs ? 1 : 1.4,
            fontWeight: "bold",
            fontSize: isXs ? "14px" : "16px",
            borderRadius: "8px",
            backgroundColor: "#f26522",
            "&:hover": {
              backgroundColor: "#e05a1d",
            },
          }}
          onClick={handleLogin}
          disabled={loading} // Keep the button disabled
        >
          Login
        </Button>
      </Paper>

      {/* Full-screen Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: "fixed", // Use fixed to cover the entire viewport
            top: 0,
            left: 0,
            width: "100vw", // Viewport width
            height: "100vh", // Viewport height
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
            zIndex: 9999, // Ensure it's on top of everything
          }}
        >
          <CircularProgress size={isXs ? 60 : 80} color="primary" />{" "}
          {/* Larger spinner */}
        </Box>
      )}
    </Box>
  );
};

export default Login;
