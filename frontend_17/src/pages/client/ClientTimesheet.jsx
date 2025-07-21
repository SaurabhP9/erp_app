import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
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
import { getTimesheetByUserId } from "../../api/timesheetService";

export default function ClientTimeSheet() {
  const [searchText, setSearchText] = useState("");
  const [timesheetData, setTimesheetData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const data = await getTimesheetByUserId(userId);
        console.log("user client time shee", data)
        setTimesheetData(data);
      } catch (err) {
        console.error("Failed to fetch timesheet:", err);
      }
    };

    fetchData();
  }, []);

  const filteredRows = timesheetData.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        List of Timesheet
      </Typography>
      <Typography variant="body2" color="gray" gutterBottom>
        Home → List of Timesheet
      </Typography>

      <Stack direction="row" spacing={2} my={2}>
        <Button variant="outlined">Excel</Button>
        <Button variant="outlined">PDF</Button>
        <Box sx={{ flexGrow: 1 }} />
        <TextField
          size="small"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ width: 250 }}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "grey" }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Ticket</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Total Work</TableCell>
              {/* <TableCell align="center">Action</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.employee || "N/A"}</TableCell>
                  <TableCell>{row.ticket || "-"}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>{row.task}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.totalWork}</TableCell>
                  {/* <TableCell align="center">
                    <IconButton size="small" color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell> */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
