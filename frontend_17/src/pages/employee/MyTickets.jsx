import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Paper,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  FormControlLabel,
  Switch,
  IconButton,
  Tooltip, // Added: Tooltip component
  Chip, // Added: Chip component
  CircularProgress, // Added: CircularProgress for loading indicator
  Snackbar, // Added: Snackbar for success message
  Alert, // Added: Alert for success message
} from "@mui/material";
import { useMemo } from "react";
import { FaFilter } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EditIcon from "@mui/icons-material/Edit"; // Added: EditIcon
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { sendTicketEmail } from "../../api/emailApi";

import {
  createTicket,
  getAllTickets,
  updateTicket,
  getHandoverTicketsByUser,
  deleteTicket, // Assuming deleteTicket is used based on previous context, even if not directly in error
} from "../../api/ticketApi";
import {
  getAllProjects,
  getAllDepartments,
  getAllCategories,
  getAllPriorities,
} from "../../api/dropDownApi";
import {
  getCommentsByTicket,
  createComment,
  reactToComment,
  deleteComment,
  updateComment,
} from "../../api/commentApi";
import { getAllUsers, getAllUsersByRole } from "../../api/userApi";
import { useLocation } from "react-router-dom";

import { BASE_URL } from "../../api/api";
import { getAllStatuses } from "../../api/statusApi";

/* —————————————————————————————————————————————————— */
/* INITIAL STATE                                                                  */
/* —————————————————————————————————————————————————— */
const username = localStorage.getItem("username");

dayjs.extend(utc);
dayjs.extend(timezone);
const initialFormData = {
  name: "",
  subject: "",
  projectId: "",
  project: "",
  departmentId: "",
  department: "",
  categoryId: "",
  category: "",
  priorityId: "",
  priority: "",
  employeeId: "",
  employee: "",
  issue: "",
  mainStatus: "",
  attachments: [],
};

const E_Ticket = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const statusQuery = query.get("status");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [tickets, setTickets] = useState([]);
  const [viewTicket, setViewTicket] = useState(null);

  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]); // Added: departments state
  const [status, setStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [assigning, setAssigning] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  const [isPublic, setIsPublic] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [showMyHandovers, setShowMyHandovers] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    project: "",
    category: "",
    mainStatus: "",
    subStatus: "",
    assignee: "",
    priority: "",
    fromDate: "",
    toDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // New: State for submission loading
  const [snackbarOpen, setSnackbarOpen] = useState(false); // New: State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // New: State for Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // New: State for Snackbar severity

  const cellStyle = {
    border: "1px solid #ccc",
    fontSize: "0.95rem", // Increased font size
    textAlign: "center",
    padding: "10px", // Increased padding
    wordBreak: "break-word",
    py: 0.5,
  };

  const exportToExcel = () => {
    const data = sortedTickets.map((ticket) => ({
      "Ticket No": ticket.ticketNo,
      Subject: ticket.subject,
      Project: ticket.project,
      Category: ticket.category,
      Priority: ticket.priority,
      "Main Status": ticket.mainStatus,
      "Sub Status": ticket.subStatus,
      Assignee:
        users.find((u) => u._id === ticket.employeeId)?.name || "Unassigned",
      "Created Time": dayjs(ticket.createdTime)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm"),
      "Updated Time": dayjs(ticket.updatedTime)
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "Filtered_Tickets.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData = sortedTickets.map((ticket, index) => [
      index + 1,
      ticket.ticketNo,
      ticket.subject,
      ticket.project,
      ticket.category,
      ticket.priority,
      ticket.mainStatus,
      ticket.subStatus,
      users.find((u) => u._id === ticket.employeeId)?.name || "Unassigned",
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "Ticket No",
          "Subject",
          "Project",
          "Category",
          "Priority",
          "Main Status",
          "Sub Status",
          "Assignee",
        ],
      ],
      body: tableData,
    });

    doc.save("Filtered_Tickets.pdf");
  };

  useEffect(() => {
    if (viewTicket) {
      fetchComments(viewTicket._id);
    }
  }, [viewTicket]);

  useEffect(() => {
    fetchAll();
  }, [statusQuery]);

  const fetchAll = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const [ticketData, proj, dept, cat, prio, users, emp, statusList] =
        await Promise.all([
          getAllTickets(),
          getAllProjects(),
          getAllDepartments(),
          getAllCategories(),
          getAllPriorities(),
          getAllUsers(),
          getAllUsersByRole("employee"),
          getAllStatuses(),
        ]);

      const assigned = ticketData.filter((t) => t.employeeId === userId);
      const created = ticketData.filter((t) => t.userId === userId);
      const combined = [
        ...assigned,
        ...created.filter((ct) => !assigned.some((at) => at._id === ct._id)),
      ];

      const filtered = statusQuery
        ? combined.filter((t) => t.mainStatus === statusQuery)
        : combined;

      setTickets(filtered);
      setProjects(proj);
      setDepartments(dept); // Fixed: setDepartments is now defined
      setCategories(cat);
      setPriorities(prio);
      const filterEmp = emp.filter((e) => e._id !== userId);
      setEmployees(filterEmp);
      setUsers(users);
      setStatus(statusList);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const applyFilters = (ticket) => {
    const {
      project,
      category,
      mainStatus,
      subStatus,
      assignee,
      priority,
      fromDate,
      toDate,
    } = filterValues;

    const matchesProject =
      !project || ticket.project?.toLowerCase().includes(project.toLowerCase());
    const matchesCategory =
      !category ||
      ticket.category?.toLowerCase().includes(category.toLowerCase());
    const matchesMainStatus =
      !mainStatus ||
      ticket.mainStatus?.toLowerCase().includes(mainStatus.toLowerCase());
    const matchesSubStatus =
      !subStatus ||
      ticket.subStatus?.toLowerCase().includes(subStatus.toLowerCase());
    const matchesAssignee =
      !assignee ||
      users
        .find((u) => u._id === ticket.employeeId)
        ?.name?.toLowerCase()
        .includes(assignee.toLowerCase());
    const matchesPriority =
      !priority ||
      ticket.priority?.toLowerCase().includes(priority.toLowerCase());
    const matchesFromDate =
      !fromDate || new Date(ticket.createdTime) >= new Date(fromDate);
    const matchesToDate =
      !toDate || new Date(ticket.createdTime) <= new Date(toDate);

    return (
      matchesProject &&
      matchesCategory &&
      matchesMainStatus &&
      matchesSubStatus &&
      matchesAssignee &&
      matchesPriority &&
      matchesFromDate &&
      matchesToDate
    );
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "attachments") {
      setFormData((prev) => ({
        ...prev,
        attachments: Array.from(files),
      }));
      return;
    }

    if (typeof value === "object" && value !== null && value._id) {
      const id = value._id;

      const fieldMap = {
        project: {
          idKey: "projectId",
          nameKey: "project",
          labelKey: "project",
        },
        category: {
          idKey: "categoryId",
          nameKey: "category",
          labelKey: "category",
        },
        department: {
          idKey: "departmentId",
          nameKey: "department",
          labelKey: "department",
        },
        priority: {
          idKey: "priorityId",
          nameKey: "priority",
          labelKey: "priority",
        },
        employeeId: {
          idKey: "employeeId",
          nameKey: "employee",
          labelKey: "name",
        },
      };

      if (fieldMap[name]) {
        const { idKey, nameKey, labelKey } = fieldMap[name];
        setFormData((prev) => ({
          ...prev,
          [idKey]: id,
          [nameKey]: value[labelKey],
        }));
      }

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const currentUserId = localStorage.getItem("userId");

    try {
      let createdOrUpdated;

      if (editMode) {
        const originalTicket = tickets.find((t) => t._id === editId);
        const form = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
          if (key === "attachments") {
            value.forEach((file) => form.append("attachments", file));
          } else {
            form.append(key, value);
          }
        });

        // Handover update logic
        const isHandover =
          formData.mainStatus === "handover" &&
          formData.employeeId !== originalTicket?.employeeId;

        if (isHandover) {
          const existingHandoverHistory = originalTicket?.handoverHistory || [];

          const handoverEntry = {
            fromEmployeeId: originalTicket.employeeId,
            toEmployeeId: formData.employeeId,
            reassignedBy: currentUserId,
            reassignedAt: new Date(),
          };

          form.append(
            "handoverHistory",
            JSON.stringify([...existingHandoverHistory, handoverEntry])
          );
        }

        createdOrUpdated = await updateTicket(editId, form);
        setTickets((prev) =>
          prev.map((t) => (t._id === editId ? createdOrUpdated : t))
        );

        if (originalTicket?.employeeId !== formData.employeeId) {
          const selectedEmployee = employees.find(
            (emp) => emp._id === formData.employeeId
          );
          const reassignmentComment = {
            ticketId: editId,
            userId: currentUserId,
            comment: `Ticket reassigned from ${
              users.find((u) => u._id === originalTicket.employeeId)?.name ||
              "Unassigned"
            } to ${selectedEmployee?.name || "Unassigned"}.`,
            visibility: "internal",
          };
          await createComment(reassignmentComment);
        }

        setSnackbarMessage("Ticket updated successfully!");
        setSnackbarSeverity("success");
      } else {
        const isHandover =
          formData.mainStatus === "handover" &&
          formData.employeeId !== currentUserId;

        if (isHandover) {
          const jsonPayload = {
            ...formData,
            employeeId: currentUserId,
            handoverHistory: [
              {
                fromEmployeeId: currentUserId,
                toEmployeeId: formData.employeeId,
                reassignedBy: currentUserId,
                reassignedAt: new Date(),
              },
            ],
          };

          createdOrUpdated = await createTicket(jsonPayload);
        } else {
          const form = new FormData();
          Object.entries(formData).forEach(([key, value]) => {
            if (key === "attachments") {
              value.forEach((file) => form.append("attachments", file));
            } else {
              form.append(key, value);
            }
          });
          form.append("userId", currentUserId);

          createdOrUpdated = await createTicket(form);
        }

        setTickets((prev) => [...prev, createdOrUpdated]);
        setSnackbarMessage("Ticket created successfully!");
        setSnackbarSeverity("success");
      }

      const clientEmail = "client@example.com";
      sendEmailToAssignedEmployee(editMode, createdOrUpdated);
      // sendEmailToClient(createdOrUpdated, clientEmail);
      setSnackbarOpen(true); // Show Snackbar on success
    } catch (err) {
      console.error("Submit failed:", err);
      setSnackbarMessage("Failed to create/update ticket.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true); // Show Snackbar on error
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }

    setFormData(initialFormData);
    setShowForm(false);
    setEditMode(false);
    setEditId(null);
    await fetchAll();
  };

  async function sendEmailToClient(createdOrUpdated, email) {
    const requesterName = localStorage.getItem("username") || "Valued User";
    const ticketNumber = createdOrUpdated.ticketNo || createdOrUpdated._id;
    const subject = `Ticket #${ticketNumber} Acknowledgement – ${createdOrUpdated.subject}`;

    const ticketUrl = `${window.location.origin}/ticket/view/${createdOrUpdated._id}`;

    const htmlContent = `
        <div style="background-color: #fdf8e4; padding: 40px 0;">
          <div style="max-width: 500px; margin: auto; background-color: #fff; padding: 30px; border: 1px solid #ddd; font-family: Arial, sans-serif; color: #333;">
            <p style="font-size: 16px;">Dear ${requesterName},</p>

            <p style="font-size: 15px;">
              We've received your request for the ticket <strong>#${ticketNumber} – ${createdOrUpdated.subject}</strong>.<br/>
              A member of our support team has been assigned and will respond shortly.
            </p>

            <p style="font-size: 14px;">
              You may review or track your ticket using the link below:
            </p>

            <div style="margin-top: 20px; text-align: center;">
              <a href="${ticketUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px;">
              Regards,<br/>
              <span style="background-color: yellow; font-weight: bold;">Click Erp PVT. LTD.</span><br/>
              Support Team.
            </p>
          </div>
        </div>
      `;

    await sendTicketEmail({
      to: email,
      subject,
      text: `Acknowledgement for ticket #${ticketNumber}`,
      html: htmlContent,
    });
  }

  async function sendEmailToAssignedEmployee(editMode, createdOrUpdated) {
    const assignedEmployee = employees.find(
      (e) => e._id === createdOrUpdated.employeeId
    );

    const isEdit = editMode;
    const subject = isEdit
      ? `Ticket Updated - ${createdOrUpdated.category}`
      : `New Ticket Assigned - ${createdOrUpdated.category}`;

    const ticketUrl = `${window.location.origin}/ticket/view/${createdOrUpdated._id}`;

    const htmlContent = `
        <div style="background-color: #fdf8e4; padding: 40px 0;">
          <div style="max-width: 500px; margin: auto; background-color: #fff; padding: 30px; border: 1px solid #ddd; font-family: Arial, sans-serif; color: #333;">
            <p style="font-size: 16px;">Dear ${
              assignedEmployee?.name || "Team"
            },</p>

            <p style="font-size: 15px;">
              ${
                isEdit
                  ? "The following ticket has been updated"
                  : "A new ticket has been assigned to you"
              }. Please review the details below and take appropriate action.
            </p>

            <h3 style="margin-top: 20px; margin-bottom: 10px;">Ticket Details</h3>
            <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
              <tr><td style="padding: 6px;"><strong>Ticket Name:</strong></td><td style="padding: 6px;">${
                createdOrUpdated.name
              }</td></tr>
              <tr><td style="padding: 6px;"><strong>Subject:</strong></td><td style="padding: 6px;">${
                createdOrUpdated.subject
              }</td></tr>
              <tr><td style="padding: 6px;"><strong>Project:</strong></td><td style="padding: 6px;">${
                createdOrUpdated.project
              }</td></tr>
              <tr><td style="padding: 6px;"><strong>Category:</strong></td><td style="padding: 6px;">${
                createdOrUpdated.category
              }</td></tr>
              <tr><td style="padding: 6px;"><strong>Priority:</strong></td><td style="padding: 6px;">${
                createdOrUpdated.priority
              }</td></tr>
              <tr><td style="padding: 6px;"><strong>Issue:</strong></td><td style="padding: 6px;">${
                createdOrUpdated.issue
              }</td></tr>
              <tr><td style="padding: 6px;"><strong>Status:</strong></td><td style="padding: 6px;">${
                createdOrUpdated.mainStatus || "Open"
              }</td></tr>
            </table>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${ticketUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Ticket
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 14px;">
              Regards,<br/>
              <span style="background-color: yellow; font-weight: bold;">Click Erp PVT. LTD.</span><br/>
              Support Team
            </p>
          </div>
        </div>
      `;

    await sendTicketEmail({
      to: assignedEmployee?.email || "default@example.com",
      subject,
      text: `${isEdit ? "Ticket updated" : "New ticket assigned"}: ${
        createdOrUpdated.name
      }`,
      html: htmlContent,
    });
  }

  const handleEdit = (ticket) => {
    setFormData({
      name: ticket.name,
      subject: ticket.subject,
      projectId: ticket.projectId,
      project: ticket.project,
      departmentId: ticket.departmentId,
      department: ticket.department,
      categoryId: ticket.categoryId,
      category: ticket.category,
      priorityId: ticket.priorityId,
      priority: ticket.priority,
      issue: ticket.issue,
      mainStatus: ticket.mainStatus,
      employeeId: ticket.employeeId,
      employee: ticket.employee,
      attachments: [],
    });
    setEditMode(true);
    setEditId(ticket._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id);
      setTickets(tickets.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleView = (ticket) => {
    console.log("handover ticket history ", ticket.handoverHistory);
    setViewTicket(ticket);
    console.log("users are ", users);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    console.log("new comment ", newComment);
    const payload = {
      ticketId: viewTicket._id,
      userId: localStorage.getItem("userId"),
      comment: newComment,
      visibility: isPublic ? "public" : "internal",
    };
    console.log("new payload ", payload);
    try {
      await createComment(payload);
      setNewComment("");
      setIsPublic(true);
      fetchComments(viewTicket._id);
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleReaction = async (commentId, type) => {
    try {
      const updated = await reactToComment(commentId, type);

      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updated : c))
      );
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };
  const fetchComments = async (ticketId) => {
    try {
      const data = await getCommentsByTicket(ticketId);
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleUpdateComment = async (commentId) => {
    try {
      const updated = await updateComment(commentId, editedCommentText);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updated : c))
      );
      setEditingCommentId(null);
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const statusMap = useMemo(() => {
    const map = {};
    status.forEach(({ mainStatus, subStatus }) => {
      if (!map[mainStatus]) map[mainStatus] = [];
      if (Array.isArray(subStatus)) {
        map[mainStatus].push(...subStatus);
      } else {
        map[mainStatus].push(subStatus);
      }
    });
    return map;
  }, [status]);

  const getSubStatusFromMainStatus = (mainSt) => statusMap[mainSt] || [];

  const sortedTickets = React.useMemo(() => {
    let filtered = tickets.filter(
      (ticket) =>
        ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issue.toLowerCase().includes(searchTerm.toLowerCase())
    );
    filtered = filtered.filter(applyFilters);

    return filtered.sort(
      (a, b) => dayjs(b.createdTime).valueOf() - dayjs(a.createdTime).valueOf()
    );
  }, [tickets, searchTerm, filterValues, users]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "info";
      case "inprocess":
        return "warning";
      case "closed":
        return "success";
      case "handover":
        return "secondary";
      case "working":
        return "primary";
      default:
        return "default";
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  /* —————————————————————————————————————————————————— */
  /* RENDER */
  /* —————————————————————————————————————————————————— */
  return (
    <Container maxWidth="xl" sx={{ mt: 4, display: "flex" }}>
      {!showForm && !viewTicket && (
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {filtersOpen && (
            <Box
              sx={{
                width: 300,
                p: 2,
                borderRight: "1px solid #ccc",
                backgroundColor: "#f8f8f8",
                height: "100vh",
                overflowY: "auto",
                flexShrink: 0,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Grid container spacing={2}>
                {[
                  "project",
                  "category",
                  "mainStatus",
                  "subStatus",
                  "assignee",
                  "priority",
                ].map((key) => (
                  <Grid item xs={12} key={key}>
                    <TextField
                      fullWidth
                      size="small"
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={filterValues[key]}
                      onChange={(e) =>
                        setFilterValues({
                          ...filterValues,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="From Date"
                    InputLabelProps={{ shrink: true }}
                    value={filterValues.fromDate}
                    onChange={(e) =>
                      setFilterValues({
                        ...filterValues,
                        fromDate: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="To Date"
                    InputLabelProps={{ shrink: true }}
                    value={filterValues.toDate}
                    onChange={(e) =>
                      setFilterValues({
                        ...filterValues,
                        toDate: e.target.value,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button variant="outlined" onClick={exportToExcel} fullWidth>
                    Export Excel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button variant="outlined" onClick={exportToPDF} fullWidth>
                    Export PDF
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

          <Box
            sx={{
              flexGrow: 1,
              px: 2,
              minWidth: 0,
              overflow: "hidden",
              height: "100vh",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton onClick={() => setFiltersOpen(!filtersOpen)}>
                  <FaFilter style={{ color: "black" }} />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  List of Tickets
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMyHandovers}
                      onChange={async () => {
                        const newValue = !showMyHandovers;
                        setShowMyHandovers(newValue);
                        if (newValue) {
                          const userId = localStorage.getItem("userId");
                          const handovers = await getHandoverTicketsByUser(
                            userId
                          );
                          setTickets(handovers);
                        } else {
                          await fetchAll();
                        }
                      }}
                    />
                  }
                  label="Reassigned by Me"
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  size="small"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="contained" onClick={() => setShowForm(true)}>
                  Add Ticket
                </Button>
              </Stack>
            </Stack>

            <Paper
              sx={{
                height: "calc(100vh - 362px)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f9f9f9",
              }}
            >
              <TableContainer
                sx={{ flexGrow: 1, overflowY: "auto", overflowX: "auto" }}
              >
                {" "}
                {/* Added overflowX for horizontal scrolling */}
                <Table
                  stickyHeader
                  sx={{
                    tableLayout: "auto",
                    width: "140%",
                    borderCollapse: "collapse",
                    border: "1px solid #ddd",
                  }}
                >
                  {/* Reverted to auto table layout and 140% width */}
                  <TableHead>
                    <TableRow>
                      {[
                        "#",
                        "Ticket Id",
                        "Subject",
                        "Project",
                        "Issue",
                        "Submitted Time",
                        "Last Updated",
                        "Assignee",
                        "Sub Status",
                        "Main Status",
                        "Action",
                      ].map((label, idx) => (
                        <TableCell
                          key={idx}
                          sx={{
                            backgroundColor: "grey",
                            color: "white",
                            fontWeight: "bold",
                            border: "1px solid #ddd", // Add border to TableCell
                            textAlign: "center",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            fontSize: "0.95rem", // Increased font size
                            cursor: "pointer",
                            width:
                              idx === 0
                                ? "5px"
                                : idx === 1
                                ? "10px"
                                : idx === 2
                                ? "20px"
                                : idx === 3
                                ? "20px"
                                : idx === 4
                                ? "40px"
                                : idx === 5 || idx === 6
                                ? "25px"
                                : idx === 7 || idx === 8 || idx === 9
                                ? "25px"
                                : idx === 10
                                ? "15px"
                                : "auto",
                          }}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedTickets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={11}
                          align="center"
                          sx={{ border: "1px solid #ddd" }}
                        >
                          No tickets available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedTickets.map((ticket, index) => (
                        <TableRow
                          key={ticket._id}
                          hover
                          sx={{ border: "1px solid #ddd" }}
                        >
                          <TableCell
                            sx={{ width: "5px", border: "1px solid #ddd" }}
                          >
                            {index + 1}
                          </TableCell>
                          <TableCell
                            sx={{ width: "10px", border: "1px solid #ddd" }}
                          >
                            <Tooltip title={`Ticket ID: ${ticket.ticketNo}`}>
                              <span
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                                onClick={() => handleView(ticket)}
                              >
                                {ticket.ticketNo}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell
                            sx={{ width: "20px", border: "1px solid #ddd" }}
                          >
                            {ticket.subject}
                          </TableCell>
                          <TableCell
                            sx={{ width: "20px", border: "1px solid #ddd" }}
                          >
                            {ticket.project}
                          </TableCell>
                          <TableCell
                            sx={{ width: "40px", border: "1px solid #ddd" }}
                          >
                            {ticket.issue}
                          </TableCell>
                          <TableCell
                            sx={{ width: "25px", border: "1px solid #ddd" }}
                          >
                            {dayjs(ticket.createdTime)
                              .tz("Asia/Kolkata")
                              .format("DD‑MMM‑YYYY HH:mm")}
                          </TableCell>
                          <TableCell
                            sx={{ width: "25px", border: "1px solid #ddd" }}
                          >
                            {dayjs(ticket.updatedTime)
                              .tz("Asia/Kolkata")
                              .format("DD‑MMM‑YYYY HH:mm")}
                          </TableCell>
                          <TableCell
                            sx={{ width: "25px", border: "1px solid #ddd" }}
                          >
                            {ticket.employee || "Unassigned"}
                          </TableCell>
                          <TableCell
                            sx={{ width: "25px", border: "1px solid #ddd" }}
                          >
                            <Chip
                              label={
                                statusMap[ticket.mainStatus]
                                  ? statusMap[ticket.mainStatus].join(", ")
                                  : "—"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell
                            sx={{ width: "25px", border: "1px solid #ddd" }}
                          >
                            {ticket.mainStatus}
                          </TableCell>
                          <TableCell
                            sx={{
                              width: "15px",
                              textAlign: "center",
                              border: "1px solid #ddd",
                            }}
                          >
                            <IconButton
                              onClick={() => handleEdit(ticket)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      )}

      {showForm && (
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            height: "calc(100vh - 300px)",
            p: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Add / Edit Ticket
          </Typography>
          <Typography color="gray" mb={2}>
            Home → Add / Edit Ticket
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} direction="column">
              <Grid item>
                <TextField
                  fullWidth
                  required
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item>
                <TextField
                  select
                  fullWidth
                  required
                  label="Project"
                  name="project"
                  value={
                    projects.find((p) => p._id === formData.projectId) || ""
                  }
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {projects.map((proj) => (
                    <MenuItem key={proj._id} value={proj}>
                      {proj.project}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  select
                  fullWidth
                  required
                  label="Category"
                  name="category"
                  value={
                    categories.find((c) => c._id === formData.categoryId) || ""
                  }
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat._id} value={cat}>
                      {cat.category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  select
                  fullWidth
                  required
                  label="Priority"
                  name="priority"
                  value={
                    priorities.find((p) => p._id === formData.priorityId) || ""
                  }
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {priorities.map((pri) => (
                    <MenuItem key={pri._id} value={pri}>
                      {pri.priority}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  select
                  fullWidth
                  required
                  label="Main Status"
                  name="mainStatus"
                  value={formData.mainStatus}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="inProcess">In Process</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                  <MenuItem value="handover">Handover</MenuItem>
                  <MenuItem value="working">Working</MenuItem>
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  select
                  fullWidth
                  label="Assign To Employee"
                  name="employeeId"
                  value={
                    employees.find((e) => e._id === formData.employeeId) || ""
                  }
                  onChange={handleChange}
                >
                  <MenuItem value="">Select</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp}>
                      {emp.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  label="Issue"
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Attachments
                </Typography>
                <input
                  type="file"
                  name="attachments"
                  multiple
                  onChange={handleChange}
                />
                {formData.attachments.length > 0 && (
                  <List>
                    {formData.attachments.map((file, i) => (
                      <ListItem key={i}>{file.name}</ListItem>
                    ))}
                  </List>
                )}
              </Grid>

              <Grid item>
                <Box mt={2} display="flex" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting} // Disable button when submitting
                    startIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    } // Show loading spinner
                  >
                    {isSubmitting
                      ? editMode
                        ? "Updating..."
                        : "Creating..."
                      : editMode
                      ? "Update"
                      : "Submit"}
                  </Button>
                  <Button variant="outlined" onClick={() => setShowForm(false)}>
                    Back
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      )}

      {viewTicket && (
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            height: "calc(100vh - 250px)",
            px: 3,
          }}
        >
          <Box sx={{ maxWidth: 900, mx: "auto", px: 2 }}>
            <Paper
              sx={{
                p: 3,
                position: "relative",
                border: "1px solid #ddd",
                backgroundColor: "#fdf8e4",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  position: "fixed",
                  top: 130,
                  right: 390,
                  zIndex: 1300,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => setViewTicket(null)}
                  sx={{
                    fontWeight: "bold",
                    px: 2,
                    py: 0.5,
                    fontSize: "0.75rem",
                    borderRadius: "20px",
                  }}
                >
                  ⬅ BACK
                </Button>
              </Box>

              <Typography variant="h5" fontWeight="bold">
                Ticket - {viewTicket.ticketNo} - {viewTicket.subject}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: "0.75rem", mb: 2 }}
              >
                Added by {viewTicket.createdBy?.name || "User"} • Updated{" "}
                {viewTicket.lastUpdated}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {[
                  ["Status", viewTicket.mainStatus],
                  ["Priority", viewTicket.priority],
                  ["Project", viewTicket.project],
                  ["Category", viewTicket.category],
                  [
                    "Submitted",
                    dayjs(viewTicket.createdTime)
                      .tz("Asia/Kolkata")
                      .format("DD-MMM-YYYY HH:mm"),
                  ],
                  ["Assigned To", viewTicket.employee || "Not Assigned"],
                ].map(([label, value], i) => (
                  <Box key={i} sx={{ width: "40%", mb: 1 }}>
                    <Typography sx={{ fontSize: "0.9rem" }}>
                      <strong>{label}:</strong> {value}
                    </Typography>
                  </Box>
                ))}

                <Box sx={{ width: "100%", mt: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem", mb: 0.5 }}>
                    <strong>Description:</strong>
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.9rem" }}
                    color="text.secondary"
                  >
                    {viewTicket.issue}
                  </Typography>
                </Box>
              </Box>

              <Box mt={4}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  📎 Attachments
                </Typography>
                {viewTicket.attachments?.length > 0 ? (
                  viewTicket.attachments.map((file, i) => (
                    <Box key={i} sx={{ mb: 0.5 }}>
                      <a
                        href={`${BASE_URL}/${file.path}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "#1976d2" }}
                      >
                        📄 {file.filename}
                      </a>
                    </Box>
                  ))
                ) : (
                  <Typography color="gray">No attachments.</Typography>
                )}
              </Box>

              <Box mt={5}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  💬 Discussion
                </Typography>

                {comments.map((c) => (
                  <Paper key={c._id} sx={{ p: 2, mt: 2 }}>
                    <Typography fontWeight="bold">{c.userId?.name}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "0.75rem", color: "#888" }}
                    >
                      {new Date(c.updatedAt || c.createdAt).toLocaleString()}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>{c.comment}</Typography>
                  </Paper>
                ))}

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mt: 2 }}
                />

                <Box display="flex" alignItems="center" mt={1}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    id="visibility"
                  />
                  <label htmlFor="visibility" style={{ marginLeft: 8 }}>
                    Make comment visible to client (public)
                  </label>
                </Box>

                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    if (isPublic) {
                      setConfirmOpen(true);
                    } else {
                      submitComment();
                    }
                  }}
                >
                  Post Comment
                </Button>

                {confirmOpen && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: "1px solid #ccc",
                      borderRadius: 2,
                      backgroundColor: "#fff3cd",
                    }}
                  >
                    <Typography fontWeight="bold" gutterBottom>
                      ⚠️ Are you sure you want to post this comment as public?
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ mr: 1 }}
                      onClick={() => {
                        setConfirmOpen(false);
                        submitComment();
                      }}
                    >
                      Yes, Post Public Comment
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setConfirmOpen(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default E_Ticket;
