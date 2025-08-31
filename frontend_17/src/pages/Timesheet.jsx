import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Grid,
  Box,
} from "@mui/material";
import { FaFilter } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllTimesheets } from "../api/timesheetService";

const columnHeaders = [
  "Employee",
  "Ticket",
  "Subject",
  "Task",
  "Date",
  "Time",
  "Total Work",
  "Status",
];

export default function Timesheet() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumnIndex, setSortColumnIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [data, setData] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    employee: "",
    subject: "",
    task: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const [timesheets] = await Promise.all([getAllTimesheets()]);

      const formatted = timesheets.map((item) => [
        item.employee,
        item.ticketNo,
        item.subject,
        item.task,
        item.date,
        item.workingTime,
        item.totalWork,
        item.mainStatus,
      ]);

      setData(formatted);
    } catch (err) {
      console.error("Error fetching timesheets:", err);
    }
  };

  const handleSort = (index) => {
    if (sortColumnIndex === index) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumnIndex(index);
      setSortOrder("asc");
    }
  };

  const handleExportExcel = () => {
    const wsData = [columnHeaders, ...data];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");
    XLSX.writeFile(workbook, "Timesheet.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Timesheet Report", 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [columnHeaders],
      body: data,
      styles: { fontSize: 8 },
    });
    doc.save("Timesheet.pdf");
  };

  const applyFilters = (row) => {
    const [employee, , subject, task, date, , , status] = row;
    const {
      employee: emp,
      subject: sub,
      task: tsk,
      status: stat,
      fromDate,
      toDate,
    } = filterValues;

    const matches =
      (!emp || employee.toLowerCase().includes(emp.toLowerCase())) &&
      (!sub || subject.toLowerCase().includes(sub.toLowerCase())) &&
      (!tsk || task.toLowerCase().includes(tsk.toLowerCase())) &&
      (!stat || status.toLowerCase().includes(stat.toLowerCase())) &&
      (!fromDate || new Date(date) >= new Date(fromDate)) &&
      (!toDate || new Date(date) <= new Date(toDate));

    return matches;
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortColumnIndex === null) return 0;
    const valA = a[sortColumnIndex]?.toString().toLowerCase() || "";
    const valB = b[sortColumnIndex]?.toString().toLowerCase() || "";
    return sortOrder === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  const filteredData = sortedData.filter(
    (row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(searchTerm.toLowerCase())
      ) && applyFilters(row)
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, display: "flex" }}>
      {/* Filter Panel */}
      {filtersOpen && (
        <Box
          sx={{
            width: 300,
            p: 2,
            borderRight: "1px solid #ccc",
            backgroundColor: "#f8f8f8",
            height: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={2}>
            {["employee", "subject", "task", "status"].map((key) => (
              <Grid item xs={12} key={key}>
                <TextField
                  fullWidth
                  size="small"
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={filterValues[key]}
                  onChange={(e) =>
                    setFilterValues({ ...filterValues, [key]: e.target.value })
                  }
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={filterValues.fromDate}
                onChange={(e) =>
                  setFilterValues({
                    ...filterValues,
                    fromDate: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={filterValues.toDate}
                onChange={(e) =>
                  setFilterValues({ ...filterValues, toDate: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Table Content Area */}
      <Box sx={{ flexGrow: 1, px: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={() => setFiltersOpen(!filtersOpen)}>
              <FaFilter style={{ color: "black" }} />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              List of Timesheet
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outlined" onClick={handleExportExcel}>
              EXPORT EXCEL
            </Button>
            <Button variant="outlined" onClick={handleExportPDF}>
              EXPORT PDF
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        <Paper sx={{ p: 2, backgroundColor: "#f9f9f9" }}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: 359, // controls visible rows before scroll
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
                      border: 1,
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    #
                  </TableCell>
                  {columnHeaders.map((header, index) => (
                    <TableCell
                      key={index}
                      onClick={() => handleSort(index)}
                      sx={{
                        backgroundColor: "grey",
                        fontWeight: "bold",
                        color: "white",
                        border: 1,
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        cursor: "pointer",
                      }}
                    >
                      {header}
                      {sortColumnIndex === index &&
                        (sortOrder === "asc" ? " ↑" : " ↓")}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ border: "1px solid #ccc" }}>
                        {i + 1}
                      </TableCell>
                      {row.map((cell, j) => (
                        <TableCell key={j} sx={{ border: "1px solid #ccc" }}>
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
}
