import React, { useState, useEffect } from "react";
import {
  Container, Typography, Stack, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, TableContainer
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getParameter,
  createParameter,
  updateParameter,
  deleteParameter,
} from "../../api/parameterApi";

export default function ParameterList() {
  const [params, setParams] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const data = await getParameter();
      setParams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editId) {
        const updated = await updateParameter(editId, {
          ...form,
          updatedTime: new Date().toISOString(),
        });
        setParams(params.map((p) => (p._id === editId ? updated : p)));
      } else {
        const created = await createParameter({
          ...form,
          createdTime: new Date().toISOString(),
          updatedTime: new Date().toISOString(),
        });
        setParams([...params, created]);
      }
      handleClose();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteParameter(id);
      setParams(params.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleOpen = (param = null) => {
    if (param) {
      setForm(param);
      setEditId(param._id);
    } else {
      setForm({
        sendMail: "",
        setFrom: "",
        setName: "",
        pwd: "",
        host: "",
        port: "",
        cc: "",
      });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    document.activeElement?.blur();
    setOpen(false);
    setForm({});
    setEditId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Parameters
      </Typography>
      <Typography variant="body2" gutterBottom color="gray">
        Home → Parameters
      </Typography>

      <Stack direction="row" spacing={2} my={2}>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Parameter
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "grey" }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Send Mail</TableCell>
              <TableCell>Set From</TableCell>
              <TableCell>CC</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {params.map((param, i) => (
              <TableRow key={param._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{param.sendMail}</TableCell>
                <TableCell>{param.setFrom}</TableCell>
                <TableCell>{param.cc}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpen(param)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(param._id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {params.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">No parameters found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Edit Parameter" : "Add Parameter"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {[
              { label: "Send Mail", name: "sendMail" },
              { label: "Set From", name: "setFrom" },
              { label: "Set Name", name: "setName" },
              { label: "Password", name: "pwd", type: "password" },
              { label: "Host", name: "host" },
              { label: "Port", name: "port" },
              { label: "CC", name: "cc" },
            ].map((field, i) => (
              <TextField
                key={i}
                label={field.label}
                name={field.name}
                type={field.type || "text"}
                value={form[field.name] || ""}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editId ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
