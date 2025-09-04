import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getEmployeeTicketSummary } from "../../api/homeApi";

export default function E_home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const statusMap = {
    "Open Ticket": "open",
    "In Process Ticket": "inprocess",
    "Closed Ticket": "closed",
    "Handover to Customer": "handover",
    "Total Ticket": "total",
    "Today's Ticket": "today",
    "Assigned Ticket": "assigned",
  };

  useEffect(() => {
    const fetchTicketSummary = async () => {
      const employeeId = localStorage.getItem("userId");
      if (!employeeId) return console.error("User ID not found in localStorage");

      try {
        const summary = await getEmployeeTicketSummary(employeeId);
        setRows(summary);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketSummary();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom fontSize={{ xs: 18, sm: 20 }}>
        Ticket Summary
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table size="small" sx={{ border: 1, borderColor: "divider" }}>
          <TableHead sx={{ backgroundColor: "grey" }}>
            <TableRow>
              {["#", "Ticket", "Count"].map((header, i) => (
                <TableCell key={i} sx={{ border: 1, color: "#fff", fontWeight: "bold" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const isClickable = !!statusMap[row.label] && row.total > 0;
              return (
                <TableRow
                  key={index}
                  sx={{
                    cursor: isClickable ? "pointer" : "default",
                    "&:hover": { backgroundColor: isClickable ? "#f5f5f5" : "inherit" },
                  }}
                  onClick={() =>
                    isClickable && navigate(`/employee/my-tickets?status=${statusMap[row.label]}`)
                  }
                >
                  <TableCell sx={{ border: 1 }}>{index + 1}</TableCell>
                  <TableCell sx={{ border: 1 }}>{row.label}</TableCell>
                  <TableCell
                    sx={{
                      border: 1,
                      fontWeight: "bold",
                      color: isClickable ? "#f26522" : "inherit",
                    }}
                  >
                    {row.total}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={6} textAlign="center" color="gray">
        <Typography variant="body2" fontWeight="bold" mt={4}>
          CLICK ERP SERVICES PVT. LTD.
        </Typography>
        <Typography variant="body2">
          09, Ramnath Park, Lokmanya Nagar, Near Bhistbagh Naka, Savedi,
          Ahmednagar, Maharashtra, India - 414 003
        </Typography>
        <Typography variant="body2">
          <strong>Phone No.:</strong> 090285 68867, <strong>Email Id:</strong> yogesh.kale@clickerpservices.com
        </Typography>
        <Typography variant="body2">
          <strong>Website:</strong> clickerpservices.com
        </Typography>
        <Typography variant="caption" display="block" mt={2}>
          ©2025 Click ERP Services Pvt. Ltd.
        </Typography>
      </Box>
    </Container>
  );
}