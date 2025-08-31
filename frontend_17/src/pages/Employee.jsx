import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  InputAdornment,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import {
  getAllUsersByRole,
  updateUser,
  createUser,
  deleteUser,
} from "../api/userApi";
import { getAllProjects } from "../api/projectApi";
import { getAllDepartments } from "../api/departmentApi";

// Define a maximum height for the table container for better scrolling experience
const TABLE_MAX_HEIGHT_LARGE = "calc(100vh - 400px)";
const TABLE_MAX_HEIGHT_MEDIUM = "calc(100vh - 250px)";
const TABLE_MAX_HEIGHT_SMALL = "calc(100vh - 230px)";

export default function Dashboard() {
  const [empUsers, setEmpUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editEmp, setEditEmp] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emptyForm = {
    name: "",
    email: "",
    mobile: "",
    departmentId: "",
    department: "",
    role: "employee",
    projectIds: [],
    projects: [],
    password: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // State to control department field disablement
  // Set to true to disable department by default as requested
  const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(true);

  // 💡 Responsiveness hooks
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empls, projs, depts] = await Promise.all([
          getAllUsersByRole("employee"),
          getAllProjects(),
          getAllDepartments(),
        ]);
        setEmpUsers(empls);
        setProjects(projs);
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        showSnackbar("Failed to load data. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to show Snackbar messages
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
  };

  const handleProjectChange = (event) => {
    const { value } = event.target;
    const selectedIds = typeof value === "string" ? value.split(",") : value;
  
    setForm({
      ...form,
      projectIds: selectedIds,
      projects: projects
        .filter((p) => selectedIds.includes(p._id))
        .map((p) => p.project),
    });
    setFormErrors((prev) => ({ ...prev, projects: "" }));
  };
  

  const validateForm = () => {
    let errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid.";
    }
    if (!form.mobile.trim()) {
      errors.mobile = "Mobile is required.";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      errors.mobile = "Mobile number must be 10 digits.";
    }
    if (!editEmp && !form.password.trim()) {
      errors.password = "Password is required."; // Password required only for new employee
    } else if (!editEmp && form.password.trim().length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    // ⭐ ONLY validate department if it's NOT disabled
    if (!isDepartmentDisabled && !form.department) {
      errors.department = "Department is required.";
    }

    if (!Array.isArray(form.projectIds) || form.projectIds.length === 0) {
      errors.projects = "At least one project must be selected.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showSnackbar("Please correct the form errors.", "error");
      return;
    }

    try {
      const submitForm = { ...form };

      // Handle department value based on disabled state for submission
      if (isDepartmentDisabled) {
        // If department is disabled, you might want to:
        // 1. Delete the field from the payload (if backend ignores it)
        delete submitForm.department;
        // 2. Or, set it to a specific default value (e.g., null, empty string, or a specific ID)
        // submitForm.department = null; // Or some default_department_id
      } else {
        // If department is enabled, ensure its ID is sent
        submitForm.department = form.department;
      }

      let message = "";
      if (editEmp) {
        // If editing, also pass the employee's ID and exclude password if not changed
        const updatePayload = { ...submitForm };
        if (submitForm.password === "") {
          // Don't send empty password on update if it wasn't explicitly changed
          delete updatePayload.password;
        }
        const updated = await updateUser(editEmp._id, updatePayload);
        setEmpUsers(empUsers.map((e) => (e._id === updated._id ? updated : e)));
        message = "Employee updated successfully!";
      } else {
        const created = await createUser(submitForm);
        setEmpUsers([...empUsers, created]);
        message = "Employee added successfully!";
      }
      showSnackbar(message, "success");
      handleCloseDialog();
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Unknown error";
      showSnackbar(`Failed to save employee: ${errorMessage}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteUser(id);
        setEmpUsers(empUsers.filter((e) => e._id !== id));
        showSnackbar("Employee deleted successfully!", "success");
      } catch (err) {
        console.error("Delete error:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Unknown error";
        showSnackbar(`Failed to delete employee: ${errorMessage}`, "error");
      }
    }
  };

  const handleOpenAddDialog = () => {
    setEditEmp(null);

    const functionalDept = departments.find(
      (d) => d.department?.toLowerCase().includes("functional")
    );

    setForm({
      ...emptyForm,
      departmentId: functionalDept?._id || "",
      department: functionalDept?.department || "",
    });

    setShowPassword(false);
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (emp) => {
    setEditEmp(emp);

    // derive projectIds
    const derivedIds =
      Array.isArray(emp.projectIds) && emp.projectIds.length > 0
        ? emp.projectIds
        : projects
          .filter((p) => (emp.projects || []).includes(p.project))
          .map((p) => p._id);

    setForm({
      name: emp.name || "",
      email: emp.email || "",
      mobile: emp.mobile || "",
      departmentId: emp.departmentId || "",
      department: emp.department || "",
      role: emp.role || "employee",
      projectIds: derivedIds,
      projects: Array.isArray(emp.projects) ? emp.projects : [],
      password: "",
    });

    setShowPassword(false);
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAddDialogOpen(false);
    setEditEmp(null);
    setShowPassword(false);
    setFormErrors({});
    setForm(emptyForm);
  };

  const filtered = empUsers.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.department &&
        e.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );  
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Loading employees...</Typography>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ p: { xs: 2, md: 3 }, pb: 4, minHeight: "100vh" }}
    >
      <Typography
        variant={isSmallScreen ? "h5" : "h4"}
        fontWeight="bold"
        gutterBottom
      >
        Employee Management
      </Typography>

      <Stack
        direction={isSmallScreen ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isSmallScreen ? "flex-start" : "center"}
        my={2}
        spacing={isSmallScreen ? 2 : 3}
      >
        <Button
          variant="contained"
          onClick={handleOpenAddDialog}
          size={isSmallScreen ? "medium" : "large"}
          fullWidth={isSmallScreen}
          sx={{
            backgroundColor: "#1976D2",
            "&:hover": {
              backgroundColor: "#1565C0",
            },
          }}
        >
          Add Employee
        </Button>
        <TextField
          size="small"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: isSmallScreen ? "100%" : 250 }}
        />
      </Stack>

      <Paper sx={{ p: { xs: 1, md: 2 }, backgroundColor: "#f9f9f9" }}>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: isLargeScreen
              ? TABLE_MAX_HEIGHT_LARGE
              : isMediumScreen
                ? TABLE_MAX_HEIGHT_MEDIUM
                : TABLE_MAX_HEIGHT_SMALL,
            overflowY: "auto",
            overflowX: "auto",
            backgroundColor: "#f9f9f9",
            border: 1,
            borderColor: "grey.300",
            borderRadius: 2,
            minWidth: 0,
          }}
        >
          <Table stickyHeader size={isExtraSmallScreen ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                {[
                  "#",
                  "Name",
                  "Email",
                  "Mobile",
                  "Department",
                  "Projects",
                  "Action",
                ].map((head, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      backgroundColor: "grey",
                      fontWeight: "bold",
                      color: "white",
                      border: "1px solid #ccc",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      textAlign: "center",
                      fontSize: isExtraSmallScreen ? "0.75rem" : "0.85rem",
                      whiteSpace: "nowrap",
                      padding: isExtraSmallScreen ? "8px 4px" : "12px 8px",
                      minWidth:
                        head === "Action"
                          ? isExtraSmallScreen
                            ? "90px"
                            : "120px"
                          : head === "Name" || head === "Email"
                            ? isExtraSmallScreen
                              ? "100px"
                              : "150px"
                            : "auto",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((emp, i) => (
                  <TableRow key={emp._id} hover>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        textAlign: "center",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                      }}
                    >
                      {i + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                      }}
                    >
                      {emp.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        wordBreak: "break-word",
                      }}
                    >
                      {emp.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.mobile}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                      }}
                    >
                      {emp.department}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        wordBreak: "break-word",
                      }}
                    >
                      {(emp.projects || []).join(", ")}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        textAlign: "center",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <IconButton
                        size={isSmallScreen ? "small" : "medium"}
                        onClick={() => handleOpenEditDialog(emp)}
                      >
                        <EditIcon
                          color="primary"
                          fontSize={isSmallScreen ? "small" : "medium"}
                        />
                      </IconButton>
                      <IconButton
                        size={isSmallScreen ? "small" : "medium"}
                        color="error"
                        onClick={() => handleDelete(emp._id)}
                      >
                        <DeleteIcon
                          fontSize={isSmallScreen ? "small" : "medium"}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ border: "1px solid #ccc", py: 2 }}
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth={isSmallScreen ? "sm" : "xs"}
      >
        <DialogTitle>{editEmp ? "Edit Employee" : "Add Employee"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={isSmallScreen ? 1.5 : 2}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              size="small"
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              size="small"
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              fullWidth
              size="small"
              required
              error={!!formErrors.mobile}
              helperText={formErrors.mobile}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              fullWidth
              size="small"
              required={!editEmp}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* ⭐ Disabled Department FormControl */}
            <FormControl
              fullWidth
              size="small"
              required // Keep required if it's conceptually required when enabled
              error={!!formErrors.department}
            >
              <TextField
                select
                fullWidth
                required
                label="Department"
                name="departmentId"
                value={form.departmentId || ""} 
                onChange={(e) => {
                  const deptId = e.target.value;
                  const deptObj = departments.find((d) => d._id === deptId);
                  setForm((prev) => ({
                    ...prev,
                    departmentId: deptId,
                    department: deptObj?.department || "", // keep name for backend
                  }));
                }}
              >
                <MenuItem value="">Select</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.department}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl fullWidth size="small" required>
              <InputLabel>Projects</InputLabel>
              <Select
                name="projectIds"
                multiple
                value={form.projectIds || []}
                onChange={handleProjectChange}
                renderValue={(selected = []) =>
                  projects
                    .filter((p) => selected.includes(p._id))
                    .map((p) => p.project)
                    .join(", ")
                }
              >
                {projects.map((proj) => (
                  <MenuItem key={proj._id} value={proj._id}>
                    <Checkbox checked={(form.projectIds || []).includes(proj._id)} />
                    <ListItemText primary={proj.project} />
                  </MenuItem>
                ))}
              </Select>
              {formErrors.projects && (
                <Typography color="error" variant="caption">
                  {formErrors.projects}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: "#f26522",
              "&:hover": {
                backgroundColor: "#e05a1d",
              },
            }}
          >
            {editEmp ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
