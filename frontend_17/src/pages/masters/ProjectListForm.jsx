import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../../api/projectApi";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    project: "",
    gst: "",
    location: "",
    address: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  // State for form validation errors
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleOpen = (project = null, index = null) => {
    if (project) {
      setForm({
        project: project.project || "",
        gst: project.gst || "",
        location: project.location || "",
        address: project.address || "",
      });
      setEditIndex(index);
    } else {
      setForm({ project: "", gst: "", location: "", address: "" });
      setEditIndex(null);
    }
    setOpen(true);
    setFormErrors({}); // Clear errors when opening the dialog
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ project: "", gst: "", location: "", address: "" });
    setEditIndex(null);
    setFormErrors({}); // Clear errors when closing the dialog
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for the field being changed
    setFormErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));
  };

  const validateForm = () => {
    let errors = {};
    if (!form.project.trim()) errors.project = "Project name is required.";
    if (!form.gst.trim()) errors.gst = "GST number is required.";
    if (!form.location.trim()) errors.location = "Location is required.";
    if (!form.address.trim()) errors.address = "Address is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Stop if form is invalid
    }

    try {
      if (editIndex !== null) {
        const projectId = projects[editIndex]._id; // Assuming _id is the unique identifier
        const updated = await updateProject(projectId, form);
        const updatedList = [...projects];
        updatedList[editIndex] = updated;
        setProjects(updatedList);
      } else {
        const newProject = await createProject(form);
        setProjects([...projects, newProject]);
      }
      handleClose();
    } catch (err) {
      console.error("Error in submit:", err);
      // You might want to display a user-friendly error message here
    }
  };

  const handleDelete = async (index) => {
    try {
      const projectId = projects[index]._id; // Assuming _id is the unique identifier

      await deleteProject(projectId);
      const updated = projects.filter((_, i) => i !== index);
      setProjects(updated);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredProjects = projects.filter((p) =>
    Object.values(p).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(search.toLowerCase())
    )
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valA = a[sortConfig.key]?.toLowerCase() || "";
    const valB = b[sortConfig.key]?.toLowerCase() || "";
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const handleExportExcel = () => {
    const wsData = [
      ["Project", "GST No.", "Location", "Address"],
      ...projects.map((p) => [p.project, p.gst, p.location, p.address]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
    XLSX.writeFile(workbook, "Project_List.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Project List", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Project", "GST No.", "Location", "Address"]],
      body: projects.map((p) => [p.project, p.gst, p.location, p.address]),
      styles: { fontSize: 9 },
    });
    doc.save("Project_List.pdf");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 0.5 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        List of Project
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home → List of Project
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        my={2}
        justifyContent="space-between" // Distribute space
        alignItems="center" // Align items vertically
      >
        <Stack direction="row" spacing={2}>
          {" "}
          {/* Group buttons */}
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Project
          </Button>
          <Button variant="outlined" onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="outlined" onClick={handleExportPDF}>
            Export PDF
          </Button>
        </Stack>
        <TextField
          size="small"
          placeholder="Search projects..." // More descriptive placeholder
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 250 }} // Consistent width for search field
        />
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: 300,
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          border: 1,
          borderColor: "grey.300",
          borderRadius: 2,
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  backgroundColor: "grey",
                  fontWeight: "bold",
                  color: "white",
                  border: "1px solid #ccc",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                #
              </TableCell>
              {["project", "gst", "location", "address"].map((key) => (
                <TableCell
                  key={key}
                  onClick={() => handleSort(key)}
                  sx={{
                    backgroundColor: "grey",
                    fontWeight: "bold",
                    color: "white",
                    border: "1px solid #ccc",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    cursor: "pointer",
                  }}
                >
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                  {/* Capitalize and add space for camelCase */}
                  {sortConfig.key === key
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  backgroundColor: "grey",
                  fontWeight: "bold",
                  color: "white", // Changed to white for consistency with other headers
                  border: "1px solid #ccc",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedProjects.length > 0 ? (
              sortedProjects.map((row, i) => (
                <TableRow key={row._id || i} hover>
                  <TableCell sx={{ border: "1px solid #ccc" }}>
                    {i + 1}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ccc" }}>
                    {row.project}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ccc" }}>
                    {row.gst}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ccc" }}>
                    {row.location}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid #ccc" }}>
                    {row.address}
                  </TableCell>
                  <TableCell align="center" sx={{ border: "1px solid #ccc" }}>
                    <IconButton size="small" onClick={() => handleOpen(row, i)}>
                      <EditIcon fontSize="small" color="primary" />{" "}
                      {/* Added color */}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Project Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        {" "}
        {/* Adjusted maxWidth */}
        <DialogTitle>
          {editIndex !== null ? "Edit Project" : "Add Project"}
        </DialogTitle>
        <DialogContent dividers>
          {" "}
          {/* Added dividers */}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Project Name"
              name="project"
              fullWidth
              size="small" // Consistent size
              value={form.project}
              onChange={handleChange}
              required // Mark as required
              error={!!formErrors.project} // Show error state
              helperText={formErrors.project} // Display error message
            />
            <TextField
              label="GST Number"
              name="gst"
              fullWidth
              size="small" // Consistent size
              value={form.gst}
              onChange={handleChange}
              required // Mark as required
              error={!!formErrors.gst} // Show error state
              helperText={formErrors.gst} // Display error message
            />
            <TextField
              label="Location"
              name="location"
              fullWidth
              size="small" // Consistent size
              value={form.location}
              onChange={handleChange}
              required // Mark as required
              error={!!formErrors.location} // Show error state
              helperText={formErrors.location} // Display error message
            />
            <TextField
              label="Address"
              name="address"
              fullWidth
              multiline
              rows={3} // Increased rows for better usability
              size="small" // Consistent size
              value={form.address}
              onChange={handleChange}
              required // Mark as required
              error={!!formErrors.address} // Show error state
              helperText={formErrors.address} // Display error message
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
