// controllers/ticketController.js
const { Timesheet, Ticket, Counter } = require("../models");
const cloudinary = require("cloudinary").v2;


const allowedFields = [
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
  "clientId",
  "issue",
  "mainStatus",
  "targetDate",
  "taskCategory",
];

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
      taskCategory: req.body.taskCategory,
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

const formatDate = (input) => {
  const date = new Date(input);
  if (isNaN(date.getTime())) return null; // Invalid date
  return date.toISOString(); // Or custom format
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
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // include full end day
    
      filter.createdTime = {
        $gte: from,
        $lte: to,
      };
    }
    

    if (employeeName) {
      filter.employee = { $regex: employeeName, $options: "i" };
    }

    if (projectName) {
      filter.project = { $regex: projectName, $options: "i" };
    }

    if (mainStatus) {
      const cleanedStatus =
        mainStatus === "In Process" ? "InProcess" : mainStatus;
      filter.mainStatus = new RegExp(cleanedStatus?.toLowerCase(), "i");
    }

    if (ticketNo) {
      filter.ticketNo = { $regex: ticketNo, $options: "i" };
    }

    console.log("Filter:", filter);

    const tickets = await Ticket.find(filter).sort({ createdTime: -1 });
    console.log("TICket s", tickets);
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

    const cleanBody = {};
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) {
        cleanBody[key] = req.body[key];
      }
    });
    
    const updateOps = {
      $set: {
        ...cleanBody,
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
