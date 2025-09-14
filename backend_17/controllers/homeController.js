const { User, Employee, Ticket } = require("../models");
const dayjs = require("dayjs");
const user = require("../models/user");

exports.getHomeSummary = async (req, res) => {
  try {
    const ticketSummaryData = await Ticket.aggregate([
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$mainStatus" } } },
          count: { $sum: 1 },
        },
      },
    ]);

    const ticketSummary = {
      total: 0,
      open: 0,
      closed: 0,
      handover: 0,
      inProcess: 0,
    };

    ticketSummaryData.forEach((t) => {
      const key = t._id?.toLowerCase();
      if (key === "open") ticketSummary.open = t.count;
      if (key === "closed") ticketSummary.closed = t.count;
      if (key === "handover") ticketSummary.handover = t.count;
      if (key === "inprocess") ticketSummary.inProcess = t.count;
      ticketSummary.total += t.count;
    });

    const employees = await User.find({ role: "employee" }).lean();

    const employeeSummary = await Promise.all(
      employees.map(async (emp) => {
        const tickets = await Ticket.find({
          $or: [{ employeeId: emp._id }, { userId: emp._id }],
        }).lean();

        const todayStr = dayjs().format("YYYY-MM-DD");
        const stats = {
          open: 0,
          todayOpen: 0,
          inProcess: 0,
          closed: 0,
          handover: 0,
        };

        const uniqueTicketIds = new Set();
        tickets.forEach((t) => {
          const ticketId = t._id.toString();
          if (uniqueTicketIds.has(ticketId)) return;
          uniqueTicketIds.add(ticketId);

          const status = (t.mainStatus || "").toLowerCase();

          if (status === "open") {
            stats.open++;
            const createdDate = t.createdTime
              ? dayjs(t.createdTime).format("YYYY-MM-DD")
              : null;
            if (createdDate === todayStr) stats.todayOpen++;
          } else if (status === "inprocess") {
            stats.inProcess++;
          } else if (status === "closed") {
            stats.closed++;
          }

          if (
            Array.isArray(t.handoverHistory) &&
            t.handoverHistory.some(
              (h) => h.fromEmployeeId?.toString() === emp._id.toString()
            )
          ) {
            stats.handover++;
          }
        });

        return {
          employeeId: emp._id,
          name: emp.name,
          email: emp.email,
          ticketStatus: {
            open: stats.open + stats.todayOpen,
            inProcess: stats.inProcess,
            closed: stats.closed,
            handover: stats.handover,
          },
        };
      })
    );


    // 1️⃣ Aggregate tickets and normalize status inside aggregation
const userSummary = await Ticket.aggregate([
  {
    $match: { userId: { $ne: null } }, // ignore tickets without userId
  },
  {
    $project: {
      userId: 1,
      // Normalize status to consistent keys
      status: {
        $switch: {
          branches: [
            { case: { $eq: [{ $toLower: "$mainStatus" }, "open"] }, then: "open" },
            { case: { $eq: [{ $toLower: "$mainStatus" }, "closed"] }, then: "closed" },
            { case: { $eq: [{ $toLower: "$mainStatus" }, "handover"] }, then: "handover" },
            { case: { $in: [{ $toLower: "$mainStatus" }, ["inprocess", "in_process", "in process"]] }, then: "inProcess" },
          ],
          default: null, // ignore unknown statuses
        },
      },
    },
  },
  {
    $match: { status: { $ne: null } }, // only include known statuses
  },
  {
    $group: {
      _id: { userId: "$userId", status: "$status" },
      count: { $sum: 1 },
    },
  },
]);

// 2️⃣ Fetch users
const users = await User.find({ role: "client" }).lean();

// 3️⃣ Prepare user map
const userMap = users.reduce((acc, user) => {
  acc[user._id.toString()] = {
    userId: user._id,
    name: user.name,
    email: user.email,
    ticketStatus: { open: 0, closed: 0, handover: 0, inProcess: 0 },
  };
  return acc;
}, {});

// 4️⃣ Map ticket counts to users
userSummary.forEach((record) => {
  const uId = record._id.userId?.toString();
  const statusKey = record._id.status;

  if (uId && statusKey && userMap[uId]) {
    userMap[uId].ticketStatus[statusKey] += record.count;
  }
});

// 5️⃣ Convert userMap to array if needed
const result = Object.values(userMap);

console.log(result);


    res.json({
      ticketSummary,
      employeeSummary,
      userSummary: Object.values(userMap),
    });
  } catch (err) {
    console.error("Home summary error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketSummaryByRole = async (req, res) => {
  try {
    const { role } = req.params;

    const allTickets = await Ticket.find();

    // Fetch users by role directly from MongoDB
    const users = await User.find({ role });

    const userSummary = await Promise.all(
      users.map(async (user) => {
        const userTickets = allTickets.filter(
          (t) => t.userId?.toString() === user._id.toString()
        );

        const handoverCount = allTickets.filter((t) =>
          t.handoverHistory?.some(
            (h) => h.fromEmployeeId?.toString() === user._id.toString()
          )
        ).length;

        const ticketStatus = {
          open: userTickets.filter((t) => t.mainStatus == "open").length,
          closed: userTickets.filter((t) => t.mainStatus == "closed").length,
          handover: handoverCount,
          inProgress: userTickets.filter((t) => t.mainStatus == "inProcess").length,
        };

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          ticketStatus,
        };
      })
    );

    res.json({ role, userSummary });
  } catch (err) {
    console.error("getTicketSummaryByRole error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getEmployeeTicketSummary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const todayStr = dayjs().format("YYYY-MM-DD");

    // Fetch only relevant tickets directly from DB
    const tickets = await Ticket.find({
      $or: [
        { employeeId },
        { userId: employeeId },
      ],
    }).lean();

    // Initialize counters
    const stats = {
      total: 0,
      today: 0,
      assigned: 0,
      open: 0,
      inProcess: 0,
      closed: 0,
      handover: 0,
    };

    const normalizeStatus = (s) => String(s || "").toLowerCase();

    // Use a Set to prevent double counting if employee created and was assigned to the same ticket
    const uniqueTicketIds = new Set();

    tickets.forEach((t) => {
      const ticketId = t._id.toString();
      if (uniqueTicketIds.has(ticketId)) return;
      uniqueTicketIds.add(ticketId);

      stats.total++;

      /** ---------- Today's Tickets ---------- */
      const createdDate = t.createdTime
        ? dayjs(t.createdTime).format("YYYY-MM-DD")
        : null;
      if (createdDate === todayStr) stats.today++;

      /** ---------- Assigned Tickets ---------- */
      if (t.employeeId?.toString() === employeeId && t.userId?.toString() !== employeeId) {
        stats.assigned++;
      }

      /** ---------- Status Counts ---------- */
      const status = normalizeStatus(t.mainStatus);
      if (status === "open") stats.open++;
      else if (status === "inprocess") stats.inProcess++;
      else if (status === "closed") stats.closed++;

      /** ---------- Handover Count ---------- */
      if (Array.isArray(t.handoverHistory) && t.handoverHistory.some(
        (h) => h.fromEmployeeId?.toString() === employeeId)) {
        stats.handover++;
      }
    });

    // Prepare response in required format
    const ticketSummary = [
      { label: "Total Ticket", total: stats.total },
      { label: "Today's Ticket", total: stats.today },
      { label: "Open Ticket", total: stats.open },
      { label: "In Process Ticket", total: stats.inProcess },
      { label: "Closed Ticket", total: stats.closed },
      { label: "Handover to Customer", total: stats.handover },
      { label: "Assigned Ticket", total: stats.assigned },
    ];

    res.json({ ticketSummary });
  } catch (err) {
    console.error("Error fetching ticket summary:", err);
    res.status(500).json({ error: "Failed to fetch ticket summary" });
  }
};
