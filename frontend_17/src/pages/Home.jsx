// // import React, { useEffect, useState } from "react";
// // import {
// //   Container,
// //   Grid,
// //   Paper,
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableRow,
// //   Select,
// //   MenuItem,
// //   FormControl,
// //   InputLabel,
// //   Box,
// // } from "@mui/material";
// // import { useNavigate } from "react-router-dom";
// // import { getHomeSummary, getTicketSummaryByRole } from "../api/homeApi";

// // const headerStyle = {
// //   backgroundColor: "grey",
// //   color: "#fff",
// //   fontWeight: "bold",
// //   fontSize: "14px",
// // };

// // const cellStyle = {
// //   border: "1px solid #ccc",
// //   padding: "6px 12px",
// //   fontSize: "14px",
// // };

// // const orangeText = {
// //   color: "#f26522",
// //   fontWeight: "bold",
// //   cursor: "pointer",
// // };

// // export default function Home() {
// //   const [summary, setSummary] = useState(null);
// //   const [roleFilter, setRoleFilter] = useState("client");
// //   const [roleBaseSummary, setRoleBasedSummary] = useState([]);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const fetchSummary = async () => {
// //       try {
// //         const data = await getHomeSummary();
// //         setSummary(data);
// //         if (roleFilter !== "all") {
// //           const roleSummary = await getTicketSummaryByRole(roleFilter);
// //           setRoleBasedSummary(roleSummary);
// //         } else {
// //           setRoleBasedSummary([]);
// //         }
// //       } catch (err) {
// //         console.error("Failed to fetch home summary:", err);
// //       }
// //     };

// //     fetchSummary();
// //   }, [roleFilter]);

// //   if (!summary) return <div>Loading...</div>;

// //   const { ticketSummary, employeeSummary, userSummary } = summary;

// //   // const renderUserSummary = (users) => (
// //   //   <Grid item xs={12} sm={10} md={3}>
// //   //     {users
// //   //       .filter((user) => roleFilter === "all" || user.role === roleFilter)
// //   //       .map((user, index) => (
// //   //         <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
// //   //           <Table size="small">
// //   //             <TableHead>
// //   //               <TableRow>
// //   //                 <TableCell sx={headerStyle} colSpan={4}>
// //   //                   {user.name} [{user.email}]
// //   //                 </TableCell>
// //   //               </TableRow>
// //   //               <TableRow>
// //   //                 <TableCell sx={headerStyle}>Open</TableCell>
// //   //                 <TableCell sx={headerStyle}>InProcess</TableCell>
// //   //                 <TableCell sx={headerStyle}>Closed</TableCell>
// //   //                 <TableCell sx={headerStyle}>Handover</TableCell>
// //   //               </TableRow>
// //   //             </TableHead>
// //   //             <TableBody>
// //   //               <TableRow>
// //   //                 {["open", "inProcess", "closed", "handover"].map((key) => (
// //   //                   <TableCell
// //   //                     key={key}
// //   //                     sx={{ ...cellStyle, ...orangeText }}
// //   //                     onClick={() =>
// //   //                       navigate(`/ticket?userId=${user.userId}&status=${key}`)
// //   //                     }
// //   //                   >
// //   //                     {user.ticketStatus[key] || 0}
// //   //                   </TableCell>
// //   //                 ))}
// //   //               </TableRow>
// //   //             </TableBody>
// //   //           </Table>
// //   //         </Paper>
// //   //       ))}
// //   //   </Grid>
// //   // );

// //   return (
// //     <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
// //       <Grid container spacing={3} wrap="nowrap" sx={{ overflowX: "auto" }}>
// //         {/* Ticket Summary */}
// //         <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
// //           <Paper
// //             elevation={2}
// //             sx={{ p: 1, maxHeight: "75vh", overflowY: "auto" }}
// //           >
// //             <Table size="small">
// //               <TableHead>
// //                 <TableRow>
// //                   <TableCell sx={headerStyle}>#</TableCell>
// //                   <TableCell sx={headerStyle}>Ticket</TableCell>
// //                   <TableCell sx={headerStyle}>Count</TableCell>
// //                 </TableRow>
// //               </TableHead>
// //               <TableBody>
// //                 {[
// //                   ["Total Ticket", ticketSummary.total],
// //                   ["Open Ticket", ticketSummary.open, "open"],
// //                   ["In Process Ticket", ticketSummary.inProcess, "inProcess"],
// //                   ["Closed Ticket", ticketSummary.closed, "closed"],
// //                   ["Handover to Customer", ticketSummary.handover, "handover"],
// //                 ].map(([label, count, status], index) => (
// //                   <TableRow key={index}>
// //                     <TableCell sx={cellStyle}>{index + 1}</TableCell>
// //                     <TableCell sx={cellStyle}>{label}</TableCell>
// //                     <TableCell
// //                       sx={{ ...cellStyle, ...orangeText }}
// //                       onClick={() =>
// //                         status && navigate(`/ticket?status=${status}`)
// //                       }
// //                     >
// //                       {count}
// //                     </TableCell>
// //                   </TableRow>
// //                 ))}
// //               </TableBody>
// //             </Table>
// //           </Paper>
// //         </Grid>

// //         {/* Employee Summary */}
// //         <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
// //           <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
// //             {employeeSummary.map((emp, index) => (
// //               <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
// //                 <Table size="small">
// //                   <TableHead>
// //                     <TableRow>
// //                       <TableCell sx={headerStyle} colSpan={5}>
// //                         {emp.name} [{emp.email}]
// //                       </TableCell>
// //                     </TableRow>
// //                     <TableRow>
// //                       <TableCell sx={headerStyle}>Open</TableCell>
// //                       <TableCell sx={headerStyle}>InProcess</TableCell>
// //                       <TableCell sx={headerStyle}>Closed</TableCell>
// //                       <TableCell sx={headerStyle}>Handover</TableCell>
// //                     </TableRow>
// //                   </TableHead>
// //                   <TableBody>
// //                     <TableRow>
// //                       {["open", "inProcess", "closed", "handover"].map(
// //                         (key) => (
// //                           <TableCell
// //                             key={key}
// //                             sx={{ ...cellStyle, ...orangeText }}
// //                             onClick={() =>
// //                               navigate(
// //                                 `/ticket?employeeId=${emp.employeeId}&status=${key.toLowerCase()}`
// //                               )
// //                             }
// //                           >
// //                             {emp.ticketStatus[key] || 0}
// //                           </TableCell>
// //                         )
// //                       )}
// //                     </TableRow>
// //                   </TableBody>
// //                 </Table>
// //               </Paper>
// //             ))}
// //           </Box>
// //         </Grid>

// //         {/* Conditional User Summary */}
// //         <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
// //           <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
// //             {(userSummary).map(
// //               (user, index) => (
// //                 <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
// //                   <Table size="small">
// //                     <TableHead>
// //                       <TableRow>
// //                         <TableCell sx={headerStyle} colSpan={4}>
// //                           {user.name} [{user.email}]
// //                         </TableCell>
// //                       </TableRow>
// //                       <TableRow>
// //                         <TableCell sx={headerStyle}>Open</TableCell>
// //                         <TableCell sx={headerStyle}>InProcess</TableCell>
// //                         <TableCell sx={headerStyle}>Closed</TableCell>
// //                         <TableCell sx={headerStyle}>Handover</TableCell>
// //                       </TableRow>
// //                     </TableHead>
// //                     <TableBody>
// //                       <TableRow>
// //                         {["open", "inProcess", "closed", "handover"].map(
// //                           (key) => (
// //                             <TableCell
// //                               key={key}
// //                               sx={{ ...cellStyle, ...orangeText }}
// //                               onClick={() =>
// //                                 navigate(
// //                                   `/ticket?userId=${user.userId}&status=${key.toLowerCase()}`
// //                                 )
// //                               }
// //                             >
// //                               {user.ticketStatus?.[key] || 0}
// //                             </TableCell>
// //                           )
// //                         )}
// //                       </TableRow>
// //                     </TableBody>
// //                   </Table>
// //                 </Paper>
// //               )
// //             )}
// //           </Box>
// //         </Grid>
// //       </Grid>
// //     </Container>
// //   );
// // }

// import React, { useEffect, useState } from "react";
// import {
//   Container,
//   Grid,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   Box,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { getHomeSummary, getTicketSummaryByRole } from "../api/homeApi";

// const headerStyle = {
//   backgroundColor: "grey",
//   color: "#fff",
//   fontWeight: "bold",
//   fontSize: "14px",
// };

// const cellStyle = {
//   border: "1px solid #ccc",
//   padding: "6px 12px",
//   fontSize: "14px",
// };

// const orangeText = {
//   color: "#f26522",
//   fontWeight: "bold",
//   cursor: "pointer",
// };

// export default function Home() {
//   const [summary, setSummary] = useState(null);
//   const [roleFilter, setRoleFilter] = useState("client");
//   const [roleBaseSummary, setRoleBasedSummary] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         const data = await getHomeSummary();
//         setSummary(data);
//         if (roleFilter !== "all") {
//           const roleSummary = await getTicketSummaryByRole(roleFilter);
//           setRoleBasedSummary(roleSummary);
//         } else {
//           setRoleBasedSummary([]);
//         }
//       } catch (err) {
//         console.error("Failed to fetch home summary:", err);
//       }
//     };

//     fetchSummary();
//   }, [roleFilter]);

//   if (!summary) return <div>Loading...</div>;

//   const { ticketSummary, employeeSummary, userSummary } = summary;

//   return (
//     <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
//       <Grid container spacing={3} wrap="nowrap" sx={{ overflowX: "auto" }}>
//         {/* ---------- Ticket Summary ---------- */}
//         <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
//           <Paper
//             elevation={2}
//             sx={{ p: 1, maxHeight: "75vh", overflowY: "auto" }}
//           >
//             <Table size="small">
//               <TableHead>
//                 <TableRow>
//                   <TableCell sx={headerStyle}>#</TableCell>
//                   <TableCell sx={headerStyle}>Ticket</TableCell>
//                   <TableCell sx={headerStyle}>Count</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {[
//                   ["Total Ticket", ticketSummary.total],
//                   ["Open Ticket", ticketSummary.open, "open"],
//                   ["In Process Ticket", ticketSummary.inProcess, "inProcess"],
//                   ["Closed Ticket", ticketSummary.closed, "closed"],
//                   ["Handover to Customer", ticketSummary.handover, "handover"],
//                   ["Hold Ticket", ticketSummary.hold, "hold"],

//                 ].map(([label, count, status], index) => (
//                   <TableRow key={index}>
//                     <TableCell sx={cellStyle}>{index + 1}</TableCell>
//                     <TableCell sx={cellStyle}>{label}</TableCell>
//                     <TableCell
//                       sx={{ ...cellStyle, ...orangeText }}
//                       onClick={() =>
//                         status && navigate(`/ticket?status=${status}`)
//                       }
//                     >
//                       {count}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </Paper>
//         </Grid>

//         {/* ---------- Employee Summary ---------- */}
//         <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
//           <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
//             {employeeSummary.map((emp, index) => (
//               <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell sx={headerStyle} colSpan={5}>
//                         {emp.name} [{emp.email}]
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={headerStyle}>Open</TableCell>
//                       <TableCell sx={headerStyle}>InProcess</TableCell>
//                       <TableCell sx={headerStyle}>Closed</TableCell>
//                       <TableCell sx={headerStyle}>Handover</TableCell>
//                       <TableCell sx={headerStyle}>Hold</TableCell> {/* ✅ New column */}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     <TableRow>
//                       {["open", "inProcess", "closed", "handover", "hold"].map(
//                         (key) => (
//                           <TableCell
//                             key={key}
//                             sx={{ ...cellStyle, ...orangeText }}
//                             onClick={() =>
//                               navigate(
//                                 `/ticket?employeeId=${emp.employeeId}&status=${key.toLowerCase()}`
//                               )
//                             }
//                           >
//                             {emp.ticketStatus[key] || 0}
//                           </TableCell>
//                         )
//                       )}
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </Paper>
//             ))}
//           </Box>
//         </Grid>

//         {/* ---------- User Summary ---------- */}
//         <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
//           <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
//             {userSummary.map((user, index) => (
//               <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell sx={headerStyle} colSpan={5}>
//                         {user.name} [{user.email}]
//                       </TableCell>
//                     </TableRow>
//                     <TableRow>
//                       <TableCell sx={headerStyle}>Open</TableCell>
//                       <TableCell sx={headerStyle}>InProcess</TableCell>
//                       <TableCell sx={headerStyle}>Closed</TableCell>
//                       <TableCell sx={headerStyle}>Handover</TableCell>
//                       <TableCell sx={headerStyle}>Hold</TableCell> {/* ✅ New column */}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     <TableRow>
//                       {["open", "inProcess", "closed", "handover", "hold"].map(
//                         (key) => (
//                           <TableCell
//                             key={key}
//                             sx={{ ...cellStyle, ...orangeText }}
//                             onClick={() =>
//                               navigate(
//                                 `/ticket?userId=${user.userId}&status=${key.toLowerCase()}`
//                               )
//                             }
//                           >
//                             {user.ticketStatus?.[key] || 0}
//                           </TableCell>
//                         )
//                       )}
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </Paper>
//             )
//             )}
//           </Box>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// }

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
  Box,
  Modal,
  Typography,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CloseIcon from "@mui/icons-material/Close";
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

const COLORS = ["#f26522", "#2a9df4", "#f2b632", "#7bc043", "#d7263d"];

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [roleFilter, setRoleFilter] = useState("client");
  const [roleBaseSummary, setRoleBasedSummary] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  const handleHeaderClick = (entity) => {
    setSelectedEntity(entity);
    setModalOpen(true);
  };

  const chartData = selectedEntity?.ticketStatus
    ? Object.entries(selectedEntity.ticketStatus).map(([key, value]) => ({
        name: key,
        value: value || 0,
      }))
    : [];

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Grid container spacing={3} wrap="nowrap" sx={{ overflowX: "auto" }}>
        {/* ---------- Ticket Summary ---------- */}
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
                  ["Hold Ticket", ticketSummary.hold, "hold"],
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

        {/* ---------- Employee Summary ---------- */}
        <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
          <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
            {employeeSummary.map((emp, index) => (
              <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      onClick={() => handleHeaderClick(emp)}
                      sx={{ cursor: "pointer", backgroundColor: "#f5f5f5" }}
                    >
                      <TableCell sx={headerStyle} colSpan={5}>
                        {emp.name} [{emp.email}]
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {["Open", "InProcess", "Closed", "Handover", "Hold"].map(
                        (h) => (
                          <TableCell key={h} sx={headerStyle}>
                            {h}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {["open", "inProcess", "closed", "handover", "hold"].map(
                        (key) => (
                          <TableCell
                            key={key}
                            sx={{ ...cellStyle, ...orangeText }}
                            onClick={() =>
                              navigate(
                                `/ticket?employeeId=${emp.employeeId}&status=${key}`
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

        {/* ---------- User Summary ---------- */}
        <Grid item xs={12} sm={4} md={4} sx={{ minWidth: "300px" }}>
          <Box sx={{ maxHeight: "65vh", overflowY: "auto" }}>
            {userSummary.map((user, index) => (
              <Paper key={index} elevation={2} sx={{ p: 1, mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      onClick={() => handleHeaderClick(user)}
                      sx={{ cursor: "pointer", backgroundColor: "#f5f5f5" }}
                    >
                      <TableCell sx={headerStyle} colSpan={5}>
                        {user.name} [{user.email}]
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      {["Open", "InProcess", "Closed", "Handover", "Hold"].map(
                        (h) => (
                          <TableCell key={h} sx={headerStyle}>
                            {h}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {["open", "inProcess", "closed", "handover", "hold"].map(
                        (key) => (
                          <TableCell
                            key={key}
                            sx={{ ...cellStyle, ...orangeText }}
                            onClick={() =>
                              navigate(
                                `/ticket?userId=${user.userId}&status=${key}`
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
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* ---------- Modal for Chart ---------- */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            boxShadow: 24,
            p: 3,
            width: "450px",
            borderRadius: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              {selectedEntity?.name}'s Ticket Analysis
            </Typography>
            <IconButton onClick={() => setModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {/* Gradient for soft 3D-like shading */}
                  <radialGradient id="grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#000" stopOpacity={0.2} />
                  </radialGradient>
                </defs>

                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={30}
                  stroke="url(#grad)"
                  strokeWidth={2}
                  label={false} // ✅ Hide all text labels
                  isAnimationActive
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      style={{
                        filter: "drop-shadow(2px 3px 3px rgba(0,0,0,0.3))",
                      }}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [`${value}`, `${name}`]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {chartData.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                Total Tickets:{" "}
                <b>{chartData.reduce((sum, item) => sum + item.value, 0)}</b>
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  );
}
