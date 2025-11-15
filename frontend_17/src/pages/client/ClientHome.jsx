// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Container,
//   Paper,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
// } from "@mui/material";
// // import { getTicketsByUserId } from "../../api/ticketApi";
// import { getAllTickets } from "../../api/ticketApi";

// export default function ClientHome() {
//   const [ticketStats, setTicketStats] = useState(null);

//   useEffect(() => {
//     const clientId = localStorage.getItem("userId");
//     const username = localStorage.getItem("username") || "";

//     if (!clientId) return;

//     const clientProjectName = username.trim().toLowerCase();

//     const fetchTickets = async () => {
//       try {
//         // ⛔ OLD: getTicketsByUserId(userId)
//         // ✅ NEW: get all tickets so we can filter employee-created ones
//         const allTickets = await getAllTickets();

//         // ⭐ INCLUDE BOTH TYPES
//         const visibleTickets = allTickets.filter((t) => {
//           const isClientCreated = t.userId === clientId;

//           const isEmployeeCreatedForClient =
//             t.userId === t.employeeId &&
//             (t.project || "").trim().toLowerCase() === clientProjectName;

//           return isClientCreated || isEmployeeCreatedForClient;
//         });

//         // -------- Summary Stats --------
//         const stats = {
//           total: visibleTickets.length,
//           today: 0,
//           open: 0,
//           inProcess: 0,
//           closed: 0,
//           handover: 0,
//           working: 0,
//           assigned: visibleTickets.filter((t) => !!t.employeeId).length,
//         };

//         const todayStr = new Date().toISOString().split("T")[0];

//         visibleTickets.forEach((t) => {
//           const created = t.createdTime?.split("T")[0];
//           if (created === todayStr) stats.today++;

//           switch (t.mainStatus) {
//             case "open":
//               stats.open++;
//               break;
//             case "inProcess":
//               stats.inProcess++;
//               break;
//             case "closed":
//               stats.closed++;
//               break;
//             case "handover":
//               stats.handover++;
//               break;
//             case "working":
//               stats.working++;
//               break;
//             default:
//               break;
//           }
//         });

//         setTicketStats(stats);
//       } catch (err) {
//         console.error("Failed to load user tickets", err);
//       }
//     };

//     fetchTickets();
//   }, []);

//   if (!ticketStats) return <div>Loading...</div>;

//   const rows = [
//     { id: 1, label: "Total Ticket", total: ticketStats.total },
//     { id: 2, label: "Today's Ticket", total: ticketStats.today },
//     { id: 3, label: "Open Ticket", total: ticketStats.open },
//     { id: 4, label: "In Process Ticket", total: ticketStats.inProcess },
//     { id: 5, label: "Closed Ticket", total: ticketStats.closed },
//     { id: 6, label: "Handover to Customer", total: ticketStats.handover },
//     { id: 7, label: "Assigned Ticket", total: ticketStats.assigned },
//   ];

//   return (
//     <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
//       <Typography variant="h6" fontWeight="bold" gutterBottom>
//         Ticket Summary
//       </Typography>

//       <TableContainer
//         component={Paper}
//         sx={{ border: 1, borderColor: "grey.300" }}
//       >
//         <Table size="small">
//           <TableHead sx={{ backgroundColor: "#646d79" }}>
//             <TableRow>
//               <TableCell sx={{ border: 1, color: "#fff", fontWeight: "bold" }}>
//                 #
//               </TableCell>
//               <TableCell sx={{ border: 1, color: "#fff", fontWeight: "bold" }}>
//                 Ticket
//               </TableCell>
//               <TableCell sx={{ border: 1, color: "#fff", fontWeight: "bold" }}>
//                 Count
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {rows.map((row) => (
//               <TableRow
//                 key={row.id}
//                 hover
//                 sx={{
//                   "&:hover": {
//                     backgroundColor: "rgba(0, 0, 0, 0.04)",
//                   },
//                 }}
//               >
//                 <TableCell sx={{ border: 1 }}>{row.id}</TableCell>
//                 <TableCell sx={{ border: 1 }}>{row.label}</TableCell>
//                 <TableCell sx={{ border: 1 }}>{row.total}</TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Box mt={6} textAlign="center" color="gray">
//         <Typography variant="body2" fontWeight="bold" mt={4}>
//           CLICK ERP SERVICES PVT. LTD.
//         </Typography>
//         <Typography variant="body2">
//           09, Ramnath Park, Lokmanya Nagar, Near Bhistbagh Naka, Savedi,
//           Ahmednagar, Maharashtra, India - 414 003
//         </Typography>
//         <Typography variant="body2">
//           <strong>Phone No.:</strong> 090285 68867, <strong>Email Id:</strong>{" "}
//           yogesh.kale@clickerpservices.com
//         </Typography>
//         <Typography variant="body2">
//           <strong>Website:</strong> clickerpservices.com
//         </Typography>
//         <Typography variant="caption" display="block" mt={2}>
//           ©2025 Click ERP Services Pvt. Ltd.
//         </Typography>
//       </Box>
//     </Container>
//   );
// }

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
import { getAllTickets } from "../../api/ticketApi";

export default function ClientHome() {
  const [ticketStats, setTicketStats] = useState(null);

  useEffect(() => {
    const clientId = localStorage.getItem("userId");
    const username = localStorage.getItem("username") || ""; // Project Name stored as Username

    if (!clientId || !username) return;

    const clientProjectName = username.trim().toLowerCase();

    const fetchTickets = async () => {
      try {
        // ⭐ Fetch all tickets
        const allTickets = await getAllTickets();

        // ⭐ FINAL FILTER — MATCH BY PROJECT NAME (correct logic)
        const visibleTickets = allTickets.filter((t) => {
          const projectName = (t.project || "").trim().toLowerCase();

          const isClientCreated = t.userId === clientId;
          const isEmployeeCreatedForClient = projectName === clientProjectName;

          return isClientCreated || isEmployeeCreatedForClient;
        });

        // -------- Summary Stats --------
        const stats = {
          total: visibleTickets.length,
          today: 0,
          open: 0,
          inProcess: 0,
          closed: 0,
          handover: 0,
          hold: 0,
          working: 0,
          assigned: visibleTickets.filter((t) => !!t.employeeId).length,
        };

        const todayStr = new Date().toISOString().split("T")[0];

        visibleTickets.forEach((t) => {
          const created = t.createdTime?.split("T")[0];
          if (created === todayStr) stats.today++;

          // ⭐ NORMALIZE STATUS — same logic as backend $switch
          const rawStatus = (t.mainStatus || "").trim().toLowerCase();

          let normalized = null;

          if (rawStatus === "open") normalized = "open";
          else if (rawStatus === "closed") normalized = "closed";
          else if (rawStatus === "handover") normalized = "handover";
          else if (rawStatus === "working") normalized = "working";
          else if (rawStatus === "hold") normalized = "hold";
          // Multiple variations from database → inProcess
          else if (
            ["inprocess", "in_process", "in process"].includes(rawStatus)
          ) {
            normalized = "inProcess";
          }

          // -------- APPLY STATUS COUNTS --------
          switch (normalized) {
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
            case "hold":
              stats.hold++;
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
    // If you want to show HOLD also uncomment:
    // { id: 8, label: "Hold Ticket", total: ticketStats.hold },
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
          Ahilyanagar, Maharashtra, India - 414 003
        </Typography>
        <Typography variant="body2">
          <strong>Phone No.:</strong> 090285 68867, <strong>Email Id:</strong>{" "}
          yogesh.kale@clickerpservices.com
        </Typography>
        <Typography variant="body2">
          <strong>Website:</strong> clickerpservices.com
        </Typography>
      </Box>
    </Container>
  );
}
