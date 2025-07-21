// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

const app = express();

// Middleware
// Enable CORS for all origins or specific origin
app.use(
  cors({
    origin: "http://localhost:5173", // or use "*" for all (not recommended for prod)
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
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
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
