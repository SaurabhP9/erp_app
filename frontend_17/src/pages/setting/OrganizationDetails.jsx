import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from "../../api/organizationApi";

export default function OrganizationList() {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState({
    orgName: "",
    phone: "",
    emailId: "",
    website: "",
    address: "",
  });

  const userId = localStorage.userId || "System";

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const data = await getAllOrganizations();
      setOrgs(data || []);
    } catch (err) {
      console.error("Error fetching organizations:", err);
    }
  };

  const handleOpen = (org = null, index = null) => {
    if (org) {
      setForm(org);
      setEditIndex(index);
    } else {
      setForm({
        orgName: "",
        phone: "",
        emailId: "",
        website: "",
        address: "",
      });
      setEditIndex(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ orgName: "", phone: "", emailId: "", website: "", address: "" });
    setEditIndex(null);
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editIndex !== null) {
        const updated = await updateOrganization(form._id, {
          ...form,
          updatedBy: userId,
        });
        const updatedList = [...orgs];
        updatedList[editIndex] = updated;
        setOrgs(updatedList);
      } else {
        const created = await createOrganization({
          ...form,
          createdBy: userId,
          updatedBy: userId,
        });
        setOrgs([...orgs, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Error saving organization:", err);
    }
  };

  const handleDelete = async (index) => {
    try {
      const id = orgs[index]._id;
      await deleteOrganization(id);
      const updated = orgs.filter((_, i) => i !== index);
      setOrgs(updated);
    } catch (err) {
      console.error("Error deleting organization:", err);
    }
  };

  const exportToExcel = () => {
    const wsData = [
      ["#", "Org Name", "Phone", "Email", "Website", "Address"],
      ...orgs.map((o, i) => [
        i + 1,
        o.orgName,
        o.phone,
        o.emailId,
        o.website,
        o.address,
      ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, "Organizations");
    XLSX.writeFile(wb, "Organization_List.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Organization List", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [["#", "Org Name", "Phone", "Email", "Website", "Address"]],
      body: orgs.map((o, i) => [
        i + 1,
        o.orgName,
        o.phone,
        o.emailId,
        o.website,
        o.address,
      ]),
    });
    doc.save("Organization_List.pdf");
  };

  const filtered = orgs.filter((o) =>
    o.orgName?.toLowerCase().includes(search.toLowerCase())
  );

  const labelMap = {
    orgName: "Organization Name",
    phone: "Phone",
    emailId: "Email",
    website: "Website",
    address: "Address",
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        List of Organizations
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home → List of Organizations
      </Typography>

      <Stack direction="row" spacing={2} my={2}>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Organization
        </Button>
        <Button variant="outlined" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="outlined" onClick={exportToPDF}>
          Export PDF
        </Button>
      </Stack>

      <Box display="flex" justifyContent="flex-end" mb={1}>
        <TextField
          size="small"
          placeholder="Search organization"
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
            "& td, & th": {
              border: "1px solid #ccc",
            },
          }}
        >
          <TableHead sx={{ backgroundColor: "grey" }}>
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", border: 1 }}>
                #
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", border: 1 }}>
                Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", border: 1 }}>
                Phone
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", border: 1 }}>
                Email
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", border: 1 }}>
                Website
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", border: 1 }}>
                Address
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold", border: 1 }}
                align="center"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((org, i) => (
              <TableRow
                key={org._id || i}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "#f1f1f1",
                    cursor: "pointer",
                  },
                }}
              >
                <TableCell>{i + 1}</TableCell>
                <TableCell>{org.orgName}</TableCell>
                <TableCell>{org.phone}</TableCell>
                <TableCell>{org.emailId}</TableCell>
                <TableCell>{org.website}</TableCell>
                <TableCell>{org.address}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpen(org, i)}>
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
                <TableCell colSpan={7} align="center">
                  No organizations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editIndex !== null ? "Edit Organization" : "Add Organization"}
        </DialogTitle>
        <DialogContent>
          {Object.keys(labelMap).map((field) => (
            <TextField
              key={field}
              label={labelMap[field]}
              fullWidth
              size="small"
              multiline={field === "address"}
              rows={field === "address" ? 3 : 1}
              sx={{ mt: 2 }}
              value={form[field]}
              onChange={handleChange(field)}
            />
          ))}
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
