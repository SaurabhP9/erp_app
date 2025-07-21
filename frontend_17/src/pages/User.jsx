import React, { useEffect, useState } from "react";
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
  useMediaQuery, // Import useMediaQuery
  useTheme, // Import useTheme
  Grid, // Import Grid for better layout control
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SortIcon from "@mui/icons-material/Sort"; // Added for sort indicator
import SortByAlphaIcon from "@mui/icons-material/SortByAlpha"; // Alternative sort icon
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Ensure autoTable is correctly imported

import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/userApi";
import { getAllDepartments } from "../api/departmentApi";

export default function User() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "", // Handled carefully for security (never send back in plain text)
    role: "admin",
    departmentId: "",
  });

  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [isSorted, setIsSorted] = useState(false); // To show sort indicator

  // 💡 Responsiveness hooks
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // true for screens smaller than 'md'
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // true for screens smaller than 'sm'

  useEffect(() => {
    const loadUsersAndDepartments = async () => {
      try {
        const [users, depts] = await Promise.all([
          getAllUsers(),
          getAllDepartments(),
        ]);

        // Filter out "employee" role users and clear passwords for safety
        const filteredUsers = users
          .filter((user) => user.role !== "employee")
          .map((user) => ({ ...user, password: "" })); // Ensure password isn't retained

        setData(filteredUsers);
        setDepartments(depts);
      } catch (error) {
        console.error("Failed to load users or departments:", error);
        // Handle error, e.g., show an alert to the user
      }
    };
    loadUsersAndDepartments();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setForm({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "admin", // Default role
      departmentId: "",
    });
    setOpenDialog(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenEdit = (index) => {
    setForm({ ...data[index], password: "" }); // Never pre-fill password for editing
    setIsEditing(true);
    setEditingIndex(index);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setEditingIndex(null);
    setForm({
      name: "",
      email: "",
      mobile: "",
      password: "",
      role: "admin",
      departmentId: "",
    }); // Reset form on close
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("User name is required.");
      return;
    }
    if (!form.email.trim()) {
      alert("Email is required.");
      return;
    }
    if (!form.mobile.trim()) {
      alert("Mobile number is required.");
      return;
    }
    if (!isEditing && !form.password.trim()) {
      alert("Password is required for new users.");
      return;
    }

    try {
      if (isEditing) {
        // Exclude password if not changed, or handle it on backend
        const { password, ...updateData } = form;
        await updateUser(data[editingIndex]._id, updateData);
      } else {
        await createUser(form);
      }
      // Re-fetch data after save
      const updatedUsers = await getAllUsers();
      setData(
        updatedUsers
          .filter((user) => user.role !== "employee")
          .map((user) => ({ ...user, password: "" }))
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  const handleDelete = (index) => {
    setPendingDeleteIndex(index);
    setConfirmDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(data[pendingDeleteIndex]._id);
      const updatedUsers = await getAllUsers();
      setData(
        updatedUsers
          .filter((user) => user.role !== "employee")
          .map((user) => ({ ...user, password: "" }))
      );
      setConfirmDeleteDialog(false);
      setPendingDeleteIndex(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleSortUser = () => {
    const sorted = [...data].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setData(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setIsSorted(true);
  };

  const handleExportExcel = () => {
    const wsData = [
      ["Name", "Email", "Mobile", "Department", "Role"],
      ...data.map(({ name, email, mobile, departmentId, role }) => [
        name,
        email,
        mobile,
        // Find department name if departmentId is available
        departments.find((dept) => dept._id === departmentId)?.name || "N/A",
        role,
      ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "User_List.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("List of Users", 14, 20);
    const tableColumn = ["Name", "Email", "Mobile", "Department", "Role"];
    const tableRows = data.map(
      ({ name, email, mobile, departmentId, role }) => [
        name,
        email,
        mobile,
        // Find department name for PDF export
        departments.find((dept) => dept._id === departmentId)?.name || "N/A",
        role,
      ]
    );
    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" }, // Smaller font for PDF table
      headStyles: { fillColor: [128, 128, 128], textColor: [255, 255, 255] }, // Grey header
      margin: { top: 25, left: 10, right: 10, bottom: 10 },
    });
    doc.save("User_List.pdf");
  };

  const filteredData = data.filter(
    ({ name, email, mobile, role }) =>
      name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, md: 5 }, mt: 3, mb: 4 }}>
      {" "}
      {/* 💡 Responsive padding */}
      <Typography
        variant={isSmallScreen ? "h6" : "h5"}
        fontWeight="bold"
        gutterBottom
      >
        {" "}
        {/* 💡 Responsive typography */}
        List of Users
      </Typography>
      <Typography variant="body2" gutterBottom color="text.secondary">
        {" "}
        {/* 💡 Use text.secondary for consistency */}
        Home -&gt; List of Users
      </Typography>
      <Grid container spacing={2} alignItems="center" my={2}>
        {" "}
        {/* 💡 Use Grid for flexible layout of buttons and search */}
        <Grid item xs={12} sm={6} md="auto">
          {" "}
          {/* Buttons */}
          <Stack
            direction={isExtraSmallScreen ? "column" : "row"} // Stack vertically on extra small screens
            spacing={1} // Smaller spacing
            sx={{ width: "100%" }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAdd}
              size={isExtraSmallScreen ? "small" : "medium"} // Smaller button on xs
              fullWidth={isExtraSmallScreen} // Full width on xs
            >
              Add User
            </Button>
            <Button
              variant="outlined"
              onClick={handleExportExcel}
              size={isExtraSmallScreen ? "small" : "medium"}
              fullWidth={isExtraSmallScreen}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              onClick={handleExportPDF}
              size={isExtraSmallScreen ? "small" : "medium"}
              fullWidth={isExtraSmallScreen}
            >
              Export PDF
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={3} sx={{ ml: { md: "auto" } }}>
          {" "}
          {/* Search field */}
          <TextField
            fullWidth // Take full width of its grid item
            size="small"
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Consider adding an InputAdornment with a search icon for better UX
          />
        </Grid>
      </Grid>
      <Paper sx={{ p: isExtraSmallScreen ? 1 : 2, backgroundColor: "#f9f9f9" }}>
        {" "}
        {/* 💡 Responsive padding */}
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: "40vh", // 💡 Use viewport height for better responsiveness
            overflowY: "auto",
            backgroundColor: "#f9f9f9",
            border: 1,
            borderColor: "grey.300",
            borderRadius: 2,
            minWidth: 0, // Ensure it doesn't overflow its parent on small screens
          }}
        >
          <Table stickyHeader size={isExtraSmallScreen ? "small" : "medium"}>
            {" "}
            {/* 💡 Smaller table on xs */}
            <TableHead>
              <TableRow>
                {[
                  "#",
                  "User",
                  "Email",
                  "Mobile",
                  "Role",
                  "Department",
                  "Action",
                ].map(
                  // Added Department column
                  (head, i) => (
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
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem", // 💡 Responsive font size
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px", // 💡 Responsive padding
                        minWidth:
                          head === "User"
                            ? isExtraSmallScreen
                              ? "80px"
                              : "120px"
                            : "auto", // Ensure columns have enough width
                        cursor: head === "User" ? "pointer" : "default",
                      }}
                      onClick={head === "User" ? handleSortUser : undefined}
                    >
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {head}
                        {head === "User" &&
                          isSorted &&
                          (sortOrder === "asc" ? (
                            <SortIcon fontSize="small" />
                          ) : (
                            <SortIcon
                              style={{ transform: "rotate(180deg)" }}
                              fontSize="small"
                            />
                          ))}
                      </Box>
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <TableRow key={row._id || index}>
                    {" "}
                    {/* Use a unique ID as key if available */}
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      }}
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      }}
                    >
                      {row.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      }}
                    >
                      {row.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      }}
                    >
                      {row.mobile}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      }}
                    >
                      {row.role}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      }}
                    >
                      {departments.find((dept) => dept._id === row.departmentId)
                        ?.name || "N/A"}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.875rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      }}
                    >
                      <IconButton
                        size={isExtraSmallScreen ? "small" : "medium"} // Responsive icon button size
                        color="primary"
                        onClick={() => handleOpenEdit(index)}
                        aria-label="edit" // Add accessibility labels
                      >
                        <EditIcon fontSize="inherit" />{" "}
                        {/* Use inherit to scale with parent */}
                      </IconButton>
                      <IconButton
                        size={isExtraSmallScreen ? "small" : "medium"} // Responsive icon button size
                        color="error"
                        onClick={() => handleDelete(index)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="inherit" />{" "}
                        {/* Use inherit to scale with parent */}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ border: "1px solid #ccc" }}
                  >
                    {" "}
                    {/* 💡 Adjusted colspan */}
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Add/Edit User Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        scroll="paper" // Enable scrolling for dialog content if it gets too long
      >
        <DialogTitle>{isEditing ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent dividers>
          {" "}
          {/* Added dividers for better visual separation */}
          <Stack spacing={2} mt={1}>
            <TextField
              name="name"
              label="Name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              size="small"
            />
            <TextField
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              type="email" // Semantic type for email
            />
            <TextField
              name="mobile"
              label="Mobile"
              value={form.mobile}
              onChange={handleChange}
              fullWidth
              size="small"
              type="tel" // Semantic type for telephone
            />
            {/* Password field is required only for new users or if explicitly changed during edit */}
            <TextField
              name="password"
              label={isEditing ? "New Password (optional)" : "Password"}
              value={form.password}
              onChange={handleChange}
              fullWidth
              required={!isEditing} // Required only when adding a new user
              type="password"
              size="small"
            />
            <FormControl fullWidth size="small" required>
              {" "}
              {/* Role is likely always required */}
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={form.role}
                onChange={handleChange}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="client">Client</MenuItem>
                {/* Employee role users are filtered out, so no need to offer it here for creation/editing */}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                label="Department"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {isEditing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={() => setConfirmDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>
              {pendingDeleteIndex !== null ? data[pendingDeleteIndex].name : ""}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteDialog(false)}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
