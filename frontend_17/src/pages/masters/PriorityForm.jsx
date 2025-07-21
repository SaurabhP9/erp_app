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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getAllPriorities,
  createPriority,
  updatePriority,
  deletePriority,
} from "../../api/priorityApi";

export default function PriorityList() {
  const [priorities, setPriorities] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPriorities = async () => {
      setLoading(true);
      try {
        const data = await getAllPriorities();
        setPriorities(data);
      } catch (err) {
        console.error("Failed to load priorities", err);
      }
      setLoading(false);
    };

    fetchPriorities();
  }, []);

  const handleOpen = (name = "", index = null) => {
    setInput(name);
    setEditIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setInput("");
    setEditIndex(null);
    setOpen(false);
  };

  const currentUserId = localStorage.userId;

  const handleSave = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      if (editIndex !== null) {
        const priorityToUpdate = priorities[editIndex];
        const updated = await updatePriority(priorityToUpdate._id, {
          priority: trimmed,
          updatedBy: currentUserId,
        });
        const updatedList = [...priorities];
        updatedList[editIndex] = updated;
        setPriorities(updatedList);
      } else {
        const created = await createPriority({
          priority: trimmed,
          createdBy: currentUserId,
          updatedBy: currentUserId,
        });
        setPriorities([...priorities, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (index) => {
    try {
      const id = priorities[index]._id;
      await deletePriority(id);
      const updated = priorities.filter((_, i) => i !== index);
      setPriorities(updated);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleExportExcel = () => {
    const wsData = [
      ["#", "Priority"],
      ...priorities.map((p, i) => [i + 1, p.priority]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Priority List");
    XLSX.writeFile(workbook, "Priority_List.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Priority List", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["#", "Priority"]],
      body: priorities.map((p, i) => [i + 1, p.priority]),
    });
    doc.save("Priority_List.pdf");
  };

  const handleSort = () => {
    const sorted = [...priorities].sort((a, b) =>
      sortAsc
        ? a.priority.localeCompare(b.priority)
        : b.priority.localeCompare(a.priority)
    );
    setPriorities(sorted);
    setSortAsc(!sortAsc);
  };

  const filtered = priorities.filter((p) =>
    (p?.priority || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        List of Priority
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home → List of Priority
      </Typography>

      <Stack direction="row" spacing={2} my={2}>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Priority
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
                <Box display="flex" alignItems="center">
                  Priority
                  <IconButton
                    size="small"
                    onClick={handleSort}
                    sx={{ ml: 0.5, color: "#fff" }} // optional: make icon white too
                  >
                    {sortAsc ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
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
            {filtered.map((priority, i) => (
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
                <TableCell>{priority.priority}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(priority.priority, i)}
                  >
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
                  No priorities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editIndex !== null ? "Edit Priority" : "Add Priority"}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <TextField
            label="Priority"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
