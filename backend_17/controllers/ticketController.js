// controllers/ticketController.js
const { Timesheet, Ticket, Counter } = require("../models");
const cloudinary = require("cloudinary").v2;

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

exports.getFilteredTickets = async (req, res) => {
  try {
    const { filterType, filterValue } = req.query;

    let query = {};

    if (filterType === "status") {
      query.status = filterValue;
    } else if (filterType === "user") {
      query.userId = filterValue;
    } else if (filterType === "employee") {
      query.employeeId = filterValue;
    }

    const tickets = await Timesheet.find(query)
      .populate("userId")
      .populate("employeeId")
      .populate("projectId")
      .sort({ createdAt: -1 });

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket.toObject(),
      createdTime: formatDate(ticket.createdTime),
      updatedTime: formatDate(ticket.updatedTime),
    }));

    res.json(formattedTickets);
  } catch (err) {
    console.error("Filtered ticket fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};

const generateSequenceNumber6Digit = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "ticket" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `#-${counter.seq.toString().padStart(6, "0")}`;
};

exports.createTicket = async (req, res) => {
  try {
    const { mainStatus, userId, employeeId } = req.body;

    // ✅ Validate required field
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // ✅ Parse handoverHistory if coming as a string (FormData case)
    if (req.body.handoverHistory && typeof req.body.handoverHistory === "string") {
      try {
        req.body.handoverHistory = JSON.parse(req.body.handoverHistory);
      } catch (err) {
        return res.status(400).json({ error: "Invalid handoverHistory format" });
      }
    }

    // ✅ Handle file uploads (Cloudinary)
    const attachments = Array.isArray(req.files)
      ? req.files.map((file) => ({
          filename: file.originalname,
          url: file.path,
          public_id: file.filename,
          mimetype: file.mimetype,
        }))
      : [];

    // ✅ Generate unique ticket number
    const ticketNo = await generateSequenceNumber6Digit();

    // ✅ Determine if this is a handover scenario
    const isHandover =
      mainStatus === "handover" &&
      employeeId &&
      userId &&
      employeeId !== userId;

    // ✅ Build final ticket object
    const ticketData = {
      ...req.body,
      attachments,
      ticketNo,
      updatedTime: new Date(),
      createdTime: new Date(),
    };

    // If it's a handover and handoverHistory was not provided by frontend
    if (isHandover && (!req.body.handoverHistory || req.body.handoverHistory.length === 0)) {
      ticketData.handoverHistory = [
        {
          fromEmployeeId: userId,
          toEmployeeId: employeeId,
          reassignedBy: userId,
          reassignedAt: new Date(),
        },
      ];
    }

    // ✅ Create and save ticket
    const newTicket = new Ticket(ticketData);
    const savedTicket = await newTicket.save();

    res.status(201).json(savedTicket);
  } catch (err) {
    console.error("Error in createTicket:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all Tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket.toObject(),
      createdTime: formatDate(ticket.createdTime),
      updatedTime: formatDate(ticket.updatedTime),
    }));

    res.json(formattedTickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single Ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    const formattedTicket = {
      ...ticket.toObject(),
      createdTime: formatDate(ticket.createdTime),
      updatedTime: formatDate(ticket.updatedTime),
    };
    res.json(formattedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// new updating method for tickets
// exports.updateTicketNew = async (req, res) => {
//   try {
//     const ticketId = req.params.id;

//     let newAttachments = [];
//     if (Array.isArray(req.files) && req.files.length > 0) {
//       newAttachments = req.files.map((file) => ({
//         filename: file.originalname,
//         url: file.path,          // Cloudinary public URL
//         public_id: file.filename, // Cloudinary public_id (for delete later)
//         mimetype: file.mimetype,
//       }));
//     }

//     let updateOps = { $set: { ...req.body } };

//     if (req.body.existingAttachments) {
//       try {
//         const existing = JSON.parse(req.body.existingAttachments); 
//         updateOps.$set.attachments = [...existing, ...newAttachments];
//       } catch (e) {
//         console.error("Error parsing existingAttachments:", e);
//       }
//     } else if (newAttachments.length > 0) {
//       updateOps.$push = { attachments: { $each: newAttachments } };
//     }

//     // Handle FormData-based handoverHistory parsing (unchanged)
//     if (req.body['handoverHistory[0].fromEmployeeId']) {
//       const parsedHistory = [];
//       let i = 0;

//       while (req.body[`handoverHistory[${i}].fromEmployeeId`]) {
//         parsedHistory.push({
//           fromEmployeeId: req.body[`handoverHistory[${i}].fromEmployeeId`],
//           toEmployeeId: req.body[`handoverHistory[${i}].toEmployeeId`] || null,
//           toClientId: req.body[`handoverHistory[${i}].toClientId`] || null,
//           reassignedBy: req.body[`handoverHistory[${i}].reassignedBy`],
//           reassignedAt: new Date(req.body[`handoverHistory[${i}].reassignedAt`]),
//         });
//         i++;
//       }

//       req.body.handoverHistory = parsedHistory;

//       Object.keys(req.body).forEach((key) => {
//         if (key.startsWith("handoverHistory[")) delete req.body[key];
//       });
//     }

//     const { mainStatus, employeeId, clientId, reassignedBy } = req.body;

//     const ticket = await Ticket.findById(ticketId);
//     if (!ticket) return res.status(404).json({ error: "Ticket not found" });

//     const isAlreadyClosed = ticket.mainStatus === "closed";
//     if (!isAlreadyClosed) {
//       updateOps.$set.updatedTime = new Date();
//     }

//     let pushHandover = null;

//     if (mainStatus === "inProcess") {
//       // Employee → Employee
//       pushHandover = {
//         fromEmployeeId: ticket.employeeId,
//         toEmployeeId: employeeId,
//         reassignedBy,
//         reassignedAt: new Date(),
//       };
//     } else if (mainStatus === "handover") {
//       // Employee → Client
//       pushHandover = {
//         fromEmployeeId: ticket.employeeId,
//         toClientId: clientId,
//         reassignedBy,
//         reassignedAt: new Date(),
//       };
//     }

//     if (pushHandover) {
//       updateOps.$push = {
//         ...(updateOps.$push || {}),
//         handoverHistory: pushHandover,
//       };
//     }

//     const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updateOps, {
//       new: true,
//       runValidators: true,
//     });

//     const formattedTicket = {
//       ...updatedTicket.toObject(),
//       createdTime: formatDate(updatedTicket.createdTime),
//       updatedTime: formatDate(updatedTicket.updatedTime),
//     };

//     res.json(formattedTicket);
//   } catch (err) {
//     console.error("Ticket update error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };


// Delete Ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    await ticket.deleteOne();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ticket/report?type=ticket | user | employee
// exports.getReportTickets = async (req, res) => {
//   try {
//     const { type = "ticket" } = req.query;
//     console.log("Starting to report ");

//     const tickets = await Ticket.find();

//     if (type === "user") {
//       // Group by userId
//       const users = await User.find();
//       const summary = users.map((user) => {
//         const userTickets = tickets.filter(t => t.userId === user._id.toString());

//         const counts = {
//           open: 0,
//           inProcess: 0,
//           closed: 0,
//           handover: 0,
//           working: 0
//         };

//         userTickets.forEach(t => {
//           if (counts[t.mainStatus]) counts[t.mainStatus]++;
//         });

//         return {
//           userId: user._id,
//           employeeName: user.name,
//           projectName: "-", // Optional
//           status: "-", // Not used for user summary
//           ticketNo: "-", // Not used for user summary
//           reportType: "User Summary",
//           ...counts,
//           total: userTickets.length
//         };
//       });

//       return res.json(summary);
//     }

//     if (type === "employee") {
//       // Group by employeeId
//       const employees = await Employee.find();
//       const summary = employees.map((emp) => {
//         const empTickets = tickets.filter(t => t.employeeId === emp._id.toString());

//         const counts = {
//           open: 0,
//           inProcess: 0,
//           closed: 0,
//           handover: 0,
//           working: 0
//         };

//         empTickets.forEach(t => {
//           if (counts[t.mainStatus]) counts[t.mainStatus]++;
//         });

//         return {
//           employeeId: emp._id,
//           employeeName: emp.name,
//           projectName: "-", // Optional
//           status: "-", // Not used for employee summary
//           ticketNo: "-", // Not used for employee summary
//           reportType: "Employee Summary",
//           ...counts,
//           total: empTickets.length
//         };
//       });

//       return res.json(summary);
//     }

//     // Default: ticket-level report
//     const formatted = tickets.map((t) => {
//       const created = t.createdTime || "";
//       const date = created.includes("T") ? created.split("T")[0] : created;

//       return {
//         date,
//         employeeName: t.employee || "Unassigned",
//         projectName: t.project || "N/A",
//         status: t.mainStatus || "open",
//         ticketNo: `#${t._id.toString().slice(-6)}`,
//         reportType: "Ticket Report"
//       };
//     });

//     res.json(formatted);
//   } catch (err) {
//     console.error("Report fetch error:", err);
//     res.status(500).json({ error: "Failed to generate report." });
//   }
// };

// GET /api/ticket/user/:userId
exports.getTicketsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const tickets = await Ticket.find({ userId }).sort({ createdTime: -1 });

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket.toObject(),
      createdTime: formatDate(ticket.createdTime),
      updatedTime: formatDate(ticket.updatedTime),
    }));

    res.json(formattedTickets);
  } catch (err) {
    console.error("Error fetching tickets by userId:", err.message);
    res.status(500).json({ error: "Server error while fetching tickets" });
  }
};

// tickets for employee
exports.getTicketsByEmployeeId = async (req, res) => {
  try {
    const { empId } = req.params;

    if (!empId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const tickets = await Ticket.find({
      $or: [
        { employeeId: empId },
        { "handoverHistory.fromEmployeeId": empId }
      ],
    }).sort({ createdTime: -1 });

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket.toObject(),
      createdTime: formatDate(ticket.createdTime),
      updatedTime: formatDate(ticket.updatedTime),
    }));

    res.json(formattedTickets);
  } catch (err) {
    console.error("Error fetching tickets by userId:", err.message);
    res.status(500).json({ error: "Server error while fetching tickets" });
  }
};

exports.getReportTickets = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      employeeName,
      projectName,
      mainStatus,
      ticketNo,
      report,
    } = req.body;

    const filter = {};

    if (fromDate && toDate) {
      filter.createdTime = {
        $gte: new Date(fromDate).toISOString(),
        $lte: new Date(toDate).toISOString(),
      };
    }

    if (employeeName) {
      filter.employee = { $regex: employeeName, $options: "i" };
    }

    if (projectName) {
      filter.project = { $regex: projectName, $options: "i" };
    }

    if (mainStatus) {
      filter.mainStatus = new RegExp(mainStatus, "i");
    }

    if (ticketNo) {
      filter.ticketNo = { $regex: ticketNo, $options: "i" };
    }

    // if (report) {
    //   filter.reportType = report;
    // }

    const tickets = await Ticket.find(filter).sort({ createdTime: -1 });

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket.toObject(),
      createdTime: formatDate(ticket.createdTime),
      updatedTime: formatDate(ticket.updatedTime),
    }));

    res.json(formattedTickets);
  } catch (error) {
    console.error("Error fetching report tickets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getTicketsHandedOverByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tickets = await Ticket.find({
      "handoverHistory.reassignedBy": userId,
    });

    const formattedTickets = tickets.map((ticket) => ({
      ...ticket.toObject(),
      createdTime: formatDate(ticket.createdTime),
      updatedTime: formatDate(ticket.updatedTime),
    }));

    res.json(formattedTickets);
  } catch (err) {
    console.error("Error fetching handover tickets:", err.message);
    res.status(500).json({ error: "Failed to fetch handover tickets" });
  }
};

exports.getHandoverTicketCountByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Ticket.countDocuments({
      "handoverHistory.reassignedBy": userId,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Error counting handover tickets" });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const { ticketId, publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Remove file from Cloudinary
    await cloudinary.uploader.destroy(decodedPublicId);

    // Remove from DB
    const updated = await Ticket.findByIdAndUpdate(
      ticketId,
      { $pull: { attachments: { public_id: decodedPublicId } } },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Delete attachment error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTicketNew = async (req, res) => {
  try {
    const ticketId = req.params.id;

    let parsedHandoverHistory = [];
    if (req.body.handoverHistory) {
      try {
        parsedHandoverHistory =
          typeof req.body.handoverHistory === "string"
            ? JSON.parse(req.body.handoverHistory)
            : req.body.handoverHistory;
      } catch (err) {
        console.error("Error parsing handoverHistory:", err);
      }
    }

    // 2️⃣ Build base update
    const updateOps = {
      $set: {
        name: req.body.name,
        subject: req.body.subject,
        projectId: req.body.projectId,
        project: req.body.project,
        departmentId: req.body.departmentId,
        department: req.body.department,
        categoryId: req.body.categoryId,
        category: req.body.category,
        priorityId: req.body.priorityId,
        priority: req.body.priority,
        employeeId: req.body.employeeId,
        employee: req.body.employee,
        issue: req.body.issue,
        mainStatus: req.body.mainStatus,
        targetDate: req.body.targetDate,
        clientId: req.body.clientId,
        updatedTime: new Date(),
      },
    };

    // 3️⃣ Handle attachments
    let newAttachments = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      newAttachments = req.files.map((file) => ({
        filename: file.originalname,
        url: file.path,
        public_id: file.filename,
        mimetype: file.mimetype,
      }));
    }

    if (req.body.existingAttachments) {
      try {
        const existing = JSON.parse(req.body.existingAttachments);
        updateOps.$set.attachments = [...existing, ...newAttachments];
      } catch (err) {
        console.error("Error parsing existingAttachments:", err);
      }
    } else if (newAttachments.length > 0) {
      updateOps.$push = { attachments: { $each: newAttachments } };
    }

    // 4️⃣ Preserve old handoverHistory if none provided
    if (parsedHandoverHistory.length > 0) {
      updateOps.$push = {
        ...(updateOps.$push || {}),
        handoverHistory: { $each: parsedHandoverHistory },
      };
    } else {
      console.log("No new handoverHistory provided, keeping existing data intact.");
    }

    // 5️⃣ Execute update
    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updateOps, {
      new: true,
      runValidators: true,
    });

    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // 6️⃣ Return response
    res.json(updatedTicket);

  } catch (err) {
    console.error("Ticket update error:", err);
    res.status(500).json({ error: err.message });
  }
};
