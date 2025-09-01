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
import { getTicketsByEmployeeId } from "../../api/ticketApi";
import { useNavigate } from "react-router-dom";

export default function E_home() {
  const [ticketStats, setTicketStats] = useState(null);
  const navigate = useNavigate();

  const statusMap = {
    "Open Ticket": "open",
    "In Process Ticket": "inProcess",
    "Closed Ticket": "closed",
    "Handover to Customer": "handover",
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchTickets = async () => {
      try {
        const tickets = await getTicketsByEmployeeId(userId);
        
        const stats = {
          total: tickets.length,
          today: 0,
          assigned: 0,
          open: 0,
          inProcess: 0,
          closed: 0,
          handover: 0,  // will now be based on handoverHistory
          working: 0,
        };
    
        const todayStr = new Date().toISOString().split("T")[0];
    
        tickets.forEach((t) => {
          const created = t.createdTime?.split("T")[0];
          if (created === todayStr) stats.today++;
    
          if (t.employeeId) stats.assigned++;
    
          // Count normal statuses
          const status = t.mainStatus;
          if (status && status != "handover" && stats[status] !== undefined) {
            stats[status]++;
          }
    
          if (
            Array.isArray(t.handoverHistory) &&
            t.handoverHistory.some(
              (h) => h.fromEmployeeId?.toString() === userId?.toString()
            )
          ) {
            stats.handover++;
          }
          
        });
    
        setTicketStats(stats);
      } catch (err) {
        console.error("Failed to load user tickets", err);
      }
    };    

    fetchTickets();
  }, []);

  if (!ticketStats) return <div>Loading...</div>;

  const rows = [
    { id: 1, label: "Total Ticket", total: ticketStats.total },
    { id: 2, label: "Today's Ticket", total: ticketStats.today },
    { id: 3, label: "Open Ticket", total: ticketStats.open },
    { id: 4, label: "In Process Ticket", total: ticketStats.inProcess },
    { id: 5, label: "Closed Ticket", total: ticketStats.closed },
    { id: 6, label: "Handover to Customer", total: ticketStats.handover },
    { id: 7, label: "Assigned Ticket", total: ticketStats.assigned },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        fontSize={{ xs: 18, sm: 20 }}
      >
        Ticket Summary
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table size="small" sx={{ border: 1, borderColor: "divider" }}>
          <TableHead sx={{ backgroundColor: "grey" }}>
            <TableRow>
              <TableCell sx={{ border: 1, color: "#fff", fontWeight: "bold" }}>
                #
              </TableCell>
              <TableCell sx={{ border: 1, color: "#fff", fontWeight: "bold" }}>
                Ticket
              </TableCell>
              <TableCell sx={{ border: 1, color: "#fff", fontWeight: "bold" }}>
                Count
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isClickable = !!statusMap[row.label] && row.total > 0;
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    cursor: isClickable ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor: isClickable ? "#f5f5f5" : "inherit",
                    },
                  }}
                  onClick={() => {
                    if (isClickable) {
                      navigate(
                        `/employee/my-tickets?status=${statusMap[row.label]}`
                      );
                    }
                  }}
                >
                  <TableCell sx={{ border: 1 }}>{row.id}</TableCell>
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
          <strong>Phone No.:</strong> 090285 68867, <strong>Email Id:</strong>{" "}
          yogesh.kale@clickerpservices.com
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
