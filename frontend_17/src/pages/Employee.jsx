// // import React, { useState, useEffect } from "react";
// // import {
// //   Container,
// //   Typography,
// //   Stack,
// //   Button,
// //   TextField,
// //   Box,
// //   TableContainer,
// //   Table,
// //   TableHead,
// //   TableRow,
// //   TableCell,
// //   TableBody,
// //   Paper,
// //   IconButton,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   MenuItem,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   Checkbox,
// //   ListItemText,
// //   InputAdornment,
// //   useMediaQuery,
// //   useTheme,
// //   CircularProgress,
// //   Snackbar,
// //   Alert,
// // } from "@mui/material";
// // import EditIcon from "@mui/icons-material/Edit";
// // import DeleteIcon from "@mui/icons-material/Delete";
// // import Visibility from "@mui/icons-material/Visibility";
// // import VisibilityOff from "@mui/icons-material/VisibilityOff";

// // import {
// //   getAllUsersByRole,
// //   updateUser,
// //   createUser,
// //   deleteUser,
// // } from "../api/userApi";
// // import { getAllProjects } from "../api/projectApi";
// // import { getAllDepartments } from "../api/departmentApi";

// // // Define a maximum height for the table container for better scrolling experience
// // // Adjusted slightly for better overall fit, considering header/footer
// // const TABLE_MAX_HEIGHT_LARGE = "calc(100vh - 400px)"; // Increased margin for header/controls/bottom spacing
// // const TABLE_MAX_HEIGHT_MEDIUM = "calc(100vh - 250px)"; // For tablets
// // const TABLE_MAX_HEIGHT_SMALL = "calc(100vh - 230px)"; // For mobiles

// // export default function Dashboard() {
// //   const [empUsers, setEmpUsers] = useState([]);
// //   const [projects, setProjects] = useState([]);
// //   const [departments, setDepartments] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [editEmp, setEditEmp] = useState(null);
// //   const [addDialogOpen, setAddDialogOpen] = useState(false);
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [form, setForm] = useState({
// //     name: "",
// //     email: "",
// //     mobile: "",
// //     department: "",
// //     role: "employee", // Default role
// //     projectNames: [], // Store project names
// //     password: "",
// //   });
// //   const [formErrors, setFormErrors] = useState({});
// //   const [snackbarOpen, setSnackbarOpen] = useState(false);
// //   const [snackbarMessage, setSnackbarMessage] = useState("");
// //   const [snackbarSeverity, setSnackbarSeverity] = useState("success");

// //   // 💡 Responsiveness hooks
// //   const theme = useTheme();
// //   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg")); // true for screens >= 'lg'
// //   const isMediumScreen = useMediaQuery(theme.breakpoints.up("md")); // true for screens >= 'md'
// //   const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // true for screens smaller than 'md' (e.g., tablets/mobiles)
// //   const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // true for screens smaller than 'sm' (e.g., mobiles)

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const [empls, projs, depts] = await Promise.all([
// //           getAllUsersByRole("employee"),
// //           getAllProjects(),
// //           getAllDepartments(),
// //         ]);
// //         setEmpUsers(empls);
// //         setProjects(projs);
// //         setDepartments(depts);
// //       } catch (err) {
// //         console.error("Failed to fetch initial data:", err);
// //         showSnackbar("Failed to load data. Please try again.", "error");
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     fetchData();
// //   }, []);

// //   // Helper to show Snackbar messages
// //   const showSnackbar = (message, severity) => {
// //     setSnackbarMessage(message);
// //     setSnackbarSeverity(severity);
// //     setSnackbarOpen(true);
// //   };

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setForm({ ...form, [name]: value });
// //     setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
// //   };

// //   const handleProjectChange = (event) => {
// //     const {
// //       target: { value },
// //     } = event;
// //     const selectedProjects =
// //       typeof value === "string" ? value.split(",") : value;
// //     setForm({
// //       ...form,
// //       projectNames: selectedProjects,
// //     });
// //     setFormErrors((prevErrors) => ({ ...prevErrors, projectNames: "" }));
// //   };

// //   const validateForm = () => {
// //     let errors = {};
// //     if (!form.name.trim()) errors.name = "Name is required.";
// //     if (!form.email.trim()) {
// //       errors.email = "Email is required.";
// //     } else if (!/\S+@\S+\.\S+/.test(form.email)) {
// //       errors.email = "Email is invalid.";
// //     }
// //     if (!form.mobile.trim()) {
// //       errors.mobile = "Mobile is required.";
// //     } else if (!/^\d{10}$/.test(form.mobile)) {
// //       errors.mobile = "Mobile number must be 10 digits.";
// //     }
// //     if (!editEmp && !form.password.trim()) {
// //       errors.password = "Password is required."; // Password required only for new employee
// //     } else if (!editEmp && form.password.trim().length < 6) {
// //       errors.password = "Password must be at least 6 characters.";
// //     }
// //     if (!form.department) errors.department = "Department is required.";
// //     if (form.projectNames.length === 0) {
// //       errors.projectNames = "At least one project must be selected.";
// //     }

// //     setFormErrors(errors);
// //     return Object.keys(errors).length === 0;
// //   };

// //   const handleSave = async () => {
// //     if (!validateForm()) {
// //       showSnackbar("Please correct the form errors.", "error");
// //       return;
// //     }

// //     try {
// //       // Find the department object to get its _id
// //       const departmentObj = departments.find((d) => d._id === form.department);

// //       // Prepare the data to be sent to the API
// //       const submitForm = {
// //         ...form,
// //         // Ensure department is sent as its _id if found, otherwise null/undefined
// //         department: departmentObj ? departmentObj._id : null,
// //         // projectNames already contains the array of project names
// //         projects: form.projectNames,
// //       };

// //       let message = "";
// //       if (editEmp) {
// //         // If editing, also pass the employee's ID and exclude password if not changed
// //         const updatePayload = { ...submitForm };
// //         if (submitForm.password === "") {
// //           // Don't send empty password on update
// //           delete updatePayload.password;
// //         }
// //         const updated = await updateUser(editEmp._id, updatePayload);
// //         setEmpUsers(empUsers.map((e) => (e._id === updated._id ? updated : e)));
// //         message = "Employee updated successfully!";
// //       } else {
// //         const created = await createUser(submitForm);
// //         setEmpUsers([...empUsers, created]);
// //         message = "Employee added successfully!";
// //       }
// //       showSnackbar(message, "success");
// //       handleCloseDialog();
// //     } catch (err) {
// //       console.error("Save error:", err);
// //       // Attempt to parse specific error message from API if available
// //       const errorMessage =
// //         err.response?.data?.message || err.message || "Unknown error";
// //       showSnackbar(`Failed to save employee: ${errorMessage}`, "error");
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (window.confirm("Are you sure you want to delete this employee?")) {
// //       try {
// //         await deleteUser(id);
// //         setEmpUsers(empUsers.filter((e) => e._id !== id));
// //         showSnackbar("Employee deleted successfully!", "success");
// //       } catch (err) {
// //         console.error("Delete error:", err);
// //         const errorMessage =
// //           err.response?.data?.message || err.message || "Unknown error";
// //         showSnackbar(`Failed to delete employee: ${errorMessage}`, "error");
// //       }
// //     }
// //   };

// //   const handleOpenAddDialog = () => {
// //     setEditEmp(null);
// //     setForm({
// //       name: "",
// //       email: "",
// //       mobile: "",
// //       department: "",
// //       role: "employee",
// //       projectNames: [],
// //       password: "",
// //     });
// //     setShowPassword(false);
// //     setFormErrors({});
// //     setAddDialogOpen(true);
// //   };

// //   const handleOpenEditDialog = (emp) => {
// //     setEditEmp(emp);
// //     setForm({
// //       name: emp.name || "",
// //       email: emp.email || "",
// //       mobile: emp.mobile || "",
// //       // Ensure department is set by its ID for the Select component
// //       department: emp.department || "",
// //       role: emp.role || "employee",
// //       projectNames: Array.isArray(emp.projects) ? emp.projects : [], // Ensure it's an array of names
// //       password: "", // Never pre-fill password for security
// //     });
// //     setShowPassword(false);
// //     setFormErrors({});
// //     setAddDialogOpen(true);
// //   };

// //   const handleCloseDialog = () => {
// //     setAddDialogOpen(false);
// //     setEditEmp(null);
// //     setShowPassword(false);
// //     setFormErrors({});
// //     setForm({
// //       // Reset form fields
// //       name: "",
// //       email: "",
// //       mobile: "",
// //       department: "",
// //       role: "employee",
// //       projectNames: [],
// //       password: "",
// //     });
// //   };

// //   const filtered = empUsers.filter(
// //     (e) =>
// //       e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       // Safely access department name for filtering
// //       (departments.find((d) => d._id === e.department)?.name || "")
// //         .toLowerCase()
// //         .includes(searchTerm.toLowerCase())
// //   );

// //   if (loading) {
// //     return (
// //       <Box
// //         sx={{
// //           display: "flex",
// //           justifyContent: "center",
// //           alignItems: "center",
// //           height: "100vh",
// //           flexDirection: "column", // Align items in a column
// //         }}
// //       >
// //         <CircularProgress sx={{ mb: 2 }} />
// //         <Typography variant="h6">Loading employees...</Typography>
// //       </Box>
// //     );
// //   }

// //   return (
// //     // Added padding bottom for spacing from the footer
// //     <Container
// //       maxWidth="xl"
// //       sx={{ p: { xs: 2, md: 3 }, pb: 4, minHeight: "100vh" }}
// //     >
// //       <Typography
// //         variant={isSmallScreen ? "h5" : "h4"} // Responsive typography
// //         fontWeight="bold"
// //         gutterBottom
// //       >
// //         Employee Management
// //       </Typography>

// //       <Stack
// //         direction={isSmallScreen ? "column" : "row"} // Stack vertically on small screens
// //         justifyContent="space-between"
// //         alignItems={isSmallScreen ? "flex-start" : "center"} // Align items at start for column layout
// //         my={2}
// //         spacing={isSmallScreen ? 2 : 3} // Responsive spacing between elements
// //       >
// //         <Button
// //           variant="contained"
// //           onClick={handleOpenAddDialog}
// //           size={isSmallScreen ? "medium" : "large"} // Adjust button size
// //           fullWidth={isSmallScreen} // Full width on small screens
// //           sx={{
// //             backgroundColor: "#1976D2", // Use the theme's primary color or a custom one
// //             "&:hover": {
// //               backgroundColor: "#1565C0", // Slightly darker on hover
// //             },
// //           }}
// //         >
// //           Add Employee
// //         </Button>
// //         <TextField
// //           size="small"
// //           placeholder="Search employees..."
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //           sx={{ width: isSmallScreen ? "100%" : 250 }} // Full width on small screens, fixed on larger
// //         />
// //       </Stack>

// //       <Paper sx={{ p: { xs: 1, md: 2 }, backgroundColor: "#f9f9f9" }}>
// //         {/*
// //           TableContainer is crucial for horizontal scrolling on small screens.
// //           minWidth: 0 on the parent Paper and Box will help prevent overflow.
// //           The table itself might still need minWidth depending on content,
// //           but overflowX: 'auto' on TableContainer will handle it.
// //         */}
// //         <TableContainer
// //           component={Paper} // Use Paper as the component for TableContainer
// //           sx={{
// //             maxHeight: isLargeScreen
// //               ? TABLE_MAX_HEIGHT_LARGE
// //               : isMediumScreen
// //               ? TABLE_MAX_HEIGHT_MEDIUM
// //               : TABLE_MAX_HEIGHT_SMALL,
// //             overflowY: "auto", // Vertical scrolling for table content
// //             overflowX: "auto", // Horizontal scrolling for table if content is too wide
// //             backgroundColor: "#f9f9f9",
// //             border: 1,
// //             borderColor: "grey.300",
// //             borderRadius: 2,
// //             minWidth: 0, // Ensure it doesn't force a minimum width
// //           }}
// //         >
// //           <Table stickyHeader size={isExtraSmallScreen ? "small" : "medium"}>
// //             <TableHead>
// //               <TableRow>
// //                 {[
// //                   "#",
// //                   "Name",
// //                   "Email",
// //                   "Mobile",
// //                   "Department",
// //                   "Projects",
// //                   "Action",
// //                 ].map((head, i) => (
// //                   <TableCell
// //                     key={i}
// //                     sx={{
// //                       backgroundColor: "grey", // Consistent header background
// //                       fontWeight: "bold",
// //                       color: "white",
// //                       border: "1px solid #ccc",
// //                       position: "sticky",
// //                       top: 0,
// //                       zIndex: 1, // Ensure sticky header is above scrolling content
// //                       textAlign: "center", // Center align headers
// //                       fontSize: isExtraSmallScreen ? "0.75rem" : "0.85rem", // Responsive font size
// //                       whiteSpace: "nowrap", // Prevent text wrapping in headers
// //                       padding: isExtraSmallScreen ? "8px 4px" : "12px 8px", // Responsive padding
// //                       minWidth:
// //                         head === "Action"
// //                           ? isExtraSmallScreen
// //                             ? "90px"
// //                             : "120px" // Ensure action column has min width
// //                           : head === "Name" || head === "Email"
// //                           ? isExtraSmallScreen
// //                             ? "100px"
// //                             : "150px"
// //                           : "auto", // Give some columns min-width for readability
// //                     }}
// //                   >
// //                     {head}
// //                   </TableCell>
// //                 ))}
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {filtered.length > 0 ? (
// //                 filtered.map((emp, i) => (
// //                   <TableRow key={emp._id} hover>
// //                     <TableCell
// //                       sx={{
// //                         border: "1px solid #ccc",
// //                         textAlign: "center",
// //                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
// //                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
// //                       }}
// //                     >
// //                       {i + 1}
// //                     </TableCell>
// //                     <TableCell
// //                       sx={{
// //                         border: "1px solid #ccc",
// //                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
// //                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
// //                       }}
// //                     >
// //                       {emp.name}
// //                     </TableCell>
// //                     <TableCell
// //                       sx={{
// //                         border: "1px solid #ccc",
// //                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
// //                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
// //                         wordBreak: "break-word", // Allow long emails to wrap
// //                       }}
// //                     >
// //                       {emp.email}
// //                     </TableCell>
// //                     <TableCell
// //                       sx={{
// //                         border: "1px solid #ccc",
// //                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
// //                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
// //                         whiteSpace: "nowrap",
// //                       }}
// //                     >
// //                       {emp.mobile}
// //                     </TableCell>
// //                     <TableCell
// //                       sx={{
// //                         border: "1px solid #ccc",
// //                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
// //                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
// //                       }}
// //                     >
// //                       {
// //                         // Display department name using the department ID from emp object
// //                         departments.find((d) => d._id === emp.department)
// //                           ?.name || "-"
// //                       }
// //                     </TableCell>
// //                     <TableCell
// //                       sx={{
// //                         border: "1px solid #ccc",
// //                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
// //                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
// //                         wordBreak: "break-word", // Allow long project lists to wrap
// //                       }}
// //                     >
// //                       {(emp.projects || []).join(", ")}
// //                     </TableCell>
// //                     <TableCell
// //                       sx={{
// //                         border: "1px solid #ccc",
// //                         textAlign: "center",
// //                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
// //                         whiteSpace: "nowrap", // Keep action buttons on one line
// //                       }}
// //                     >
// //                       <IconButton
// //                         size={isSmallScreen ? "small" : "medium"}
// //                         onClick={() => handleOpenEditDialog(emp)}
// //                       >
// //                         <EditIcon
// //                           color="primary"
// //                           fontSize={isSmallScreen ? "small" : "medium"}
// //                         />
// //                       </IconButton>
// //                       <IconButton
// //                         size={isSmallScreen ? "small" : "medium"}
// //                         color="error"
// //                         onClick={() => handleDelete(emp._id)}
// //                       >
// //                         <DeleteIcon
// //                           fontSize={isSmallScreen ? "small" : "medium"}
// //                         />
// //                       </IconButton>
// //                     </TableCell>
// //                   </TableRow>
// //                 ))
// //               ) : (
// //                 <TableRow>
// //                   <TableCell
// //                     colSpan={7}
// //                     align="center"
// //                     sx={{ border: "1px solid #ccc", py: 2 }}
// //                   >
// //                     No records found.
// //                   </TableCell>
// //                 </TableRow>
// //               )}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Paper>

// //       {/* Add/Edit Dialog */}
// //       <Dialog
// //         open={addDialogOpen}
// //         onClose={handleCloseDialog}
// //         fullWidth
// //         maxWidth={isSmallScreen ? "sm" : "xs"} // Larger dialog on small screens for better form visibility
// //       >
// //         <DialogTitle>{editEmp ? "Edit Employee" : "Add Employee"}</DialogTitle>
// //         <DialogContent dividers>
// //           <Stack spacing={isSmallScreen ? 1.5 : 2}>
// //             {/* Responsive spacing in form fields */}
// //             <TextField
// //               label="Name"
// //               name="name"
// //               value={form.name}
// //               onChange={handleChange}
// //               fullWidth
// //               size="small"
// //               required
// //               error={!!formErrors.name}
// //               helperText={formErrors.name}
// //             />
// //             <TextField
// //               label="Email"
// //               name="email"
// //               value={form.email}
// //               onChange={handleChange}
// //               fullWidth
// //               size="small"
// //               required
// //               error={!!formErrors.email}
// //               helperText={formErrors.email}
// //             />
// //             <TextField
// //               label="Mobile"
// //               name="mobile"
// //               value={form.mobile}
// //               onChange={handleChange}
// //               fullWidth
// //               size="small"
// //               required
// //               error={!!formErrors.mobile}
// //               helperText={formErrors.mobile}
// //             />
// //             <TextField
// //               label="Password"
// //               name="password"
// //               type={showPassword ? "text" : "password"}
// //               value={form.password}
// //               onChange={handleChange}
// //               fullWidth
// //               size="small"
// //               required={!editEmp} // Password required only for new employee
// //               error={!!formErrors.password}
// //               helperText={formErrors.password}
// //               InputProps={{
// //                 endAdornment: (
// //                   <InputAdornment position="end">
// //                     <IconButton
// //                       onClick={() => setShowPassword((prev) => !prev)}
// //                       edge="end"
// //                     >
// //                       {showPassword ? <VisibilityOff /> : <Visibility />}
// //                     </IconButton>
// //                   </InputAdornment>
// //                 ),
// //               }}
// //             />
// //             <FormControl
// //               fullWidth
// //               size="small"
// //               required
// //               error={!formErrors.department}
// //             >
// //               <InputLabel>Department</InputLabel>
// //               <Select
// //                 name="department"
// //                 value={form.department}
// //                 onChange={handleChange}
// //                 label="Department"
// //               >
// //                 <MenuItem value="">
// //                   <em>None</em>
// //                 </MenuItem>
// //                 {departments.map((dept) => (
// //                   <MenuItem key={dept._id} value={dept._id}>
// //                     {dept.name}
// //                   </MenuItem>
// //                 ))}
// //               </Select>
// //               {formErrors.department && (
// //                 <Typography color="error" variant="caption">
// //                   {formErrors.department}
// //                 </Typography>
// //               )}
// //             </FormControl>
// //             <FormControl
// //               fullWidth
// //               size="small"
// //               required
// //               error={!!formErrors.projectNames}
// //             >
// //               <InputLabel>Projects</InputLabel>
// //               <Select
// //                 name="projectNames"
// //                 multiple
// //                 value={
// //                   Array.isArray(form.projectNames) ? form.projectNames : []
// //                 }
// //                 onChange={handleProjectChange}
// //                 renderValue={(selected) => selected.join(", ")}
// //                 label="Projects"
// //               >
// //                 {/* Project filtering logic based on department "Functional" */}
// //                 {projects
// //                   .filter((proj) => {
// //                     const selectedDepartment = departments.find(
// //                       (d) => d._id === form.department
// //                     );
// //                     if (
// //                       selectedDepartment &&
// //                       selectedDepartment.name === "Functional"
// //                     ) {
// //                       // If the employee is functional, they cannot take an already assigned functional project
// //                       const usedProjectsByFunctional = empUsers
// //                         .filter(
// //                           (emp) =>
// //                             departments.find((d) => d._id === emp.department)
// //                               ?.name === "Functional" &&
// //                             emp._id !== editEmp?._id // Exclude current employee's existing projects if editing
// //                         )
// //                         .flatMap((emp) => emp.projects || []);
// //                       return !usedProjectsByFunctional.includes(proj.project);
// //                     }
// //                     return true; // All projects available for non-functional employees
// //                   })
// //                   .map((proj) => (
// //                     <MenuItem key={proj._id} value={proj.project}>
// //                       <Checkbox
// //                         checked={form.projectNames.includes(proj.project)}
// //                       />
// //                       <ListItemText primary={proj.project} />
// //                     </MenuItem>
// //                   ))}
// //               </Select>
// //               {formErrors.projectNames && (
// //                 <Typography color="error" variant="caption">
// //                   {formErrors.projectNames}
// //                 </Typography>
// //               )}
// //             </FormControl>
// //           </Stack>
// //         </DialogContent>

// //         <DialogActions>
// //           <Button onClick={handleCloseDialog}>Cancel</Button>
// //           <Button
// //             variant="contained"
// //             onClick={handleSave}
// //             sx={{
// //               backgroundColor: "#f26522",
// //               "&:hover": {
// //                 backgroundColor: "#e05a1d",
// //               },
// //             }}
// //           >
// //             {editEmp ? "Update" : "Add"}
// //           </Button>
// //         </DialogActions>
// //       </Dialog>

// //       {/* Snackbar for user feedback */}
// //       <Snackbar
// //         open={snackbarOpen}
// //         autoHideDuration={6000}
// //         onClose={() => setSnackbarOpen(false)}
// //         anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// //       >
// //         <Alert
// //           onClose={() => setSnackbarOpen(false)}
// //           severity={snackbarSeverity}
// //           sx={{ width: "100%" }}
// //         >
// //           {snackbarMessage}
// //         </Alert>
// //       </Snackbar>
// //     </Container>
// //   );
// // }

// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   Stack,
//   Button,
//   TextField,
//   Box,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Paper,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   Checkbox,
//   ListItemText,
//   InputAdornment,
//   useMediaQuery,
//   useTheme,
//   CircularProgress,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";

// import {
//   getAllUsersByRole,
//   updateUser,
//   createUser,
//   deleteUser,
// } from "../api/userApi";
// import { getAllProjects } from "../api/projectApi";
// import { getAllDepartments } from "../api/departmentApi";

// // Define a maximum height for the table container for better scrolling experience
// const TABLE_MAX_HEIGHT_LARGE = "calc(100vh - 400px)";
// const TABLE_MAX_HEIGHT_MEDIUM = "calc(100vh - 250px)";
// const TABLE_MAX_HEIGHT_SMALL = "calc(100vh - 230px)";

// export default function Dashboard() {
//   const [empUsers, setEmpUsers] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [editEmp, setEditEmp] = useState(null);
//   const [addDialogOpen, setAddDialogOpen] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     department: "",
//     role: "employee", // Default role
//     projectNames: [], // Store project names
//     password: "",
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState("success");

//   // State to control department field disablement
//   // Set to true to disable department by default as requested
//   const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(true);

//   // 💡 Responsiveness hooks
//   const theme = useTheme();
//   const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
//   const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
//   const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [empls, projs, depts] = await Promise.all([
//           getAllUsersByRole("employee"),
//           getAllProjects(),
//           getAllDepartments(),
//         ]);
//         setEmpUsers(empls);
//         setProjects(projs);
//         setDepartments(depts);
//       } catch (err) {
//         console.error("Failed to fetch initial data:", err);
//         showSnackbar("Failed to load data. Please try again.", "error");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Helper to show Snackbar messages
//   const showSnackbar = (message, severity) => {
//     setSnackbarMessage(message);
//     setSnackbarSeverity(severity);
//     setSnackbarOpen(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//     setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
//   };

//   const handleProjectChange = (event) => {
//     const {
//       target: { value },
//     } = event;
//     const selectedProjects =
//       typeof value === "string" ? value.split(",") : value;
//     setForm({
//       ...form,
//       projectNames: selectedProjects,
//     });
//     setFormErrors((prevErrors) => ({ ...prevErrors, projectNames: "" }));
//   };

//   const validateForm = () => {
//     let errors = {};
//     if (!form.name.trim()) errors.name = "Name is required.";
//     if (!form.email.trim()) {
//       errors.email = "Email is required.";
//     } else if (!/\S+@\S+\.\S+/.test(form.email)) {
//       errors.email = "Email is invalid.";
//     }
//     if (!form.mobile.trim()) {
//       errors.mobile = "Mobile is required.";
//     } else if (!/^\d{10}$/.test(form.mobile)) {
//       errors.mobile = "Mobile number must be 10 digits.";
//     }
//     if (!editEmp && !form.password.trim()) {
//       errors.password = "Password is required."; // Password required only for new employee
//     } else if (!editEmp && form.password.trim().length < 6) {
//       errors.password = "Password must be at least 6 characters.";
//     }

//     // ⭐ ONLY validate department if it's NOT disabled
//     if (!isDepartmentDisabled && !form.department) {
//       errors.department = "Department is required.";
//     }

//     if (form.projectNames.length === 0) {
//       errors.projectNames = "At least one project must be selected.";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSave = async () => {
//     if (!validateForm()) {
//       showSnackbar("Please correct the form errors.", "error");
//       return;
//     }

//     try {
//       const submitForm = { ...form };

//       // ⭐ Handle department value based on disabled state for submission
//       if (isDepartmentDisabled) {
//         // If department is disabled, you might want to:
//         // 1. Delete the field from the payload (if backend ignores it)
//         delete submitForm.department;
//         // 2. Or, set it to a specific default value (e.g., null, empty string, or a specific ID)
//         // submitForm.department = null; // Or some default_department_id
//       } else {
//         // If department is enabled, ensure its ID is sent
//         const departmentObj = departments.find(
//           (d) => d._id === form.department
//         );
//         submitForm.department = departmentObj ? departmentObj._id : null;
//       }

//       // projectNames already contains the array of project names
//       submitForm.projects = form.projectNames;

//       let message = "";
//       if (editEmp) {
//         // If editing, also pass the employee's ID and exclude password if not changed
//         const updatePayload = { ...submitForm };
//         if (submitForm.password === "") {
//           // Don't send empty password on update if it wasn't explicitly changed
//           delete updatePayload.password;
//         }
//         const updated = await updateUser(editEmp._id, updatePayload);
//         setEmpUsers(empUsers.map((e) => (e._id === updated._id ? updated : e)));
//         message = "Employee updated successfully!";
//       } else {
//         const created = await createUser(submitForm);
//         setEmpUsers([...empUsers, created]);
//         message = "Employee added successfully!";
//       }
//       showSnackbar(message, "success");
//       handleCloseDialog();
//     } catch (err) {
//       console.error("Save error:", err);
//       const errorMessage =
//         err.response?.data?.message || err.message || "Unknown error";
//       showSnackbar(`Failed to save employee: ${errorMessage}`, "error");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this employee?")) {
//       try {
//         await deleteUser(id);
//         setEmpUsers(empUsers.filter((e) => e._id !== id));
//         showSnackbar("Employee deleted successfully!", "success");
//       } catch (err) {
//         console.error("Delete error:", err);
//         const errorMessage =
//           err.response?.data?.message || err.message || "Unknown error";
//         showSnackbar(`Failed to delete employee: ${errorMessage}`, "error");
//       }
//     }
//   };

//   const handleOpenAddDialog = () => {
//     setEditEmp(null);
//     setForm({
//       name: "",
//       email: "",
//       mobile: "",
//       department: "",
//       role: "employee",
//       projectNames: [],
//       password: "",
//     });
//     setShowPassword(false);
//     setFormErrors({});
//     setAddDialogOpen(true);
//   };

//   const handleOpenEditDialog = (emp) => {
//     setEditEmp(emp);
//     setForm({
//       name: emp.name || "",
//       email: emp.email || "",
//       mobile: emp.mobile || "",
//       // Ensure department is set by its ID for the Select component
//       department: emp.department || "",
//       role: emp.role || "employee",
//       projectNames: Array.isArray(emp.projects) ? emp.projects : [], // Ensure it's an array of names
//       password: "", // Never pre-fill password for security
//     });
//     setShowPassword(false);
//     setFormErrors({});
//     setAddDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setAddDialogOpen(false);
//     setEditEmp(null);
//     setShowPassword(false);
//     setFormErrors({});
//     setForm({
//       name: "",
//       email: "",
//       mobile: "",
//       department: "",
//       role: "employee",
//       projectNames: [],
//       password: "",
//     });
//   };

//   const filtered = empUsers.filter(
//     (e) =>
//       e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (departments.find((d) => d._id === e.department)?.name || "")
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//           flexDirection: "column",
//         }}
//       >
//         <CircularProgress sx={{ mb: 2 }} />
//         <Typography variant="h6">Loading employees...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Container
//       maxWidth="xl"
//       sx={{ p: { xs: 2, md: 3 }, pb: 4, minHeight: "100vh" }}
//     >
//       <Typography
//         variant={isSmallScreen ? "h5" : "h4"}
//         fontWeight="bold"
//         gutterBottom
//       >
//         Employee Management
//       </Typography>

//       <Stack
//         direction={isSmallScreen ? "column" : "row"}
//         justifyContent="space-between"
//         alignItems={isSmallScreen ? "flex-start" : "center"}
//         my={2}
//         spacing={isSmallScreen ? 2 : 3}
//       >
//         <Button
//           variant="contained"
//           onClick={handleOpenAddDialog}
//           size={isSmallScreen ? "medium" : "large"}
//           fullWidth={isSmallScreen}
//           sx={{
//             backgroundColor: "#1976D2",
//             "&:hover": {
//               backgroundColor: "#1565C0",
//             },
//           }}
//         >
//           Add Employee
//         </Button>
//         <TextField
//           size="small"
//           placeholder="Search employees..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           sx={{ width: isSmallScreen ? "100%" : 250 }}
//         />
//       </Stack>

//       <Paper sx={{ p: { xs: 1, md: 2 }, backgroundColor: "#f9f9f9" }}>
//         <TableContainer
//           component={Paper}
//           sx={{
//             maxHeight: isLargeScreen
//               ? TABLE_MAX_HEIGHT_LARGE
//               : isMediumScreen
//               ? TABLE_MAX_HEIGHT_MEDIUM
//               : TABLE_MAX_HEIGHT_SMALL,
//             overflowY: "auto",
//             overflowX: "auto",
//             backgroundColor: "#f9f9f9",
//             border: 1,
//             borderColor: "grey.300",
//             borderRadius: 2,
//             minWidth: 0,
//           }}
//         >
//           <Table stickyHeader size={isExtraSmallScreen ? "small" : "medium"}>
//             <TableHead>
//               <TableRow>
//                 {[
//                   "#",
//                   "Name",
//                   "Email",
//                   "Mobile",
//                   "Department",
//                   "Projects",
//                   "Action",
//                 ].map((head, i) => (
//                   <TableCell
//                     key={i}
//                     sx={{
//                       backgroundColor: "grey",
//                       fontWeight: "bold",
//                       color: "white",
//                       border: "1px solid #ccc",
//                       position: "sticky",
//                       top: 0,
//                       zIndex: 1,
//                       textAlign: "center",
//                       fontSize: isExtraSmallScreen ? "0.75rem" : "0.85rem",
//                       whiteSpace: "nowrap",
//                       padding: isExtraSmallScreen ? "8px 4px" : "12px 8px",
//                       minWidth:
//                         head === "Action"
//                           ? isExtraSmallScreen
//                             ? "90px"
//                             : "120px"
//                           : head === "Name" || head === "Email"
//                           ? isExtraSmallScreen
//                             ? "100px"
//                             : "150px"
//                           : "auto",
//                     }}
//                   >
//                     {head}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filtered.length > 0 ? (
//                 filtered.map((emp, i) => (
//                   <TableRow key={emp._id} hover>
//                     <TableCell
//                       sx={{
//                         border: "1px solid #ccc",
//                         textAlign: "center",
//                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
//                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
//                       }}
//                     >
//                       {i + 1}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         border: "1px solid #ccc",
//                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
//                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
//                       }}
//                     >
//                       {emp.name}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         border: "1px solid #ccc",
//                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
//                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
//                         wordBreak: "break-word",
//                       }}
//                     >
//                       {emp.email}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         border: "1px solid #ccc",
//                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
//                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       {emp.mobile}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         border: "1px solid #ccc",
//                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
//                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
//                       }}
//                     >
//                       {departments.find((d) => d._id === emp.department)
//                         ?.name || "-"}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         border: "1px solid #ccc",
//                         fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
//                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
//                         wordBreak: "break-word",
//                       }}
//                     >
//                       {(emp.projects || []).join(", ")}
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         border: "1px solid #ccc",
//                         textAlign: "center",
//                         padding: isExtraSmallScreen ? "6px 4px" : "8px",
//                         whiteSpace: "nowrap",
//                       }}
//                     >
//                       <IconButton
//                         size={isSmallScreen ? "small" : "medium"}
//                         onClick={() => handleOpenEditDialog(emp)}
//                       >
//                         <EditIcon
//                           color="primary"
//                           fontSize={isSmallScreen ? "small" : "medium"}
//                         />
//                       </IconButton>
//                       <IconButton
//                         size={isSmallScreen ? "small" : "medium"}
//                         color="error"
//                         onClick={() => handleDelete(emp._id)}
//                       >
//                         <DeleteIcon
//                           fontSize={isSmallScreen ? "small" : "medium"}
//                         />
//                       </IconButton>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={7}
//                     align="center"
//                     sx={{ border: "1px solid #ccc", py: 2 }}
//                   >
//                     No records found.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>

//       {/* Add/Edit Dialog */}
//       <Dialog
//         open={addDialogOpen}
//         onClose={handleCloseDialog}
//         fullWidth
//         maxWidth={isSmallScreen ? "sm" : "xs"}
//       >
//         <DialogTitle>{editEmp ? "Edit Employee" : "Add Employee"}</DialogTitle>
//         <DialogContent dividers>
//           <Stack spacing={isSmallScreen ? 1.5 : 2}>
//             <TextField
//               label="Name"
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               fullWidth
//               size="small"
//               required
//               error={!!formErrors.name}
//               helperText={formErrors.name}
//             />
//             <TextField
//               label="Email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               fullWidth
//               size="small"
//               required
//               error={!!formErrors.email}
//               helperText={formErrors.email}
//             />
//             <TextField
//               label="Mobile"
//               name="mobile"
//               value={form.mobile}
//               onChange={handleChange}
//               fullWidth
//               size="small"
//               required
//               error={!!formErrors.mobile}
//               helperText={formErrors.mobile}
//             />
//             <TextField
//               label="Password"
//               name="password"
//               type={showPassword ? "text" : "password"}
//               value={form.password}
//               onChange={handleChange}
//               fullWidth
//               size="small"
//               required={!editEmp}
//               error={!!formErrors.password}
//               helperText={formErrors.password}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton
//                       onClick={() => setShowPassword((prev) => !prev)}
//                       edge="end"
//                     >
//                       {showPassword ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//             {/* ⭐ Disabled Department FormControl */}
//             <FormControl
//               fullWidth
//               size="small"
//               required // Keep required if it's conceptually required when enabled
//               error={!!formErrors.department}
//               disabled={isDepartmentDisabled} // Apply disabled state
//             >
//               <InputLabel>Department</InputLabel>
//               <Select
//                 name="department"
//                 value={form.department}
//                 onChange={handleChange}
//                 label="Department"
//                 disabled={isDepartmentDisabled} // Apply disabled state
//               >
//                 <MenuItem value="">
//                   <em>None</em>
//                 </MenuItem>
//                 {departments.map((dept) => (
//                   <MenuItem key={dept._id} value={dept._id}>
//                     {dept.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//               {/* ⭐ Conditionally render error message only if not disabled and there's an error */}
//               {!isDepartmentDisabled && formErrors.department && (
//                 <Typography color="error" variant="caption">
//                   {formErrors.department}
//                 </Typography>
//               )}
//             </FormControl>
//             <FormControl
//               fullWidth
//               size="small"
//               required
//               error={!!formErrors.projectNames}
//             >
//               <InputLabel>Projects</InputLabel>
//               <Select
//                 name="projectNames"
//                 multiple
//                 value={
//                   Array.isArray(form.projectNames) ? form.projectNames : []
//                 }
//                 onChange={handleProjectChange}
//                 renderValue={(selected) => selected.join(", ")}
//                 label="Projects"
//               >
//                 {projects
//                   .filter((proj) => {
//                     const selectedDepartment = departments.find(
//                       (d) => d._id === form.department
//                     );
//                     if (
//                       selectedDepartment &&
//                       selectedDepartment.name === "Functional"
//                     ) {
//                       // If the employee is functional, they cannot take an already assigned functional project
//                       const usedProjectsByFunctional = empUsers
//                         .filter(
//                           (emp) =>
//                             departments.find((d) => d._id === emp.department)
//                               ?.name === "Functional" &&
//                             emp._id !== editEmp?._id // Exclude current employee's existing projects if editing
//                         )
//                         .flatMap((emp) => emp.projects || []);
//                       return !usedProjectsByFunctional.includes(proj.project);
//                     }
//                     return true; // All projects available for non-functional employees
//                   })
//                   .map((proj) => (
//                     <MenuItem key={proj._id} value={proj.project}>
//                       <Checkbox
//                         checked={form.projectNames.includes(proj.project)}
//                       />
//                       <ListItemText primary={proj.project} />
//                     </MenuItem>
//                   ))}
//               </Select>
//               {formErrors.projectNames && (
//                 <Typography color="error" variant="caption">
//                   {formErrors.projectNames}
//                 </Typography>
//               )}
//             </FormControl>
//           </Stack>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button
//             variant="contained"
//             onClick={handleSave}
//             sx={{
//               backgroundColor: "#f26522",
//               "&:hover": {
//                 backgroundColor: "#e05a1d",
//               },
//             }}
//           >
//             {editEmp ? "Update" : "Add"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={6000}
//         onClose={() => setSnackbarOpen(false)}
//         anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//       >
//         <Alert
//           onClose={() => setSnackbarOpen(false)}
//           severity={snackbarSeverity}
//           sx={{ width: "100%" }}
//         >
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  InputAdornment,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import {
  getAllUsersByRole,
  updateUser,
  createUser,
  deleteUser,
} from "../api/userApi";
import { getAllProjects } from "../api/projectApi";
import { getAllDepartments } from "../api/departmentApi";

// Define a maximum height for the table container for better scrolling experience
const TABLE_MAX_HEIGHT_LARGE = "calc(100vh - 400px)";
const TABLE_MAX_HEIGHT_MEDIUM = "calc(100vh - 250px)";
const TABLE_MAX_HEIGHT_SMALL = "calc(100vh - 230px)";

export default function Dashboard() {
  const [empUsers, setEmpUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editEmp, setEditEmp] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    department: "",
    role: "employee", // Default role
    projectNames: [], // Store project names
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // State to control department field disablement
  // Set to true to disable department by default as requested
  const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(true);

  // 💡 Responsiveness hooks
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.up("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empls, projs, depts] = await Promise.all([
          getAllUsersByRole("employee"),
          getAllProjects(),
          getAllDepartments(),
        ]);
        setEmpUsers(empls);
        setProjects(projs);
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        showSnackbar("Failed to load data. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to show Snackbar messages
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear error on change
  };

  const handleProjectChange = (event) => {
    const {
      target: { value },
    } = event;
    const selectedProjects =
      typeof value === "string" ? value.split(",") : value;
    setForm({
      ...form,
      projectNames: selectedProjects,
    });
    setFormErrors((prevErrors) => ({ ...prevErrors, projectNames: "" }));
  };

  const validateForm = () => {
    let errors = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is invalid.";
    }
    if (!form.mobile.trim()) {
      errors.mobile = "Mobile is required.";
    } else if (!/^\d{10}$/.test(form.mobile)) {
      errors.mobile = "Mobile number must be 10 digits.";
    }
    if (!editEmp && !form.password.trim()) {
      errors.password = "Password is required."; // Password required only for new employee
    } else if (!editEmp && form.password.trim().length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    // ⭐ ONLY validate department if it's NOT disabled
    if (!isDepartmentDisabled && !form.department) {
      errors.department = "Department is required.";
    }

    if (form.projectNames.length === 0) {
      errors.projectNames = "At least one project must be selected.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showSnackbar("Please correct the form errors.", "error");
      return;
    }

    try {
      const submitForm = { ...form };

      // ⭐ Handle department value based on disabled state for submission
      if (isDepartmentDisabled) {
        // If department is disabled, you might want to:
        // 1. Delete the field from the payload (if backend ignores it)
        delete submitForm.department;
        // 2. Or, set it to a specific default value (e.g., null, empty string, or a specific ID)
        // submitForm.department = null; // Or some default_department_id
      } else {
        // If department is enabled, ensure its ID is sent
        submitForm.department = form.department;
      }

      // projectNames already contains the array of project names
      submitForm.projects = form.projectNames;

      let message = "";
      if (editEmp) {
        // If editing, also pass the employee's ID and exclude password if not changed
        const updatePayload = { ...submitForm };
        if (submitForm.password === "") {
          // Don't send empty password on update if it wasn't explicitly changed
          delete updatePayload.password;
        }
        const updated = await updateUser(editEmp._id, updatePayload);
        setEmpUsers(empUsers.map((e) => (e._id === updated._id ? updated : e)));
        message = "Employee updated successfully!";
      } else {
        const created = await createUser(submitForm);
        setEmpUsers([...empUsers, created]);
        message = "Employee added successfully!";
      }
      showSnackbar(message, "success");
      handleCloseDialog();
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Unknown error";
      showSnackbar(`Failed to save employee: ${errorMessage}`, "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteUser(id);
        setEmpUsers(empUsers.filter((e) => e._id !== id));
        showSnackbar("Employee deleted successfully!", "success");
      } catch (err) {
        console.error("Delete error:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Unknown error";
        showSnackbar(`Failed to delete employee: ${errorMessage}`, "error");
      }
    }
  };

  const handleOpenAddDialog = () => {
    setEditEmp(null);
    setForm({
      name: "",
      email: "",
      mobile: "",
      department: "",
      role: "employee",
      projectNames: [],
      password: "",
    });
    setShowPassword(false);
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const handleOpenEditDialog = (emp) => {
    setEditEmp(emp);
    setForm({
      name: emp.name || "",
      email: emp.email || "",
      mobile: emp.mobile || "",
      // Ensure department is set by its ID for the Select component
      department: emp.department || "",
      role: emp.role || "employee",
      projectNames: Array.isArray(emp.projects) ? emp.projects : [], // Ensure it's an array of names
      password: "", // Never pre-fill password for security
    });
    setShowPassword(false);
    setFormErrors({});
    setAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAddDialogOpen(false);
    setEditEmp(null);
    setShowPassword(false);
    setFormErrors({});
    setForm({
      name: "",
      email: "",
      mobile: "",
      department: "",
      role: "employee",
      projectNames: [],
      password: "",
    });
  };

  const filtered = empUsers.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departments.find((d) => d.department === e.department)
  );
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Loading employees...</Typography>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ p: { xs: 2, md: 3 }, pb: 4, minHeight: "100vh" }}
    >
      <Typography
        variant={isSmallScreen ? "h5" : "h4"}
        fontWeight="bold"
        gutterBottom
      >
        Employee Management
      </Typography>

      <Stack
        direction={isSmallScreen ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isSmallScreen ? "flex-start" : "center"}
        my={2}
        spacing={isSmallScreen ? 2 : 3}
      >
        <Button
          variant="contained"
          onClick={handleOpenAddDialog}
          size={isSmallScreen ? "medium" : "large"}
          fullWidth={isSmallScreen}
          sx={{
            backgroundColor: "#1976D2",
            "&:hover": {
              backgroundColor: "#1565C0",
            },
          }}
        >
          Add Employee
        </Button>
        <TextField
          size="small"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: isSmallScreen ? "100%" : 250 }}
        />
      </Stack>

      <Paper sx={{ p: { xs: 1, md: 2 }, backgroundColor: "#f9f9f9" }}>
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: isLargeScreen
              ? TABLE_MAX_HEIGHT_LARGE
              : isMediumScreen
              ? TABLE_MAX_HEIGHT_MEDIUM
              : TABLE_MAX_HEIGHT_SMALL,
            overflowY: "auto",
            overflowX: "auto",
            backgroundColor: "#f9f9f9",
            border: 1,
            borderColor: "grey.300",
            borderRadius: 2,
            minWidth: 0,
          }}
        >
          <Table stickyHeader size={isExtraSmallScreen ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                {[
                  "#",
                  "Name",
                  "Email",
                  "Mobile",
                  "Department",
                  "Projects",
                  "Action",
                ].map((head, i) => (
                  <TableCell
                    key={i}
                    sx={{
                      backgroundColor: "grey",
                      fontWeight: "bold",
                      color: "white",
                      border: "1px solid #ccc",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      textAlign: "center",
                      fontSize: isExtraSmallScreen ? "0.75rem" : "0.85rem",
                      whiteSpace: "nowrap",
                      padding: isExtraSmallScreen ? "8px 4px" : "12px 8px",
                      minWidth:
                        head === "Action"
                          ? isExtraSmallScreen
                            ? "90px"
                            : "120px"
                          : head === "Name" || head === "Email"
                          ? isExtraSmallScreen
                            ? "100px"
                            : "150px"
                          : "auto",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((emp, i) => (
                  <TableRow key={emp._id} hover>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        textAlign: "center",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                      }}
                    >
                      {i + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                      }}
                    >
                      {emp.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        wordBreak: "break-word",
                      }}
                    >
                      {emp.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.mobile}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                      }}
                    >
                      {emp.department}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        fontSize: isExtraSmallScreen ? "0.7rem" : "0.8rem",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        wordBreak: "break-word",
                      }}
                    >
                      {(emp.projects || []).join(", ")}
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid #ccc",
                        textAlign: "center",
                        padding: isExtraSmallScreen ? "6px 4px" : "8px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <IconButton
                        size={isSmallScreen ? "small" : "medium"}
                        onClick={() => handleOpenEditDialog(emp)}
                      >
                        <EditIcon
                          color="primary"
                          fontSize={isSmallScreen ? "small" : "medium"}
                        />
                      </IconButton>
                      <IconButton
                        size={isSmallScreen ? "small" : "medium"}
                        color="error"
                        onClick={() => handleDelete(emp._id)}
                      >
                        <DeleteIcon
                          fontSize={isSmallScreen ? "small" : "medium"}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ border: "1px solid #ccc", py: 2 }}
                  >
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth={isSmallScreen ? "sm" : "xs"}
      >
        <DialogTitle>{editEmp ? "Edit Employee" : "Add Employee"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={isSmallScreen ? 1.5 : 2}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              size="small"
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              size="small"
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              fullWidth
              size="small"
              required
              error={!!formErrors.mobile}
              helperText={formErrors.mobile}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              fullWidth
              size="small"
              required={!editEmp}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {/* ⭐ Disabled Department FormControl */}
            <FormControl
              fullWidth
              size="small"
              required // Keep required if it's conceptually required when enabled
              error={!!formErrors.department}
            >
              <InputLabel>Department</InputLabel>
              <Select
                name="department"
                value={form.department}
                onChange={handleChange}
                label="Department"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.department}
                  </MenuItem>
                ))}
              </Select>
              {/* ⭐ Conditionally render error message only if not disabled and there's an error */}
              {!isDepartmentDisabled && formErrors.department && (
                <Typography color="error" variant="caption">
                  {formErrors.department}
                </Typography>
              )}
            </FormControl>
            <FormControl
              fullWidth
              size="small"
              required
              error={!!formErrors.projectNames}
            >
              <InputLabel>Projects</InputLabel>
              <Select
                name="projectNames"
                multiple
                value={
                  Array.isArray(form.projectNames) ? form.projectNames : []
                }
                onChange={handleProjectChange}
                renderValue={(selected) => selected.join(", ")}
                label="Projects"
              >
                {projects
                  .filter((proj) => {
                    const selectedDepartment = departments.find(
                      (d) => d._id === form.department
                    );
                    if (
                      selectedDepartment &&
                      selectedDepartment.name === "Functional"
                    ) {
                      // If the employee is functional, they cannot take an already assigned functional project
                      const usedProjectsByFunctional = empUsers
                        .filter(
                          (emp) =>
                            departments.find((d) => d._id === emp.department)
                              ?.department === "Functional" &&
                            emp._id !== editEmp?._id // Exclude current employee's existing projects if editing
                        )
                        .flatMap((emp) => emp.projects || []);
                      return !usedProjectsByFunctional.includes(proj.project);
                    }
                    return true; // All projects available for non-functional employees
                  })
                  .map((proj) => (
                    <MenuItem key={proj._id} value={proj.project}>
                      <Checkbox
                        checked={form.projectNames.includes(proj.project)}
                      />
                      <ListItemText primary={proj.project} />
                    </MenuItem>
                  ))}
              </Select>
              {formErrors.projectNames && (
                <Typography color="error" variant="caption">
                  {formErrors.projectNames}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: "#f26522",
              "&:hover": {
                backgroundColor: "#e05a1d",
              },
            }}
          >
            {editEmp ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
