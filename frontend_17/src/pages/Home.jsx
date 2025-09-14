import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getHomeSummary, getTicketSummaryByRole } from "../api/homeApi";

const headerStyle = {
  backgroundColor: "grey",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "14px",
};

const cellStyle = {
  border: "1px solid #ccc",
  padding: "6px 12px",
  fontSize: "14px",
};

const orangeText = {
  color: "#f26522",
  fontWeight: "bold",
  cursor: "pointer",
};

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [roleFilter, setRoleFilter] = useState("client");
  const [roleBaseSummary, setRoleBasedSummary] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getHomeSummary();
        setSummary(data);
        if (roleFilter !== "all") {
          const roleSummary = await getTicketSummaryByRole(roleFilter);
          setRoleBasedSummary(roleSummary);
        } else {
          setRoleBasedSummary([]);
        }
      } catch (err) {
        console.error("Failed to fetch home summary:", err);
      }
    };

    fetchSummary();
  }, [roleFilter]);

  if (!summary) return <div>Loading...</div>;

  const { ticketSummary, employeeSummary, userSummary } = summary;

  // const renderUserSummary = (users) => (
  //   <Grid item xs={12} sm={10} md={3}>
  //     {users
  //       .filter((user) => roleFilter === "all" || user.role === roleFilter)
  //       .map((user, index) => (
  //         <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
  //           <Table size="small">
  //             <TableHead>
  //               <TableRow>
  //                 <TableCell sx={headerStyle} colSpan={4}>
  //                   {user.name} [{user.email}]
  //                 </TableCell>
  //               </TableRow>
  //               <TableRow>
  //                 <TableCell sx={headerStyle}>Open</TableCell>
  //                 <TableCell sx={headerStyle}>InProcess</TableCell>
  //                 <TableCell sx={headerStyle}>Closed</TableCell>
  //                 <TableCell sx={headerStyle}>Handover</TableCell>
  //               </TableRow>
  //             </TableHead>
  //             <TableBody>
  //               <TableRow>
  //                 {["open", "inProcess", "closed", "handover"].map((key) => (
  //                   <TableCell
  //                     key={key}
  //                     sx={{ ...cellStyle, ...orangeText }}
  //                     onClick={() =>
  //                       navigate(`/ticket?userId=${user.userId}&status=${key}`)
  //                     }
  //                   >
  //                     {user.ticketStatus[key] || 0}
  //                   </TableCell>
  //                 ))}
  //               </TableRow>
  //             </TableBody>
  //           </Table>
  //         </Paper>
  //       ))}
  //   </Grid>
  // );

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Grid container spacing={3} wrap="nowrap" sx={{ overflowX: "auto" }}>
        {/* Ticket Summary */}
        <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
          <Paper
            elevation={2}
            sx={{ p: 1, maxHeight: "75vh", overflowY: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerStyle}>#</TableCell>
                  <TableCell sx={headerStyle}>Ticket</TableCell>
                  <TableCell sx={headerStyle}>Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["Total Ticket", ticketSummary.total],
                  ["Open Ticket", ticketSummary.open, "open"],
                  ["In Process Ticket", ticketSummary.inProcess, "inProcess"],
                  ["Closed Ticket", ticketSummary.closed, "closed"],
                  ["Handover to Customer", ticketSummary.handover, "handover"],
                ].map(([label, count, status], index) => (
                  <TableRow key={index}>
                    <TableCell sx={cellStyle}>{index + 1}</TableCell>
                    <TableCell sx={cellStyle}>{label}</TableCell>
                    <TableCell
                      sx={{ ...cellStyle, ...orangeText }}
                      onClick={() =>
                        status && navigate(`/ticket?status=${status}`)
                      }
                    >
                      {count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* Employee Summary */}
        <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
          <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
            {employeeSummary.map((emp, index) => (
              <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerStyle} colSpan={5}>
                        {emp.name} [{emp.email}]
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={headerStyle}>Open</TableCell>
                      <TableCell sx={headerStyle}>InProcess</TableCell>
                      <TableCell sx={headerStyle}>Closed</TableCell>
                      <TableCell sx={headerStyle}>Handover</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {["open", "inProcess", "closed", "handover"].map(
                        (key) => (
                          <TableCell
                            key={key}
                            sx={{ ...cellStyle, ...orangeText }}
                            onClick={() =>
                              navigate(
                                `/ticket?employeeId=${emp.employeeId}&status=${key.toLowerCase()}`
                              )
                            }
                          >
                            {emp.ticketStatus[key] || 0}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            ))}
          </Box>
        </Grid>

        {/* Conditional User Summary */}
        <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
          <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
            {(userSummary).map(
              (user, index) => (
                <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerStyle} colSpan={4}>
                          {user.name} [{user.email}]
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={headerStyle}>Open</TableCell>
                        <TableCell sx={headerStyle}>InProcess</TableCell>
                        <TableCell sx={headerStyle}>Closed</TableCell>
                        <TableCell sx={headerStyle}>Handover</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        {["open", "inProcess", "closed", "handover"].map(
                          (key) => (
                            <TableCell
                              key={key}
                              sx={{ ...cellStyle, ...orangeText }}
                              onClick={() =>
                                navigate(
                                  `/ticket?userId=${user.userId}&status=${key.toLowerCase()}`
                                )
                              }
                            >
                              {user.ticketStatus?.[key] || 0}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              )
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
