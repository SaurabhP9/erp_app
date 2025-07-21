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
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryApi";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const userId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (categoryObj = null, index = null) => {
    setInputValue(categoryObj?.category || "");
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
      const currentUserId = localStorage.userId;
      if (editIndex !== null) {
        const categoryToUpdate = categories[editIndex];
        const updated = await updateCategory(categoryToUpdate._id, {
          category: trimmed,
          updatedTime: new Date().toISOString(),
          updatedBy: currentUserId,
        });
        const updatedList = [...categories];
        updatedList[editIndex] = updated;
        setCategories(updatedList);
      } else {
        const created = await createCategory({
          category: trimmed,
          createdBy: currentUserId,
          updatedBy: currentUserId,
        });
        setCategories([...categories, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (index) => {
    try {
      console.log("category deelete index ", categories[index]);
      const category = categories[index];
      await deleteCategory(category._id);
      const updated = categories.filter((_, i) => i !== index);
      setCategories(updated);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleSort = () => {
    const sorted = [...categories].sort((a, b) => {
      const aVal = a.category.toLowerCase();
      const bVal = b.category.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    setCategories(sorted);
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleExportExcel = () => {
    const wsData = [
      ["#", "Category"],
      ...categories.map((cat, i) => [i + 1, cat.category]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, "Category_List.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Category List", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["#", "Category"]],
      body: categories.map((cat, i) => [i + 1, cat.category]),
      styles: { fontSize: 10 },
    });
    doc.save("Category_List.pdf");
  };

  const filtered = categories.filter((cat) =>
    cat.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        List of Category
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home → List of Category
      </Typography>

      <Stack direction="row" spacing={2} my={2}>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Category
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
              <TableCell sx={{ color: "#fff", fontWeight: "bold", border: 1 }}>
                #
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: "bold",
                  border: 1,
                  cursor: "pointer",
                }}
                onClick={handleSort}
              >
                Category {sortOrder === "asc" ? "↑" : "↓"}
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#fff", fontWeight: "bold", border: 1 }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((category, i) => (
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
                <TableCell>{category.category}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(category, i)}
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
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editIndex !== null ? "Edit Category" : "Add Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Category"
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
