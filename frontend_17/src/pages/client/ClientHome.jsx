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
import { getTicketsByUserId } from "../../api/ticketApi";

export default function ClientHome() {
  const [ticketStats, setTicketStats] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const fetchTickets = async () => {
      try {
        const tickets = await getTicketsByUserId(userId);

        const stats = {
          total: tickets.length,
          today: 0,
          open: 0,
          inProcess: 0,
          closed: 0,
          handover: 0,
          working: 0,
          assigned: tickets.filter((t) => !!t.employeeId).length,
        };

        const todayStr = new Date().toISOString().split("T")[0];

        tickets.forEach((t) => {
          const created = t.createdTime?.split("T")[0];
          if (created === todayStr) stats.today++;

          switch (t.mainStatus) {
            case "open":
              stats.open++;
              break;
            case "inProcess":
              stats.inProcess++;
              break;
            case "closed":
              stats.closed++;
              break;
            case "handover":
              stats.handover++;
              break;
            case "working":
              stats.working++;
              break;
            default:
              break;
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
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Ticket Summary
      </Typography>

      <TableContainer
        component={Paper}
        sx={{ border: 1, borderColor: "grey.300" }}
      >
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#646d79" }}>
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
            {rows.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <TableCell sx={{ border: 1 }}>{row.id}</TableCell>
                <TableCell sx={{ border: 1 }}>{row.label}</TableCell>
                <TableCell sx={{ border: 1 }}>{row.total}</TableCell>
              </TableRow>
            ))}
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
