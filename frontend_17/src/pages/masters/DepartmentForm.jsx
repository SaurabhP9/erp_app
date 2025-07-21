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
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/departmentApi";

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const currentUserId = localStorage.userId || 0;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleOpen = (value = "", index = null) => {
    setInputValue(value.department || "");
    setEditIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setInputValue("");
    setEditIndex(null);
  };

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    try {
      if (editIndex !== null) {
        const dept = departments[editIndex];
        const updated = await updateDepartment(dept._id, {
          department: trimmed,
          updatedBy: currentUserId,
        });
        const updatedList = [...departments];
        updatedList[editIndex] = updated;
        setDepartments(updatedList);
      } else {
        const created = await createDepartment({
          department: trimmed,
          createdBy: currentUserId,
          updatedBy: currentUserId,
        });
        setDepartments([...departments, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (index) => {
    try {
      const dept = departments[index];
      await deleteDepartment(dept._id);
      const updated = departments.filter((_, i) => i !== index);
      setDepartments(updated);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleExportExcel = () => {
    const wsData = [
      ["#", "Department"],
      ...departments.map((d, i) => [i + 1, d.department]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Departments");
    XLSX.writeFile(workbook, "Department_List.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Department List", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["#", "Department"]],
      body: departments.map((d, i) => [i + 1, d.department]),
      styles: { fontSize: 11 },
    });
    doc.save("Department_List.pdf");
  };

  const filtered = departments.filter((d) =>
    d.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        List of Department
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home → List of Department
      </Typography>

      <Stack direction="row" spacing={2} my={2}>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Department
        </Button>
        <Button variant="outlined" onClick={handleExportExcel}>
          Excel
        </Button>
        <Button variant="outlined" onClick={handleExportPDF}>
          PDF
        </Button>
      </Stack>

      <Box display="flex" justifyContent="flex-end" mb={1}>
        <TextField
          size="small"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

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
            "& td, & th": { border: "1px solid #ccc" },
          }}
        >
          <TableHead sx={{ backgroundColor: "grey" }}>
            <TableRow>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "pointer",
                }}
              >
                #
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "pointer",
                }}
              >
                Department
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "pointer",
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((dept, i) => (
              <TableRow
                key={i}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                    cursor: "pointer",
                  },
                }}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{dept.department}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpen(dept, i)}>
                    <EditIcon fontSize="small" />
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
                <TableCell colSpan={3} align="center">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editIndex !== null ? "Edit Department" : "Add Department"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Department"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ mt: 1 }}
          />
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
