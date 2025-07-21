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
  useMediaQuery, // Import useMediaQuery for responsive design
  useTheme, // Import useTheme to access breakpoints
  Drawer, // Use Drawer for the filter panel on small screens
  Divider, // For visual separation in Drawer
} from "@mui/material";

import { FaFilter } from "react-icons/fa";
import SortIcon from "@mui/icons-material/Sort"; // For sort indicator
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllTimesheets } from "../api/timesheetService";
import dayjs from "dayjs";

const columnHeaders = [
  "Employee",
  "Ticket",
  "Subject",
  "Issued Date",
  "Task",
  "Date",
  "Previous Working Time",
  "Today's Working Time",
  "Total Work",
];

export default function Timesheet() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumnIndex, setSortColumnIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [data, setData] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false); // Controls filter panel visibility
  const [filterValues, setFilterValues] = useState({
    employee: "",
    subject: "",
    task: "",
    fromDate: "",
    toDate: "",
  });

  // 💡 Responsiveness hooks
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // true for screens smaller than 'md' (768px by default)
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // true for screens smaller than 'sm' (600px by default)

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const timesheets = await getAllTimesheets();

      const formatted = timesheets.map((item) => {
        // Calculate previous working time for the same ticket, excluding the current day's entry
        const prevWork = timesheets
          .filter(
            (r) =>
              r.ticketNo === item.ticketNo &&
              r._id !== item._id &&
              dayjs(r.date).isBefore(dayjs(item.date))
          )
          .reduce((sum, r) => sum + parseFloat(r.workingTime || 0), 0)
          .toFixed(2);

        // Calculate total work for the ticket
        const totalWork = (
          parseFloat(prevWork) + parseFloat(item.workingTime || 0)
        ).toFixed(2);

        return [
          item.employee,
          item.ticketNo,
          item.subject,
          item.issuedDate,
          item.task,
          item.date,
          prevWork, // Previous Working Time
          item.workingTime, // Today's Working Time
          totalWork, // Total Work
          item._id, // Keep the ID for potential future use (e.g., editing)
        ];
      });

      setData(formatted);
    } catch (err) {
      console.error("Error fetching timesheets:", err);
      // Optionally show an error message to the user
    }
  };

  const handleSort = (index) => {
    // Prevent sorting the '#' column as it's just for numbering
    if (index < 0) return;

    if (sortColumnIndex === index) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumnIndex(index);
      setSortOrder("asc");
    }
  };

  const handleExportExcel = () => {
    // Exclude the ID column from export
    const exportData = data.map((row) => row.slice(0, -1)); // Assuming ID is the last element
    const wsData = [columnHeaders, ...exportData];
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timesheet");
    XLSX.writeFile(workbook, "Timesheet.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Timesheet Report", 14, 20);

    // Exclude the ID column from export
    const tableRows = data.map((row) => row.slice(0, -1)); // Assuming ID is the last element

    autoTable(doc, {
      startY: 30,
      head: [columnHeaders],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [128, 128, 128], textColor: [255, 255, 255] },
      margin: { top: 25, left: 10, right: 10, bottom: 10 },
      // Column widths can be adjusted for better fit, especially on smaller reports
      columnStyles: {
        0: { cellWidth: "auto" }, // Employee
        1: { cellWidth: "auto" }, // Ticket
        2: { cellWidth: "auto" }, // Subject
        3: { cellWidth: 20 }, // Issued Date
        4: { cellWidth: "auto" }, // Task
        5: { cellWidth: 20 }, // Date
        6: { cellWidth: 20 }, // Previous Working Time
        7: { cellWidth: 20 }, // Today's Working Time
        8: { cellWidth: 20 }, // Total Work
      },
    });
    doc.save("Timesheet.pdf");
  };

  const applyFilters = (row) => {
    // Ensure consistent indexing if row structure changes
    const [employee, , subject, , task, dateStr] = row; // Destructure relevant filter columns

    const {
      employee: empFilter,
      subject: subFilter,
      task: tskFilter,
      fromDate,
      toDate,
    } = filterValues;

    const rowDate = dayjs(dateStr);

    return (
      (!empFilter ||
        employee.toLowerCase().includes(empFilter.toLowerCase())) &&
      (!subFilter || subject.toLowerCase().includes(subFilter.toLowerCase())) &&
      (!tskFilter || task.toLowerCase().includes(tskFilter.toLowerCase())) &&
      (!fromDate || rowDate.isSameOrAfter(dayjs(fromDate), "day")) &&
      (!toDate || rowDate.isSameOrBefore(dayjs(toDate), "day"))
    );
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortColumnIndex === null) return 0;

    const valA = a[sortColumnIndex]?.toString().toLowerCase() || "";
    const valB = b[sortColumnIndex]?.toString().toLowerCase() || "";

    // Handle date sorting specifically if the column is a date column
    if (["Issued Date", "Date"].includes(columnHeaders[sortColumnIndex])) {
      const dateA = dayjs(valA);
      const dateB = dayjs(valB);
      if (dateA.isValid() && dateB.isValid()) {
        return sortOrder === "asc" ? dateA.diff(dateB) : dateB.diff(dateA);
      }
    }
    // Handle numeric sorting for time columns
    if (
      ["Previous Working Time", "Today's Working Time", "Total Work"].includes(
        columnHeaders[sortColumnIndex]
      )
    ) {
      const numA = parseFloat(valA) || 0;
      const numB = parseFloat(valB) || 0;
      return sortOrder === "asc" ? numA - numB : numB - numA;
    }

    return sortOrder === "asc"
      ? valA.localeCompare(valB)
      : valB.localeCompare(valA);
  });

  // Combine search and filter
  const filteredAndSearchedData = sortedData.filter(
    (row) =>
      row.slice(0, -1).some(
        (
          cell // Exclude the ID column from general search
        ) => String(cell).toLowerCase().includes(searchTerm.toLowerCase())
      ) && applyFilters(row)
  );

  // Helper to format decimal hours to HH:MM
  const formatToHHMM = (decimalHours) => {
    const totalMinutes = Math.round(parseFloat(decimalHours || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const renderFilterPanel = (
    <Box
      sx={{
        width: isSmallScreen ? "auto" : 300, // Auto width for drawer, fixed for side panel
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {["employee", "subject", "task"].map((key) => (
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
      <Button
        variant="outlined"
        color="primary"
        onClick={() =>
          setFilterValues({
            employee: "",
            subject: "",
            task: "",
            fromDate: "",
            toDate: "",
          })
        }
        sx={{ mt: 3 }}
      >
        Clear Filters
      </Button>
    </Box>
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 4,
        display: "flex",
        flexDirection: isSmallScreen ? "column" : "row",
        px: { xs: 2, md: 3 },
      }}
    >
      {/* 💡 Filter Panel (Conditional Rendering / Drawer) */}
      {isSmallScreen ? (
        <Drawer
          anchor="left"
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          PaperProps={{ sx: { width: 280 } }} // Fixed width for mobile drawer
        >
          {renderFilterPanel}
        </Drawer>
      ) : (
        filtersOpen && (
          <Box
            sx={{
              width: 300,
              borderRight: "1px solid #ccc",
              backgroundColor: "#f8f8f8",
            }}
          >
            {renderFilterPanel}
          </Box>
        )
      )}

      {/* 💡 Table Content Area */}
      <Box sx={{ flexGrow: 1, px: { xs: 0, md: 3 }, mt: { xs: 2, md: 0 } }}>
        {" "}
        {/* Responsive padding and top margin */}
        {/* Header */}
        <Stack
          direction={isSmallScreen ? "column" : "row"} // Stack vertically on small screens
          justifyContent="space-between"
          alignItems={isSmallScreen ? "flex-start" : "center"} // Align items at start for column layout
          mb={2}
          spacing={isSmallScreen ? 1 : 2} // Reduce spacing on small screens
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setFiltersOpen(!filtersOpen)}
              size={isSmallScreen ? "small" : "medium"}
            >
              <FaFilter style={{ color: "black" }} />
            </IconButton>
            <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight="bold">
              List of Timesheet
            </Typography>
          </Stack>

          <Stack
            direction={isExtraSmallScreen ? "column" : "row"} // Stack buttons/search vertically on extra small screens
            spacing={1}
            sx={{ width: isExtraSmallScreen ? "100%" : "auto" }} // Full width for stack on extra small screens
          >
            <TextField
              size="small"
              placeholder="Search..." // More descriptive placeholder
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth={isExtraSmallScreen} // Full width on extra small screens
              sx={{ minWidth: isSmallScreen ? "unset" : 200 }} // Adjust minWidth as needed
            />
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
        </Stack>
        {/* Table */}
        <Paper
          sx={{ p: isExtraSmallScreen ? 1 : 2, backgroundColor: "#f9f9f9" }}
        >
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: "70vh", // 💡 Responsive max height using viewport height
              overflowY: "auto",
              backgroundColor: "#f9f9f9",
              border: 1,
              borderColor: "grey.300",
              borderRadius: 2,
              minWidth: 0, // Prevents overflow on smaller screens
            }}
          >
            <Table stickyHeader size={isExtraSmallScreen ? "small" : "medium"}>
              {" "}
              {/* Smaller table on xs */}
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
                      textAlign: "center",
                      fontSize: isExtraSmallScreen ? "0.7rem" : "0.85rem",
                      whiteSpace: "nowrap",
                      padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                      minWidth: isExtraSmallScreen ? "30px" : "50px", // For '#' column
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
                        textAlign: "center",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.85rem",
                        whiteSpace: "nowrap",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px 12px",
                        minWidth:
                          isExtraSmallScreen &&
                          (header === "Subject" || header === "Task")
                            ? "100px"
                            : "auto", // Ensure some columns are wide enough
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={0.5}
                      >
                        {header}
                        {sortColumnIndex === index && (
                          <SortIcon
                            fontSize="small"
                            style={{
                              transform:
                                sortOrder === "desc"
                                  ? "rotate(180deg)"
                                  : "none",
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSearchedData.length > 0 ? (
                  filteredAndSearchedData.map((row, index) => (
                    <TableRow
                      key={row[row.length - 1] || index} // Use unique ID for key, fallback to index
                      sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
                    >
                      <TableCell
                        sx={{
                          border: 1,
                          textAlign: "center",
                          py: 0.5,
                          fontSize: isExtraSmallScreen ? "0.7rem" : "0.85rem",
                        }}
                      >
                        {index + 1}
                      </TableCell>
                      {row.slice(0, -1).map(
                        (
                          cell,
                          j // Render all cells except the last (ID)
                        ) => (
                          <TableCell
                            key={j}
                            sx={{
                              border: 1,
                              textAlign: "center",
                              py: 0.5,
                              fontSize: isExtraSmallScreen
                                ? "0.7rem"
                                : "0.85rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {["Issued Date", "Date"].includes(columnHeaders[j])
                              ? dayjs(cell).isValid()
                                ? dayjs(cell).format("DD/MM/YYYY")
                                : "-"
                              : [
                                  "Previous Working Time",
                                  "Today's Working Time",
                                  "Total Work",
                                ].includes(columnHeaders[j])
                              ? formatToHHMM(cell)
                              : cell}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columnHeaders.length + 1}
                      align="center"
                      sx={{ border: 1, textAlign: "center", py: 0.5 }}
                    >
                      No records found
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
