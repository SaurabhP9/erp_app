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
  CircularProgress,
} from "@mui/material";

import { sendTicketEmail } from "../../api/emailApi";

import {
  createTicket,
  getAllTickets,
  updateTicket,
  deleteTicket,
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
import { getAllUsersByRole } from "../../api/userApi";
import { useLocation } from "react-router-dom";

import { BASE_URL } from "../../api/api";

/* —————————————————————————————————————————————————— */
/* INITIAL STATE                                                                  */
/* —————————————————————————————————————————————————— */
const username = localStorage.getItem("username") || "";

const initialFormData = {
  name: "", // ticket title
  subject: "", // ticket creator / short subject
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
  mainStatus: "open",
  attachments: [],
};

/* —————————————————————————————————————————————————— */
/* COMPONENT                                                                       */
/* —————————————————————————————————————————————————— */
const Client_Ticket = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [tickets, setTickets] = useState([]);
  const [viewTicket, setViewTicket] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments when a ticket is viewed
  useEffect(() => {
    if (viewTicket?._id) {
      fetchComments(viewTicket._id);
    }
  }, [viewTicket]);

  // Initial load: tickets + dropdowns + users
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ticketData, dept, cat, prio, emp, proj] = await Promise.all([
          getAllTickets(),
          getAllDepartments(),
          getAllCategories(),
          getAllPriorities(),
          getAllUsersByRole("employee"),
          getAllProjects(),
        ]);

        const userId = localStorage.getItem("userId");

        // Filter tickets created by current user (safe guard if ticketData undefined)
        const createdTickets = Array.isArray(ticketData)
          ? ticketData.filter((t) => t.userId === userId)
          : [];

        setTickets(createdTickets);

        // Filter to only "functional" departments
        const functionalDepartments = Array.isArray(dept)
          ? dept.filter((d) =>
            (d.department || "").toLowerCase().includes("functional")
          )
          : [];

        setDepartments(functionalDepartments.length ? functionalDepartments : (Array.isArray(dept) ? dept : []));

        // Auto-select department if exactly one functional exists (only when not editing)
        if (!editMode && functionalDepartments.length === 1) {
          const oneDept = functionalDepartments[0];
          setFormData((prev) => ({
            ...prev,
            departmentId: oneDept._id || "",
            department: oneDept.department || "",
          }));
        }

        setCategories(Array.isArray(cat) ? cat : []);
        setPriorities(Array.isArray(prio) ? prio : []);

        // Filter functional (non-technical) employees only and those belonging to project (based on username)
        const allEmployees = Array.isArray(emp) ? emp : [];
        const isFunctional = (e) => {
          const deptName = (e.department || "").toLowerCase();
          return deptName.includes("functional");
        };

        const filteredFunctional = allEmployees.filter((e) => {
          const hasProject = Array.isArray(e.projects)
            ? e.projects.some(
              (p) =>
                (p || "").toLowerCase().trim() ===
                (username || "").toLowerCase().trim()
            )
            : false;
          const functional = isFunctional(e);
          return hasProject && functional;
        });

        setEmployees(
          filteredFunctional.length > 0 ? filteredFunctional : allEmployees
        );

        // Auto-select employee if exactly one functional exists (only when not editing)
        if (!editMode && filteredFunctional.length === 1) {
          const oneEmp = filteredFunctional[0];
          setFormData((prev) => ({
            ...prev,
            employeeId: oneEmp._id || "",
            employee: oneEmp.name || "",
          }));
        }

        // Projects filtered by username (safe guards)
        const allProjects = Array.isArray(proj) ? proj : [];
        const finalProjects = allProjects.filter((p) =>
          (username || "").includes(p.project || "")
        );
        setProjects(finalProjects.length ? finalProjects : allProjects);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchAll();
    // intentionally not adding formData/editMode etc to deps to avoid refetch loops
    // if you want dynamic behavior when editMode changes, add it here.
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "attachments") {
      const newFiles = Array.from(files || []);
      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newFiles],
      }));
      return;
    }

    if (name === "categoryId") {
      const selected = categories.find((c) => c._id === value);
      setFormData((prev) => ({
        ...prev,
        categoryId: selected?._id || "",
        category: selected?.category || "",
      }));
      return;
    }

    if (name === "departmentId") {
      const selected = departments.find((d) => d._id === value);
      setFormData((prev) => ({
        ...prev,
        departmentId: selected?._id || "",
        department: selected?.department || "",
      }));
      return;
    }

    if (name === "priorityId") {
      const selected = priorities.find((p) => p._id === value);
      setFormData((prev) => ({
        ...prev,
        priorityId: selected?._id || "",
        priority: selected?.priority || "",
      }));
      return;
    }

    if (name === "employeeId") {
      const selected = employees.find((e) => e._id === value);
      setFormData((prev) => ({
        ...prev,
        employeeId: selected?._id || "",
        employee: selected?.name || "",
      }));
      return;
    }

    // mainStatus or other direct fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const form = new FormData();

      // Append scalar values as strings
      const scalarKeys = [
        "name",
        "subject",
        "projectId",
        "project",
        "departmentId",
        "department",
        "categoryId",
        "category",
        "priorityId",
        "priority",
        "employeeId",
        "employee",
        "issue",
        "mainStatus",
      ];

      scalarKeys.forEach((k) => {
        const v = formData[k];
        if (v !== undefined && v !== null) form.append(k, String(v));
      });

      // attachments (if any)
      if (Array.isArray(formData.attachments) && formData.attachments.length) {
        formData.attachments.forEach((file) => form.append("attachments", file));
      }

      // userId only when creating new ticket
      if (!editMode) {
        const uid = localStorage.getItem("userId");
        if (uid) form.append("userId", uid);
      }

      let createdOrUpdated;
      if (editMode && editId) {
        createdOrUpdated = await updateTicket(editId, form);
        setTickets((prev) =>
          prev.map((t) => (t._id === editId ? createdOrUpdated : t))
        );
      } else {
        createdOrUpdated = await createTicket(form);
        setTickets((prev) => [...prev, createdOrUpdated]);
      }

      // reset form & close
      setFormData(initialFormData);
      setShowForm(false);
      setEditMode(false);
      setEditId(null);

      // optionally send emails:
      // if (createdOrUpdated?.userEmail) await sendEmailToClient(createdOrUpdated, createdOrUpdated.userEmail);

    } catch (err) {
      console.error("Submit failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  async function sendEmailToClient(createdOrUpdated, email) {
    const ticketNumber = createdOrUpdated.ticketNo || createdOrUpdated._id;
    const subject = `Ticket #${ticketNumber} Acknowledgement – ${createdOrUpdated.subject}`;

    const ticketUrl = `${window.location.origin}/ticket/view/${createdOrUpdated._id}`;

    const htmlContent = `
    <div style="background-color: #fdf8e4; padding: 40px 0;">
      <div style="max-width: 500px; margin: auto; background-color: #fff; padding: 30px; border: 1px solid #ddd; font-family: Arial, sans-serif; color: #333;">
        <p style="font-size: 16px;">Dear ${username},</p>

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
      name: ticket.name || "",
      subject: ticket.subject || "",
      projectId: ticket.projectId || "",
      project: ticket.project || (projects[0]?.project || ""),
      departmentId: ticket.departmentId || "",
      department: ticket.department || "",
      categoryId: ticket.categoryId || "",
      category: ticket.category || "",
      priorityId: ticket.priorityId || "",
      priority: ticket.priority || "",
      issue: ticket.issue || "",
      employeeId: ticket.employeeId || "",
      employee: ticket.employee || "",
      attachments: [], // attachments re-uploaded if needed
      mainStatus: ticket.mainStatus || "open",
    });
    setEditMode(true);
    setEditId(ticket._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleView = (ticket) => {
    // normalize viewTicket dates for display
    setViewTicket({
      ...ticket,
      submittedTime:
        ticket.createdTime && dayjs(ticket.createdTime).isValid()
          ? dayjs(ticket.createdTime).format("DD-MMM-YYYY")
          : ticket.submittedTime || "",
      lastUpdated:
        ticket.updatedTime && dayjs(ticket.updatedTime).isValid()
          ? dayjs(ticket.updatedTime).format("DD-MMM-YYYY")
          : ticket.lastUpdated || "",
    });
  };

  const submitComment = async () => {
    if (!viewTicket?._id) return;
    try {
      const res = await createComment({
        ticketId: viewTicket._id,
        userId: localStorage.getItem("userId"),
        comment: newComment,
        userName: username,
      });
      setComments((prev) => [...prev, res]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleReaction = async (commentId, type) => {
    try {
      const updated = await reactToComment(commentId, type);
      setComments((prev) => prev.map((c) => (c._id === commentId ? updated : c)));
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  const fetchComments = async (ticketId) => {
    try {
      const data = await getCommentsByTicket(ticketId);
      setComments(Array.isArray(data) ? data : []);
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
      setComments((prev) => prev.map((c) => (c._id === commentId ? updated : c)));
      setEditingCommentId(null);
      setEditedCommentText("");
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const name = (ticket.name || "").toLowerCase();
    const subject = (ticket.subject || "").toLowerCase();
    const project = (ticket.project || "").toLowerCase();
    const issue = (ticket.issue || "").toLowerCase();
    const search = (searchTerm || "").toLowerCase();

    return (
      name.includes(search) ||
      subject.includes(search) ||
      project.includes(search) ||
      issue.includes(search)
    );
  });

  const sortedTickets = [...filteredTickets].sort(
    (a, b) =>
      (dayjs(b.createdTime).valueOf() || 0) - (dayjs(a.createdTime).valueOf() || 0)
  );

  /* —————————————————————————————————————————————————— */
  /* RENDER                         */
  /* —————————————————————————————————————————————————— */
  return (
    <Container maxWidth="lg" sx={{ mt: 0.1, mb: 0.1 }}>
      {!showForm && !viewTicket && (
        <>
          <Typography variant="h6" fontWeight="bold">
            List of Ticket
          </Typography>
          <Typography color="gray" mb={2}>
            Home → List of Ticket
          </Typography>
          <Box display="flex" gap={2} mb={1}>
            <Button
              variant="contained"
              onClick={() => {
                setFormData((prev) => ({
                  ...initialFormData,
                  project: projects.length > 0 ? projects[0].project : "",
                }));

                setEditMode(false);
                setEditId(null);
                setViewTicket(null);
                setShowForm(true);
              }}
            >
              Add Ticket
            </Button>
          </Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <TextField
              label="Search Tickets"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>

          <Paper
            sx={{
              height: "calc(100vh - 470px)",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f9f9f9",
              overflow: "hidden",
            }}
          >
            <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
              <Table stickyHeader size="small">
                <TableHead sx={{ backgroundColor: "grey.700" }}>
                  <TableRow>
                    {[
                      "#",
                      "Ticket Id",
                      "Ticket",
                      "Assigned By",
                      "Project",
                      "Submitted Time",
                      "Last Updated",
                      "Status",
                      "Action",
                    ].map((label, index) => (
                      <TableCell
                        key={index}
                        sx={{
                          border: 1,
                          color: "#fff",
                          fontWeight: "bold",
                          textAlign: "center",
                          fontSize: "1rem",
                          backgroundColor: "grey",
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
                      <TableCell colSpan={9} align="center" sx={{ border: 1 }}>
                        No tickets available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedTickets.map((ticket, index) => (
                      <TableRow
                        key={ticket._id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <TableCell sx={{ border: 1 }}>{index + 1}</TableCell>
                        <TableCell
                          style={{
                            border: 1,
                            borderBottom: "1px solid rgba(224, 224, 224, 1)",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleView(ticket)}
                        >
                          {ticket.ticketNo || ticket._id}
                        </TableCell>
                        <TableCell sx={{ border: 1, textAlign: "center" }}>
                          {ticket.name}
                        </TableCell>
                        <TableCell sx={{ border: 1, textAlign: "center" }}>
                          {ticket.subject}
                        </TableCell>
                        <TableCell sx={{ border: 1, textAlign: "center" }}>
                          {ticket.project}
                        </TableCell>
                        <TableCell sx={{ border: 1, textAlign: "center" }}>
                          {ticket.createdTime
                            ? dayjs(ticket.createdTime).format("DD-MMM-YYYY")
                            : ""}
                        </TableCell>
                        <TableCell sx={{ border: 1, textAlign: "center" }}>
                          {ticket.updatedTime
                            ? dayjs(ticket.updatedTime).format("DD-MMM-YYYY")
                            : ""}
                        </TableCell>
                        <TableCell sx={{ border: 1, textAlign: "center" }}>
                          {ticket.mainStatus}
                        </TableCell>
                        <TableCell sx={{ border: 1, textAlign: "center" }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleEdit(ticket)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {showForm && (
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            height: "calc(100vh - 220px)",
            px: 3,
          }}
        >
          <Box sx={{ maxWidth: 900, mx: "auto", px: 2 }}>
            <Paper
              sx={{
                p: 3,
                border: "1px solid #ddd",
                borderRadius: 2,
                backgroundColor: "#f5f6fa",
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
                  <Grid>
                    <TextField
                      fullWidth
                      required
                      label="Ticket Title"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={false}
                    />
                  </Grid>

                  <Grid>
                    <TextField
                      fullWidth
                      required
                      label="Ticket Creator / Short Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={false}
                    />
                  </Grid>

                  <Grid>
                    <TextField
                      fullWidth
                      label="Project"
                      name="project"
                      value={
                        formData.project ||
                        (projects.length > 0 ? projects[0].project : "")
                      }
                      disabled
                    />
                  </Grid>

                  <Grid>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Category"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {categories.map((cat) => (
                        <MenuItem key={cat._id} value={cat._id}>
                          {cat.category}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={
                        formData.department || departments[0]?.department || ""
                      }
                      disabled
                    />
                  </Grid>

                  <Grid>
                    <TextField
                      select
                      fullWidth
                      required
                      label="Priority"
                      name="priorityId"
                      value={formData.priorityId}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {priorities.map((pri) => (
                        <MenuItem key={pri._id} value={pri._id}>
                          {pri.priority}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid>
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
                      <MenuItem value="closed">Closed</MenuItem>
                      <MenuItem value="handover">Reassign</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid>
                    <TextField
                      label="Employee ID"
                      name="employeeId"
                      value={formData.employee}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={editMode} // Keep previous disabling logic
                    />
                  </Grid>
                  <Grid>
                    <TextField
                      fullWidth
                      required
                      multiline
                      rows={4}
                      label="Issue"
                      name="issue"
                      value={formData.issue}
                      onChange={handleChange}
                      disabled={editMode}
                    />
                  </Grid>

                  <Grid>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Attachments
                    </Typography>
                    <input
                      type="file"
                      name="attachments"
                      multiple
                      onChange={handleChange}
                    />
                    {Array.isArray(formData.attachments) &&
                      formData.attachments.length > 0 && (
                        <List>
                          {formData.attachments.map((file, i) => (
                            <ListItem key={i}>{file.name}</ListItem>
                          ))}
                        </List>
                      )}
                  </Grid>

                  <Grid>
                    <Box mt={2} display="flex" gap={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={
                          isSubmitting ? <CircularProgress size={20} /> : null
                        }
                      >
                        {isSubmitting ? (editMode ? "Updating..." : "Creating...") : editMode ? "Update" : "Submit"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowForm(false);
                          setEditMode(false);
                          setEditId(null);
                        }}
                      >
                        Back
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Box>
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
                border: "3px solid #ddd",
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h5" fontWeight="bold">
                  Ticket - {viewTicket.ticketNo || viewTicket._id} - {viewTicket.subject}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: "0.75rem", mb: 2 }}>
                Added by {viewTicket.createdBy?.name || "User"} • Updated {viewTicket.lastUpdated || viewTicket.updatedTime || ""}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                <Box sx={{ width: "50%", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    <strong>Status:</strong> {viewTicket.mainStatus}
                  </Typography>
                </Box>
                <Box sx={{ width: "50%", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    <strong>Priority:</strong> {viewTicket.priority}
                  </Typography>
                </Box>

                <Box sx={{ width: "50%", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    <strong>Assignee:</strong> {viewTicket.employee || "Not Assigned"}
                  </Typography>
                </Box>
                <Box sx={{ width: "50%", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    <strong>Project:</strong> {viewTicket.project}
                  </Typography>
                </Box>

                <Box sx={{ width: "50%", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    <strong>Category:</strong> {viewTicket.category}
                  </Typography>
                </Box>
                <Box sx={{ width: "50%", mb: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem" }}>
                    <strong>Submitted:</strong> {viewTicket.submittedTime || viewTicket.createdTime}
                  </Typography>
                </Box>

                <Box sx={{ width: "100%", mt: 1 }}>
                  <Typography sx={{ fontSize: "0.9rem", mb: 0.5 }}>
                    <strong>Description:</strong>
                  </Typography>
                  <Typography sx={{ fontSize: "0.9rem", whiteSpace: "pre-line" }} color="text.secondary">
                    {viewTicket.issue}
                  </Typography>
                </Box>
              </Box>

              <Box mt={4}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  📎 Attachments
                </Typography>
                {Array.isArray(viewTicket.attachments) && viewTicket.attachments.length > 0 ? (
                  viewTicket.attachments.map((file, i) => (
                    <Box key={i} sx={{ mb: 0.5 }}>
                      <a href={`${BASE_URL}/${file.path}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "#1976d2" }}>
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
                    <Typography fontWeight="bold">{c.userId?.name || c.userName}</Typography>
                    <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#888" }}>
                      {new Date(c.updatedAt || c.createdAt).toLocaleString()}
                    </Typography>

                    {editingCommentId === c._id ? (
                      <Box>
                        <TextField fullWidth multiline rows={2} value={editedCommentText} onChange={(e) => setEditedCommentText(e.target.value)} sx={{ mt: 1 }} />
                        <Button size="small" onClick={() => handleUpdateComment(c._id)} sx={{ mt: 1, mr: 1 }}>
                          Save
                        </Button>
                        <Button size="small" onClick={() => setEditingCommentId(null)} sx={{ mt: 1 }}>
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Typography sx={{ mt: 1, whiteSpace: "pre-line" }}>{c.comment}</Typography>
                    )}
                  </Paper>
                ))}

                <TextField fullWidth multiline rows={3} placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} sx={{ mt: 2 }} />
                <Button variant="contained" sx={{ mt: 1 }} onClick={submitComment}>
                  Post Comment
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default Client_Ticket;