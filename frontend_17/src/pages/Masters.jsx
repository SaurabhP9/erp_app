// import React, { useState } from "react";
// import {
//   Container,
//   Typography,
//   Select,
//   MenuItem,
//   Box,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   TableContainer,
//   Paper,
//   FormControl,
//   InputLabel,
// } from "@mui/material";

// const masterData = {
//   "Project List": [
//     ["ERP System", "Active"],
//     ["Attendance App", "Completed"],
//     ["POS App", "In Progress"],
//   ],
//   Category: [
//     ["Software", "Development"],
//     ["Hardware", "Assembly"],
//     ["HR", "Internal"],
//   ],
//   Department: [
//     ["Development"],
//     ["Sales"],
//     ["Support"],
//     ["HR"],
//   ],
//   Status: [
//     ["Open"],
//     ["In Progress"],
//     ["Resolved"],
//     ["Closed"],
//   ],
//   Priority: [
//     ["Low"],
//     ["Medium"],
//     ["High"],
//     ["Critical"],
//   ],
// };

// export default function Masters() {
//   const [selected, setSelected] = useState("Project List");

//   const handleChange = (e) => {
//     console.log("dropped down changed")
//     setSelected(e.target.value);
//   };

//   const columns = {
//     "Project List": ["Project Name", "Status"],
//     Category: ["Name", "Type"],
//     Department: ["Department Name"],
//     Status: ["Status"],
//     Priority: ["Priority"],
//   };

//   const rows = masterData[selected];

//   return (
//     <Container maxWidth="md" sx={{ mt: 4 }}>
//       <Typography variant="h6" fontWeight="bold" gutterBottom>
//         Masters – {selected}
//       </Typography>
//       <Typography variant="body2" color="gray" gutterBottom>
//         Home -&gt; Masters -&gt; {selected}
//       </Typography>

//       <FormControl fullWidth sx={{ my: 2 }}>
//         <InputLabel>Select Master Type</InputLabel>
//         <Select value={selected} onChange={handleChange} label="Select Master Type">
//           {Object.keys(masterData).map((key) => (
//             <MenuItem key={key} value={key}>
//               {console.log("here>>>>",key)}
//               {key}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       <TableContainer component={Paper}>
//         <Table size="small">
//           <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
//             <TableRow>
//               <TableCell>#</TableCell>
//               {columns[selected].map((col, i) => (
//                 <TableCell key={i}>{col}</TableCell>
//               ))}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {rows.map((row, i) => (
//               <TableRow key={i}>
//                 <TableCell>{i + 1}</TableCell>
//                 {row.map((cell, j) => (
//                   <TableCell key={j}>{cell}</TableCell>
//                 ))}
//               </TableRow>
//             ))}
//             {rows.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={columns[selected].length + 1} align="center">
//                   No data found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Container>
//   );
// }
