import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import dayjs from "dayjs";

import {
  getTimesheetByEmployeeId,
  addTimesheet,
} from "../../api/timesheetService";
import { getTicketsByEmployeeId } from "../../api/ticketApi";

export default function MyTimesheet() {
  const [searchText, setSearchText] = useState("");
  const [timesheetData, setTimesheetData] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    employee: "",
    ticket: "",
    ticketNo: "",
    subject: "",
    issuedDate: "",
    task: "",
    date: "",
    workingTime: "", // This will now store HH:MM
    previousWork: "", // Still stored as decimal hours for calculation
    totalWork: "", // Still stored as decimal hours for calculation
  });

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("username");

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const timesheets = await getTimesheetByEmployeeId(userId);
        const tickets = await getTicketsByEmployeeId(userId);
        const filterTickets = tickets.filter((t) => t.status !== "close");
        setTimesheetData(timesheets);
        setTickets(filterTickets);
        setFormData((prev) => ({
          ...prev,
          employee: userName || "Current User",
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [userId]);

  // Helper to convert HH:MM to decimal hours
  const convertHHMMToDecimal = (hhmm) => {
    if (!hhmm) return 0;
    const parts = hhmm.split(":");
    const hours = parseInt(parts[0] || 0, 10);
    const minutes = parseInt(parts[1] || 0, 10);
    // Ensure minutes are not negative or exceed 59, and hours do not exceed 23
    if (minutes < 0 || minutes > 59 || hours < 0 || hours > 23) {
      return 0; // Return 0 for invalid time to prevent incorrect calculations
    }
    return hours + minutes / 60;
  };

  // Helper to convert decimal hours to HH:MM
  const formatToHHMM = (decimalHours) => {
    const totalMinutes = Math.round(parseFloat(decimalHours || 0) * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "ticket") {
      const selected = tickets.find((t) => t._id === value);
      if (selected) {
        // Calculate previousWork in decimal hours
        const previousWorkDecimal = timesheetData
          .filter((row) => row.ticket === value)
          .reduce((sum, row) => sum + parseFloat(row.workingTime || 0), 0); // Assuming row.workingTime from backend is decimal

        const issuedDateFormatted = selected.createdTime
          ? dayjs(selected.createdTime, "DD MMM YYYY, hh:mm a").format(
              "YYYY-MM-DD"
            )
          : "";

        setFormData((prev) => ({
          ...prev,
          ticket: value,
          ticketNo: selected.ticketNo,
          subject: selected.subject || "",
          issuedDate: issuedDateFormatted,
          previousWork: previousWorkDecimal.toFixed(2), // Store as decimal for calculations
          workingTime: "", // Reset today's working time when ticket changes
          totalWork: previousWorkDecimal.toFixed(2), // Initialize total work with previous work
        }));
      }
    } else if (name === "workingTime") {
      // Allow user to type freely, then validate for calculation/submission
      let newWorkingTime = value;

      // Basic formatting as user types: add colon after 2 digits if missing
      if (
        newWorkingTime.length === 2 &&
        !newWorkingTime.includes(":") &&
        /^\d+$/.test(newWorkingTime)
      ) {
        newWorkingTime += ":";
      }

      // Limit input to HH:MM format (e.g., "23:59")
      const cleanedValue = newWorkingTime.replace(/[^0-9:]/g, ""); // Allow only digits and colon
      const parts = cleanedValue.split(":");
      let hours = parts[0] || "";
      let minutes = parts[1] || "";

      // Basic validation for hours and minutes during typing
      if (hours.length > 2) hours = hours.substring(0, 2);
      if (minutes.length > 2) minutes = minutes.substring(0, 2);

      // Reconstruct the value, making sure colon is only present if hours are entered
      if (hours && minutes) {
        newWorkingTime = `${hours}:${minutes}`;
      } else if (hours) {
        newWorkingTime = hours + (cleanedValue.includes(":") ? ":" : "");
      } else {
        newWorkingTime = "";
      }

      // Now, calculate the total work based on the *valid part* of the input
      let todayWorkDecimal = 0;
      const regex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])$/; // Strict validation for calculation
      if (regex.test(newWorkingTime)) {
        todayWorkDecimal = convertHHMMToDecimal(newWorkingTime);
      }

      const prevWorkDecimal = parseFloat(formData.previousWork || 0);
      const updatedTotalWorkDecimal = (
        prevWorkDecimal + todayWorkDecimal
      ).toFixed(2);

      setFormData((prev) => ({
        ...prev,
        workingTime: newWorkingTime, // Store the HH:MM string, even if partial
        totalWork: updatedTotalWorkDecimal, // Store decimal for calculations, display HH:MM later
      }));
    } else if (name === "date") {
      setFormData((prev) => ({
        ...prev,
        date: value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedDate = dayjs(formData.date);
    const today = dayjs();
    const yesterday = today.subtract(1, "day");

    // Get the start of Saturday for Monday's check
    const saturday = today.day() === 1 ? today.subtract(2, "day") : null;

    if (selectedDate.isAfter(today, "day")) {
      alert("You cannot fill timesheet for a future date.");
      return;
    }

    // Check for allowed past dates: today, yesterday, or Saturday if today is Monday
    const isAllowedPastDate =
      selectedDate.isSame(today, "day") ||
      selectedDate.isSame(yesterday, "day") ||
      (today.day() === 1 && saturday && selectedDate.isSame(saturday, "day"));

    if (!isAllowedPastDate) {
      alert(
        "You can only fill today's or yesterday's timesheet. On Mondays, you can fill Saturday's."
      );
      return;
    }

    // --- Critical validation before submission ---
    const regex = /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])$/;
    if (!regex.test(formData.workingTime)) {
      alert("Please enter Today's Working Time in HH:MM format (e.g., 08:30).");
      return;
    }
    // --- End Critical validation ---

    try {
      const payload = {
        employee: formData.employee,
        employeeId: userId,
        ticket: formData.ticket,
        ticketNo: formData.ticketNo,
        subject: formData.subject,
        issuedDate: formData.issuedDate,
        task: formData.task,
        date: formData.date,
        workingTime: convertHHMMToDecimal(formData.workingTime), // Convert HH:MM to decimal for backend
        totalWork: parseFloat(formData.totalWork), // totalWork is already in decimal
      };

      await addTimesheet(payload);
      alert("Timesheet submitted successfully!");

      const updated = await getTimesheetByEmployeeId(userId);
      setTimesheetData(updated);
      setShowForm(false);
      setFormData((prev) => ({
        employee: prev.employee,
        ticket: "",
        subject: "",
        issuedDate: "",
        task: "",
        date: "",
        workingTime: "", // Reset to empty string for HH:MM
        previousWork: "",
        totalWork: "",
      }));
    } catch (err) {
      alert(
        "Error submitting timesheet: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error submitting timesheet:", err);
    }
  };

  const filteredRows = timesheetData.filter((row) => {
    const rowDate = dayjs(row.date);
    const today = dayjs();
    // Filter to show timesheets for the last 4 days (including today)
    return rowDate.isAfter(today.subtract(4, "day"), "day");
  });

  const cellStyle = {
    border: 1,
    textAlign: "center",
    py: 0.5,
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {showForm ? "Add Timesheet" : "List of Timesheet"}
      </Typography>
      <Typography variant="body2" color="gray" gutterBottom>
        Home → {showForm ? "Add Timesheet" : "List of Timesheet"}
      </Typography>

      <Stack direction="row" spacing={2} my={2}>
        <Button
          variant="contained"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setFormData({
                employee: userName || "Current User",
                ticket: "",
                subject: "",
                issuedDate: "",
                task: "",
                date: "",
                workingTime: "",
                previousWork: "",
                totalWork: "",
              });
            } else {
              setShowForm(true);
              setFormData((prev) => ({
                ...prev,
                employee: userName || "Current User",
              }));
            }
          }}
        >
          {showForm ? "Close Form" : "Add Timesheet"}
        </Button>

        {!showForm && (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <TextField
              size="small"
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ width: 250 }}
            />
          </>
        )}
      </Stack>

      {showForm && (
        <Paper
          elevation={3}
          sx={{ mb: 4, maxHeight: "40vh", overflowY: "auto", p: 3 }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ minWidth: 300 }}>
              <TextField
                label="Employee"
                value={formData.employee}
                name="employee"
                disabled
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Ticket</InputLabel>
                <Select
                  name="ticket"
                  value={formData.ticket}
                  onChange={handleFormChange}
                  required
                >
                  {tickets.map((t) => (
                    <MenuItem key={t._id} value={t._id}>
                      {t.ticketNo} - {t.subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Subject"
                name="subject"
                value={formData.subject}
                disabled
                fullWidth
              />
              <TextField
                label="Issued Date"
                name="issuedDate"
                type="date"
                value={formData.issuedDate}
                InputLabelProps={{ shrink: true }}
                disabled
                fullWidth
              />
              <TextField
                label="Task"
                name="task"
                value={formData.task}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
                inputProps={{
                  max: dayjs().format("YYYY-MM-DD"),
                  min: (() => {
                    const today = dayjs();
                    const yesterday = today
                      .subtract(1, "day")
                      .format("YYYY-MM-DD");
                    // If today is Monday (day() === 1), allow selecting Saturday (2 days ago)
                    const saturday =
                      today.day() === 1
                        ? today.subtract(2, "day").format("YYYY-MM-DD")
                        : null;
                    return today.day() === 1 ? saturday : yesterday;
                  })(),
                }}
              />
              <TextField
                label="Previous Working Time"
                name="previousWork"
                value={formatToHHMM(formData.previousWork)} // Display in HH:MM
                disabled
                fullWidth
              />
              <TextField
                label="Today's Working Time (HH:MM)" // Updated label
                name="workingTime"
                value={formData.workingTime} // Stored as HH:MM
                onChange={handleFormChange}
                placeholder="HH:MM"
                required
                fullWidth
                // Removed pattern from inputProps to allow typing freely
                // Validation will be handled in handleFormChange and handleSubmit
                helperText="Enter time in HH:MM format (e.g., 08:30)"
              />
              <TextField
                label="Total Work"
                name="totalWork"
                value={formatToHHMM(formData.totalWork)} // Display in HH:MM
                disabled
                fullWidth
              />
              <Button type="submit" variant="contained">
                Submit Timesheet
              </Button>
            </Stack>
          </form>
        </Paper>
      )}

      {!showForm && (
        <Paper elevation={3}>
          <TableContainer sx={{ maxHeight: "45vh", overflow: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {[
                    "#",
                    "Employee",
                    "Ticket",
                    "Subject",
                    "Issued Date",
                    "Task",
                    "Date",
                    "Previous Working Time",
                    "Today's Working Time",
                    "Total Work",
                  ].map((col, idx) => (
                    <TableCell
                      key={idx}
                      sx={{
                        border: 1,
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        backgroundColor: "grey",
                        whiteSpace: "nowrap",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => {
                    // Recalculate previousWork for display from timesheetData
                    const prevWorkForDisplay = timesheetData
                      .filter(
                        (r) => r.ticket === row.ticket && r.date !== row.date
                      )
                      .reduce(
                        (sum, r) => sum + parseFloat(r.workingTime || 0),
                        0
                      )
                      .toFixed(2);
                    return (
                      <TableRow
                        key={index}
                        sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
                      >
                        <TableCell sx={cellStyle}>{index + 1}</TableCell>
                        <TableCell sx={cellStyle}>
                          {row.employee || "N/A"}
                        </TableCell>
                        <TableCell sx={cellStyle}>{row.ticketNo}</TableCell>
                        <TableCell sx={cellStyle}>{row.subject}</TableCell>
                        <TableCell sx={cellStyle}>
                          {row.issuedDate
                            ? dayjs(row.issuedDate).format("DD/MM/YYYY")
                            : "-"}
                        </TableCell>
                        <TableCell sx={cellStyle}>{row.task}</TableCell>
                        <TableCell sx={cellStyle}>
                          {row.date
                            ? dayjs(row.date).format("DD/MM/YYYY")
                            : "-"}
                        </TableCell>
                        <TableCell sx={cellStyle}>
                          {formatToHHMM(prevWorkForDisplay)}
                        </TableCell>
                        <TableCell sx={cellStyle}>
                          {formatToHHMM(row.workingTime)}
                        </TableCell>
                        <TableCell sx={cellStyle}>
                          {formatToHHMM(row.totalWork)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={cellStyle}>
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}
