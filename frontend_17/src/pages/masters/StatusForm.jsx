import React, { useEffect, useState } from "react";
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
  MenuItem,
  FormControl, // Added for Select
  InputLabel, // Added for Select
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getAllStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} from "../../api/statusApi";

const mainStatusOptions = [
  "open",
  "inProcess",
  "closed",
  "handover",
  "working",
];

export default function StatusList() {
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputMain, setInputMain] = useState(mainStatusOptions[0]);
  const [editIndex, setEditIndex] = useState(null);
  // State for form validation errors
  const [formErrors, setFormErrors] = useState({});

  const currentUserId = localStorage.userId || 101; // Ensure currentUserId is defined

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const data = await getAllStatuses();
      setStatuses(data);
    } catch (err) {
      console.error("Failed to fetch statuses", err);
    }
  };

  const handleOpen = (
    status = "",
    main = mainStatusOptions[0],
    index = null
  ) => {
    setInputName(status);
    setInputMain(main);
    setEditIndex(index);
    setOpen(true);
    setFormErrors({}); // Clear errors when opening the dialog
  };

  const handleClose = () => {
    setOpen(false);
    setInputName("");
    setInputMain(mainStatusOptions[0]);
    setEditIndex(null);
    setFormErrors({}); // Clear errors when closing the dialog
  };

  const validateForm = () => {
    let errors = {};
    if (!inputName.trim()) errors.subStatus = "Sub Status is required.";
    if (!inputMain) errors.mainStatus = "Main Status is required."; // Although select has a default, this is good practice

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    const statusData = {
      subStatus: inputName.trim(),
      mainStatus: inputMain.trim(),
      updatedBy: currentUserId,
    };
  
    try {
      if (editIndex !== null) {
        const id = statuses[editIndex]._id;
        await updateStatus(id, statusData);
      } else {
        await createStatus({
          ...statusData,
          createdBy: currentUserId,
        });
      }
  
      await fetchStatuses();
      handleClose();
    } catch (err) {
      console.error("Error saving status", err);
      // Optionally show a toast/snackbar error here
    }
  };  

  const handleDelete = async (index) => {
    try {
      const id = statuses[index]._id;
      await deleteStatus(id);
      setStatuses(statuses.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleExportExcel = () => {
    const wsData = [
      ["#", "Sub Status", "Main Status"],
      ...statuses.map((s, i) => [i + 1, s.subStatus, s.mainStatus]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Status List");
    XLSX.writeFile(workbook, "Status_List.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Status List", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["#", "Sub Status", "Main Status"]],
      body: statuses.map((s, i) => [i + 1, s.subStatus, s.mainStatus]),
    });
    doc.save("Status_List.pdf");
  };

  const filtered = Array.isArray(statuses)
    ? statuses.filter((s) =>
      (s?.subStatus || "").toLowerCase().includes(search.toLowerCase())
    )
    : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        List of Status
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home → List of Status
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        my={2}
        justifyContent="space-between" // Align buttons and search field
        alignItems="center"
      >
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Status
          </Button>
          <Button variant="outlined" onClick={handleExportExcel}>
            Excel
          </Button>
          <Button variant="outlined" onClick={handleExportPDF}>
            PDF
          </Button>
        </Stack>
        <TextField
          size="small"
          placeholder="Search statuses..." // More descriptive placeholder
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 250 }} // Consistent width
        />
      </Stack>

      <TableContainer
        component={Paper}
        sx={{
          p: 2,
          backgroundColor: "#f9f9f9",
          border: 1,
          borderColor: "grey.300",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Table
          size="small"
          sx={{
            borderCollapse: "collapse",
            "& td, & th": {
              border: "1px solid #ccc",
            },
          }}
        >
          <TableHead sx={{ backgroundColor: "grey" }}>
            <TableRow>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "default", // Changed to default as not sortable
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "default",
                }}
              >
                Sub Status
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "default",
                }}
              >
                Main Status
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "default",
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((row, i) => (
              <TableRow
                key={row._id || i} // Use _id as key if available, fallback to index
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                    cursor: "pointer",
                  },
                }}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{row.subStatus}</TableCell>
                <TableCell>{row.mainStatus}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(row.subStatus, row.mainStatus, i)}
                  >
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
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No statuses found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Status Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        {" "}
        {/* Adjusted maxWidth */}
        <DialogTitle>
          {editIndex !== null ? "Edit Status" : "Add Status"}
        </DialogTitle>
        <DialogContent dividers>
          {" "}
          {/* Added dividers */}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Sub Status"
              fullWidth
              size="small" // Consistent size
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  subStatus: "",
                })); // Clear error on change
              }}
              required // Mark as required
              error={!!formErrors.subStatus} // Show error state
              helperText={formErrors.subStatus} // Display error message
            />
            <TextField
              label="Main Status"
              fullWidth
              size="small"
              value={inputMain}
              onChange={(e) => {
                setInputMain(e.target.value);
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  mainStatus: "",
                }));
              }}
              required
              error={!!formErrors.mainStatus}
              helperText={formErrors.mainStatus}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editIndex !== null ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
