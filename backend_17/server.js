// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Make sure cors is imported

const connectDB = require("./config/db");
require("./models");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const statusRoutes = require("./routes/statusRoutes");
const settingRoutes = require("./routes/settingRoutes");
const homeRoutes = require("./routes/homeRoute");
const ticketRoutes = require("./routes/ticketRoutes");
const projectRoutes = require("./routes/projectRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const timesheetRoutes = require("./routes/timesheetRoutes");
const emailRoutes = require("./routes/emailRoutes");
const commentRoutes = require("./routes/commentRoutes");
// const healthRoute = require("./routes/healthRoute");

const cronRoutes = require("./routes/cronRoutes");

const app = express();

// Middleware
// Define allowed origins for CORS
const allowedOrigins = [
  "https://erp-app-test.vercel.app",
  "http://localhost:5173", // For local development
  "http://localhost:3000", // If you also use Create React App locally
  "https://erp-app-blue.vercel.app", // Your primary deployed Vercel frontend URL
  "https://erp-app-git-main-saurabhp9s-projects.vercel.app", // The specific Vercel preview URL that was blocked
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      // or if the origin is in our allowed list.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log for debugging on Render if an unauthorized origin tries to connect
        console.error(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS")); // Block other origins
      }
    },
    credentials: true, // Important if your frontend sends cookies or session headers
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes

//CRON
app.use("/api/cron", cronRoutes);
// app.use("/health", healthRoute);

app.use("/api", require("./routes/tokenRoutes"));
app.use("/api/priority", require("./routes/priorityRoutes"));
app.use("/api/email", emailRoutes);
app.use("/api/timesheet", timesheetRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/comments", commentRoutes);

// Connect DB and then start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5050; // Your server is running on 10000 based on previous logs, ensure this matches or is flexible
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
