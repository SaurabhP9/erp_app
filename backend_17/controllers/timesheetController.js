const Ticket = require("../models/ticket");
const User = require("../models/user");
const Timesheet = require("../models/timesheet");

exports.getTimesheetFromTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({});

    const userIds = [
      ...new Set([
        ...tickets.map((t) => t.employeeId),
        ...tickets.map((t) => t.userId),
      ]),
    ];

    const users = await User.find({ _id: { $in: userIds } });
    const userMap = {};
    users.forEach((u) => {
      userMap[u._id] = u.name;
    });

    const timesheetData = tickets.map((ticket) => {
      const employeeName =
        ticket.employee || userMap[ticket.employeeId] || "Unknown";
      const createdTime = ticket.createdTime
        ? new Date(ticket.createdTime)
        : null;

      let timeRange = "-";
      let totalWorkFormatted = "-";
      let dateFormatted = "-";

      if (createdTime instanceof Date && !isNaN(createdTime)) {
        let endTime;

        if (ticket.mainStatus?.toLowerCase() === "closed") {
          // Use updatedTime only if it's a valid date string
          endTime = new Date(ticket.updatedTime);
          if (!(endTime instanceof Date) || isNaN(endTime)) {
            console.warn("Invalid updatedTime, falling back to current time");
            endTime = new Date();
          }
        } else {
          endTime = new Date();
        }

        const totalMinutes = Math.floor((endTime - createdTime) / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        totalWorkFormatted = `${hours} Hrs ${minutes} Min`;

        const formatTime = (date) =>
          new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

        timeRange = `${formatTime(createdTime)} To ${formatTime(endTime)}`;
        dateFormatted = createdTime.toISOString().split("T")[0];
      }

      return {
        employee: employeeName,
        ticketId: ticket.ticketNo || ticket._id?.toString().slice(-6),
        subject: ticket.subject || "-",
        task: ticket.issue || "-",
        date: dateFormatted,
        time: timeRange,
        status: ticket.mainStatus,
        totalWork: totalWorkFormatted,
      };
    });

    return res.status(200).json(timesheetData);
  } catch (err) {
    console.error("Timesheet generation failed:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTimesheetForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tickets = await Ticket.find({
      userId: userId,
    }).populate("employee");

    console.log("ticket for user ", tickets);

    const timesheetData = tickets.map((ticket) => {
      const employeeName = ticket.employee || "Unknown";
      const createdTime = ticket.createdTime
        ? new Date(ticket.createdTime)
        : null;

      let timeRange = "-";
      let totalWorkFormatted = "-";
      let dateFormatted = "-";

      if (createdTime instanceof Date && !isNaN(createdTime)) {
        const endTime =
          ticket.status?.toLowerCase() === "closed"
            ? new Date(ticket.updatedTime || Date.now())
            : new Date();

        const totalMinutes = Math.floor((endTime - createdTime) / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        totalWorkFormatted = `${hours} Hrs ${minutes} Min`;

        const formatTime = (date) =>
          date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

        timeRange = `${formatTime(createdTime)} To ${formatTime(endTime)}`;
        dateFormatted = createdTime.toISOString().split("T")[0];
      }

      return {
        employee: employeeName,
        ticket: `#${ticket._id.toString().slice(-6)}`,
        subject: ticket.subject || "-",
        task: ticket.issue || "-",
        date: dateFormatted,
        time: timeRange,
        totalWork: totalWorkFormatted,
      };
    });

    return res.status(200).json(timesheetData);
  } catch (err) {
    console.error("User Timesheet fetch failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch user timesheet" });
  }
};

exports.getTimesheetForEmployee = async (req, res) => {
  try {
    const { empId } = req.params;

    const tickets = await Ticket.find({
      employeeId: empId,
    }).populate("employee");

    console.log("ticket for Empl ", tickets);

    const timesheetData = tickets.map((ticket) => {
      const employeeName = ticket.employee || "Unknown";
      const createdTime = ticket.createdTime
        ? new Date(ticket.createdTime)
        : null;

      let timeRange = "-";
      let totalWorkFormatted = "-";
      let dateFormatted = "-";

      if (createdTime instanceof Date && !isNaN(createdTime)) {
        let endTime;

        if (ticket.mainStatus?.toLowerCase() === "closed") {
          // Use updatedTime only if it's a valid date string
          endTime = new Date(ticket.updatedTime);
          if (!(endTime instanceof Date) || isNaN(endTime)) {
            console.warn("Invalid updatedTime, falling back to current time");
            endTime = new Date();
          }
          console.log(ticket.createdTime, "ticket", ticket.employee, endTime);
        } else {
          endTime = new Date();
        }

        const totalMinutes = Math.floor((endTime - createdTime) / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        totalWorkFormatted = `${hours} Hrs ${minutes} Min`;

        const formatTime = (date) =>
          new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

        timeRange = `${formatTime(createdTime)} To ${formatTime(endTime)}`;
        dateFormatted = createdTime.toISOString().split("T")[0];
      }

      return {
        employee: employeeName,
        ticket: `#${ticket._id.toString().slice(-6)}`,
        subject: ticket.subject || "-",
        task: ticket.issue || "-",
        date: dateFormatted,
        time: timeRange,
        totalWork: totalWorkFormatted,
      };
    });

    return res.status(200).json(timesheetData);
  } catch (err) {
    console.error("User Timesheet fetch failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch user timesheet" });
  }
};

// Create or add timesheet
exports.addTimesheet = async (req, res) => {
  try {
    const { employeeId, ticket, date } = req.body;

    // Prevent duplicate entry for same employee+ticket+date
    const existing = await Timesheet.findOne({ employeeId, ticket, date });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Timesheet already exists for this ticket and date" });
    }

    const newEntry = new Timesheet(req.body);
    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving timesheet:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get all timesheets for one employee
exports.getTimesheetsByEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const timesheets = await Timesheet.find({ employeeId: id }).sort({
      createdAt: -1,
    });
    res.json(timesheets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timesheets", error: err });
  }
};

exports.fetchTimesheetForAllEmployees = async (req, res) => {
  try {
    const timesheets = await Timesheet.find({}).sort({ createdAt: -1 });
    res.json(timesheets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timesheets", error: err });
  }
};
