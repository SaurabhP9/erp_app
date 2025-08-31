import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getFilterTickets } from "../api/ticketApi";
import { getAllProjects } from "../api/dropDownApi";
import { getAllUsersByRole } from "../api/userApi";

const getDateString = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const formatDateTime = (isoString) => {
  const date = new Date(isoString);
  return date.toISOString().replace("T", " ").slice(0, 16);
};

export default function Reports() {
  const [formData, setFormData] = useState({
    fromDate: getDateString(-7),
    toDate: getDateString(0),
    employeeName: "",
    projectName: "",
    mainStatus: "",
    ticketNo: "",
  });

  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showReport, setShowReport] = useState(false);

  const statuses = ["Open", "In Process", "Closed", "Working", "Handover"];
  const headers = [
    "#",
    "Date",
    "Employee",
    "Project",
    "Status",
    "Target Date",
    "Ticket No",
    "Subject",
    "Category",
  ];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [proj, emp] = await Promise.all([
          getAllProjects(),
          getAllUsersByRole("employee"),
        ]);
        setProjects(proj);
        setEmployees(emp);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchAll();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const applyFilters = async () => {
    setLoading(true);
    setShowReport(false);
    try {
      const data = await getFilterTickets(formData);
      setFilteredData(data);
      setShowReport(true);
    } catch (err) {
      console.error("Error applying filters:", err);
    } finally {
      setLoading(false);
    }
  };

  const mapRows = () =>
    filteredData.map((row, i) => [
      i + 1,
      formatDateTime(row.createdTime),
      row.employee,
      row.project,
      row.mainStatus,
      row.targetDate ? formatDate(row.targetDate) : "",
      row.ticketNo,
      row.subject || "",
      row.category || "",
    ]);

  const exportToExcel = () => {
    if (!filteredData.length) return;

    const filterRows = [
      ["Report Result"],
      ["From Date:", formData.fromDate],
      ["To Date:", formData.toDate],
    ];
    if (formData.projectName)
      filterRows.push(["Project:", formData.projectName]);
    if (formData.employeeName)
      filterRows.push(["Employee:", formData.employeeName]);
    if (formData.mainStatus)
      filterRows.push(["Main Status:", formData.mainStatus]);
    if (formData.ticketNo) filterRows.push(["Ticket No:", formData.ticketNo]);

    const wsData = [...filterRows, [], headers, ...mapRows()];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(
      workbook,
      `Report_${formData.fromDate}_${formData.toDate}.xlsx`
    );
  };

  const exportToPDF = () => {
    if (!filteredData.length) return;

    const doc = new jsPDF({ orientation: "landscape" });
    let y = 10;

    doc.setFontSize(12);
    doc.text("Report Result", 14, y);
    y += 8;

    const filterLines = [
      `From Date: ${formData.fromDate}`,
      `To Date: ${formData.toDate}`,
      formData.projectName && `Project: ${formData.projectName}`,
      formData.employeeName && `Employee: ${formData.employeeName}`,
      formData.mainStatus && `Main Status: ${formData.mainStatus}`,
      formData.ticketNo && `Ticket No: ${formData.ticketNo}`,
    ].filter(Boolean);

    filterLines.forEach((line) => {
      doc.text(line, 14, y);
      y += 6;
    });

    autoTable(doc, {
      startY: y + 2,
      head: [headers],
      body: mapRows(),
      styles: { fontSize: 8 },
    });

    doc.save(`Report_${formData.fromDate}_${formData.toDate}.pdf`);
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Report
      </Typography>
      <Typography color="gray" gutterBottom>
        Home → Report
      </Typography>

      <Box
        display="flex"
        gap={3}
        mt={2}
        sx={{ justifyContent: showReport ? "space-between" : "center" }}
      >
        {/* Filter Panel */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            width: showReport ? "28%" : "45%",
            transition: "all 0.3s ease",
            position: showReport ? "sticky" : "relative",
            top: showReport ? 20 : "auto",
            alignSelf: "flex-start",
            backgroundColor: "#f9f9f9",
          }}
        >
          <Stack spacing={1}>
            <TextField
              label="From Date"
              type="date"
              name="fromDate"
              size="small"
              value={formData.fromDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="To Date"
              type="date"
              name="toDate"
              size="small"
              value={formData.toDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="Employee Name"
              name="employeeName"
              size="small"
              value={formData.employeeName}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">- Select -</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp.name}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Project Name"
              name="projectName"
              size="small"
              value={formData.projectName}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">- Select -</MenuItem>
              {projects.map((proj) => (
                <MenuItem key={proj._id} value={proj.project}>
                  {proj.project}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Main Status"
              name="mainStatus"
              size="small"
              value={formData.mainStatus}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">- Select -</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ticket No."
              name="ticketNo"
              size="small"
              value={formData.ticketNo}
              onChange={handleChange}
              fullWidth
            />
            <Box display="flex" gap={1}>
              <Button
                onClick={applyFilters}
                variant="contained"
                size="small"
                fullWidth
              >
                Apply
              </Button>
              <Button
                onClick={exportToExcel}
                variant="outlined"
                disabled={loading || !filteredData.length}
                size="small"
                fullWidth
              >
                Excel
              </Button>
              <Button
                onClick={exportToPDF}
                variant="outlined"
                disabled={loading || !filteredData.length}
                size="small"
                fullWidth
              >
                PDF
              </Button>
            </Box>
          </Stack>
        </Paper>

        {/* Report Panel */}
        {showReport && (
          <Paper
            elevation={1}
            sx={{ p: 1, width: "70%", alignSelf: "flex-start", mt: "-50px" }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Report Result
            </Typography>
            <Typography variant="body2">
              From Date: {formData.fromDate}
            </Typography>
            <Typography variant="body2" gutterBottom>
              To Date: {formData.toDate}
            </Typography>
            {formData.projectName && (
              <Typography variant="body2">
                Project: {formData.projectName}
              </Typography>
            )}
            {formData.employeeName && (
              <Typography variant="body2">
                Employee: {formData.employeeName}
              </Typography>
            )}
            {formData.mainStatus && (
              <Typography variant="body2">
                Main Status: {formData.mainStatus}
              </Typography>
            )}
            {formData.ticketNo && (
              <Typography variant="body2">
                Ticket No: {formData.ticketNo}
              </Typography>
            )}

            <TableContainer
              sx={{
                mt: 2,
                maxHeight: 290,
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: 1,
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {headers.map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          backgroundColor: "grey",
                          color: "white",
                          fontWeight: "bold",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          border: "1px solid #ccc",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length}
                        align="center"
                        sx={{ border: "1px solid #ccc" }}
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {i + 1}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {formatDate(row.createdTime)}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.employee}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.project}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.mainStatus}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.targetDate ? formatDate(row.targetDate) : ""}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.ticketNo}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.subject}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.category}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length}
                        align="center"
                        sx={{ border: "1px solid #ccc" }}
                      >
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
