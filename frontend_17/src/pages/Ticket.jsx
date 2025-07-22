// Final updated Ticket.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { Tooltip, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  Stack,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { FaFilter } from "react-icons/fa";

import {
  getAllTickets,
  createTicket,
  deleteTicket,
  updateTicket,
  getHandoverTicketsByUser,
} from "../api/ticketApi";

import { sendTicketEmail } from "../api/emailApi";

import {
  getAllProjects,
  getAllCategories,
  getAllPriorities,
} from "../api/dropDownApi";

import { getAllUsers, getAllUsersByRole } from "../api/userApi";

import {
  getCommentsByTicket,
  createComment,
  reactToComment,
  deleteComment,
  updateComment,
} from "../api/commentApi";

import { BASE_URL } from "../api/api";
import { getAllStatuses } from "../api/statusApi";

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

const Ticket = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const userIdQuery = query.get("userId");
  const employeeIdQuery = query.get("employeeId");
  const statusQuery = query.get("status");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [tickets, setTickets] = useState([]);
  const [viewTicket, setViewTicket] = useState(null);

  const [projects, setProjects] = useState([]);
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortColumnIndex, setSortColumnIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterValues, setFilterValues] = useState({
    project: "",
    category: "",
    mainStatus: "",
    subStatus: "",
    assignee: "",
    fromDate: "",
    toDate: "",
  });

  const [showMyHandovers, setShowMyHandovers] = useState(false);

  // const cellStyle = {
  //   border: "1px solid #ccc",
  //   fontSize: "0.78rem",
  //   textAlign: "left",
  //   padding: "4px 8px",
  //   lineHeight: "1.3",
  //   whiteSpace: "nowrap",
  //   overflow: "hidden",
  //   textOverflow: "ellipsis",
  // };

  const cellStyle = {
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    textAlign: "center",
    padding: "10px",
    wordBreak: "break-word",
  };

  const exportToExcel = () => {
    const data = filteredTickets.map((ticket) => ({
      "Ticket No": ticket.ticketNo,
      Subject: ticket.subject,
      Project: ticket.project,
      Category: ticket.category,
      Priority: ticket.priority,
      "Main Status": ticket.mainStatus,
      "Sub Status": ticket.subStatus,
      Assignee:
        users.find((u) => u._id === ticket.employeeId)?.name || "Unassigned",
      "Created Time": dayjs(ticket.createdTime).format("YYYY-MM-DD HH:mm"),
      "Updated Time": dayjs(ticket.updatedTime).format("YYYY-MM-DD HH:mm"),
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
    const tableData = filteredTickets.map((ticket, index) => [
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

  // Call inside useEffect when ticket is viewed
  useEffect(() => {
    if (viewTicket) {
      fetchComments(viewTicket._id);
    }
  }, [viewTicket]);

  useEffect(() => {
    fetchAll();
  }, [userIdQuery, employeeIdQuery, statusQuery]);

  const fetchAll = async () => {
    try {
      const [ticketData, proj, stat, cat, prio, users] = await Promise.all([
        getAllTickets(),
        getAllProjects(),
        getAllStatuses(),
        getAllCategories(),
        getAllPriorities(),
        getAllUsers(),
      ]);

      const filtered = ticketData.filter((t) => {
        return (
          (!userIdQuery || t.userId === userIdQuery) &&
          (!employeeIdQuery || t.employeeId === employeeIdQuery) &&
          (!statusQuery || t.mainStatus === statusQuery)
        );
      });

      const emp = users.filter((u) => u.role === "employee");
      setTickets(filtered);
      setProjects(proj);
      setStatus(stat);
      setCategories(cat);
      setPriorities(prio);
      setUsers(users);
      setEmployees(emp);
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

    return (
      (!project ||
        ticket.project?.toLowerCase().includes(project.toLowerCase())) &&
      (!category ||
        ticket.category?.toLowerCase().includes(category.toLowerCase())) &&
      (!mainStatus ||
        ticket.mainStatus?.toLowerCase().includes(mainStatus.toLowerCase())) &&
      (!subStatus ||
        ticket.subStatus?.toLowerCase().includes(subStatus.toLowerCase())) &&
      (!assignee ||
        users
          .find((u) => u._id === ticket.employeeId)
          ?.name?.toLowerCase()
          .includes(assignee.toLowerCase())) &&
      (!priority ||
        ticket.priority?.toLowerCase().includes(priority.toLowerCase())) &&
      (!fromDate || new Date(ticket.createdTime) >= new Date(fromDate)) &&
      (!toDate || new Date(ticket.createdTime) <= new Date(toDate))
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

    // If a full object is passed (like from <MenuItem value={emp}>)
    if (typeof value === "object" && value !== null && value._id) {
      const id = value._id;

      // Updated field mapping with correct label key for each type
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
    const currentUserId = localStorage.getItem("userId");

    try {
      let createdOrUpdated;

      // Update Mode
      if (editMode) {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === "attachments") {
            value.forEach((file) => form.append("attachments", file));
          } else {
            form.append(key, value);
          }
        });

        createdOrUpdated = await updateTicket(editId, form);
        setTickets((prev) =>
          prev.map((t) => (t._id === editId ? createdOrUpdated : t))
        );

        // Add internal comment for reassignment if employeeId changed
        const originalTicket = tickets.find((t) => t._id === editId);
        if (
          originalTicket &&
          originalTicket.employeeId !== formData.employeeId
        ) {
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
      } else {
        // Create Mode
        const isHandover =
          formData.mainStatus === "handover" &&
          formData.employeeId !== currentUserId;

        if (isHandover) {
          // Send JSON directly (no FormData)
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

          createdOrUpdated = await createTicket(jsonPayload); // API should detect JSON
        } else {
          // Use FormData
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
      }

      // Assuming `email` variable is available for the client email
      // This part might need adjustment depending on how you get the client's email
      const clientEmail = "client@example.com"; // Replace with actual client email if available
      sendEmailToAssignedEmployee(editMode, createdOrUpdated);
      // sendEmailToClient(createdOrUpdated, clientEmail); // Uncomment and ensure clientEmail is defined
    } catch (err) {
      console.error("Submit failed:", err);
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
      employeeId: ticket.employeeId, // Keep this for editing assignee
      employee: ticket.employee, // Keep this for editing assignee
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

  const getSubStatusFromMainStatus = (mainSt) => statusMap[mainSt] || []; // Changed from subStatusMap to statusMap

  const filteredTickets = tickets
    .filter((ticket) => {
      const matchUser = !userIdQuery || ticket.userId === userIdQuery;
      const matchEmployee =
        !employeeIdQuery || ticket.employeeId === employeeIdQuery;
      const matchStatus = !statusQuery || ticket.mainStatus === statusQuery;
      return matchUser && matchEmployee && matchStatus;
    })
    .filter(applyFilters)
    .filter((ticket) =>
      Object.values(ticket).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

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

          {/* Main Ticket List */}
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

            {/* Scrollable Table with Sticky Header */}
            <Paper
              sx={{
                height: "calc(100vh - 362px)", // Adjust this if needed
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#f9f9f9",
              }}
            >
              {/* <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}> */}
              <TableContainer
                sx={{ flexGrow: 1, overflowY: "auto", overflowX: "auto" }}
              >
                {/* <Table stickyHeader sx={{ tableLayout: "auto", width: "140%" }}> */}
                <Table
                  stickyHeader
                  sx={{
                    tableLayout: "auto",
                    width: "140%",
                    borderCollapse: "collapse",
                    border: "1px solid #ddd",
                  }}
                >
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
                            border: "1px solid #ddd",
                            textAlign: "center",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            fontSize: "0.95rem",
                            cursor: "pointer",
                            width:
                              idx === 0
                                ? "3px"
                                : idx === 1
                                ? "10px"
                                : idx === 2
                                ? "50px"
                                : idx === 3
                                ? "35px"
                                : idx === 4
                                ? "200px"
                                : idx === 5 || idx === 6
                                ? "25px"
                                : idx === 8
                                ? "15px"
                                : idx === 7 || idx === 9
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
                    {filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center">
                          No tickets available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket, index) => (
                        <TableRow key={ticket._id} hover>
                          <TableCell sx={cellStyle}>{index + 1}</TableCell>
                          <TableCell sx={cellStyle}>
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
                          <TableCell sx={cellStyle}>{ticket.subject}</TableCell>
                          <TableCell sx={cellStyle}>{ticket.project}</TableCell>
                          <TableCell sx={cellStyle}>{ticket.issue}</TableCell>
                          <TableCell sx={cellStyle}>
                            {dayjs(ticket.createdTime).format(
                              "DD‑MMM‑YYYY HH:mm"
                            )}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {dayjs(ticket.updatedTime).format(
                              "DD‑MMM‑YYYY HH:mm"
                            )}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {ticket.employee || "Unassigned"}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            <Chip
                              label={
                                statusMap[ticket.mainStatus]
                                  ? statusMap[ticket.mainStatus].join(", ")
                                  : "—"
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {ticket.mainStatus}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
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
              {/* Assign To Employee Field - Now part of the form for both Add and Edit */}
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
                  // This field is required when creating a ticket, but optional for reassignment logic if you handle "unassign"
                  // required={!editMode} // Uncomment if you want it required only for new tickets
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
                  <Button type="submit" variant="contained">
                    Submit
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
                position: "relative", // ✅ important
                border: "1px solid #ddd",
                backgroundColor: "#fdf8e4",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  position: "fixed",
                  top: 130, // ⬅️ places it above the 2.5cm strip
                  right: 390, // ⬅️ optional: align to right side instead of center
                  zIndex: 1300, // ⬅️ higher than strip and header
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
                    dayjs(viewTicket.createdTime).format("DD-MMM-YYYY HH:mm"),
                  ], // Use createdTime for submitted time
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

              {/* Attachments */}
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

              {/* Comments Section */}
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

                {/* Add Comment */}
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

                {/* Confirmation Dialog */}
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
    </Container>
  );
};
export default Ticket;
