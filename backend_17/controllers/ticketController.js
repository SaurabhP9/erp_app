// controllers/ticketController.js
const { Timesheet, Ticket, Counter } = require("../models");

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

    // const existing = await Ticket.findOne({
    //   userId,
    //   project: req.body.project,
    //   mainStatus: { $ne: "closed" },
    // });

    if (!userId) return res.status(400).json({ error: "userId is required" });

    // if (existing)
    //   return res
    //     .status(409)
    //     .json({ error: "Ticket already exists for this project/user." });

    const attachments = Array.isArray(req.files)
      ? req.files.map((file) => ({
        filename: file.originalname,
        url: file.path,           // Cloudinary URL
        public_id: file.filename, // needed for delete
        mimetype: file.mimetype,
      }))
      : [];

    const ticketNo = await generateSequenceNumber6Digit();

    const isHandover =
      mainStatus === "handover" &&
      employeeId &&
      userId &&
      employeeId !== userId;

    const newTicket = new Ticket({
      ...req.body,
      attachments,
      ticketNo,
      updatedTime: new Date(),
      createdTime: new Date(),
      ...(isHandover && {
        handoverHistory: [
          {
            fromEmployeeId: userId,
            toEmployeeId: employeeId,
            reassignedBy: userId,
            reassignedAt: new Date(),
          },
        ],
      }),
    });

    const saved = await newTicket.save();

    res.status(201).json(saved);
  } catch (err) {
    console.log("Error in createTicket:", err.message);
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

//new  updating method for tickets
exports.updateTicketNew = async (req, res) => {
  try {
    const ticketId = req.params.id;

    // 🔹 Handle new attachments from Cloudinary (multer-storage-cloudinary already uploaded)
    let newAttachments = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      newAttachments = req.files.map((file) => ({
        filename: file.originalname,
        url: file.path,          // Cloudinary public URL
        public_id: file.filename, // Cloudinary public_id (for delete later)
        mimetype: file.mimetype,
      }));
    }

    let updateOps = { $set: { ...req.body } };

    // Merge existing + new attachments
    if (req.body.existingAttachments) {
      try {
        const existing = JSON.parse(req.body.existingAttachments); // expect array of objects
        updateOps.$set.attachments = [...existing, ...newAttachments];
      } catch (e) {
        console.error("Error parsing existingAttachments:", e);
      }
    } else if (newAttachments.length > 0) {
      // if no existingAttachments were passed, just push new ones
      updateOps.$push = { attachments: { $each: newAttachments } };
    }

    // Handle FormData-based handoverHistory parsing (unchanged)
    if (req.body['handoverHistory[0].fromEmployeeId']) {
      const parsedHistory = [];
      let i = 0;

      while (req.body[`handoverHistory[${i}].fromEmployeeId`]) {
        parsedHistory.push({
          fromEmployeeId: req.body[`handoverHistory[${i}].fromEmployeeId`],
          toEmployeeId: req.body[`handoverHistory[${i}].toEmployeeId`],
          reassignedBy: req.body[`handoverHistory[${i}].reassignedBy`],
          reassignedAt: new Date(req.body[`handoverHistory[${i}].reassignedAt`]),
        });
        i++;
      }

      req.body.handoverHistory = parsedHistory;

      Object.keys(req.body).forEach((key) => {
        if (key.startsWith("handoverHistory[")) delete req.body[key];
      });
    }

    const { mainStatus, employeeId, reassignedBy } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const isAlreadyClosed = ticket.mainStatus === "closed";

    if (!isAlreadyClosed) {
      updateOps.$set.updatedTime = new Date();
    }

    const isHandover =
      mainStatus === "handover" &&
      employeeId &&
      employeeId !== ticket.employeeId;

    if (isHandover && !req.body.handoverHistory) {
      delete updateOps.$set.handoverHistory;

      updateOps.$push = {
        ...(updateOps.$push || {}),
        handoverHistory: {
          fromEmployeeId: ticket.employeeId,
          toEmployeeId: employeeId,
          reassignedBy,
          reassignedAt: new Date(),
        },
      };
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, updateOps, {
      new: true,
      runValidators: true,
    });

    const formattedTicket = {
      ...updatedTicket.toObject(),
      createdTime: formatDate(updatedTicket.createdTime),
      updatedTime: formatDate(updatedTicket.updatedTime),
    };

    res.json(formattedTicket);
  } catch (err) {
    console.error("Ticket update error:", err);
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

    console.log("Deleting.", ticketId, "Public Id is", decodedPublicId);

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