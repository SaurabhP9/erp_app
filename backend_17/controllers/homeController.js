const { User, Employee, Ticket } = require("../models");

exports.getHomeSummary = async (req, res) => {
  try {
    const allTickets = await Ticket.find();

    const ticketSummary = {
      total: allTickets.length,
      open: allTickets.filter((t) => t.mainStatus === "open").length,
      closed: allTickets.filter((t) => t.mainStatus === "closed").length,
      handover: allTickets.filter((t) => t.mainStatus === "handover").length,
      inProgress: allTickets.filter((t) => t.mainStatus === "inProcess").length,
    };

    const employees = await User.find({ role: "employee" }).lean();
    const employeeSummary = await Promise.all(
      employees.map(async (emp) => {
        const empTickets = allTickets.filter(
          (t) => t.employeeId?.toString() === emp._id.toString()
        );

        const ticketStatus = {
          open: empTickets.filter((t) => t.mainStatus === "open").length,
          closed: empTickets.filter((t) => t.mainStatus === "closed").length,
          handover: empTickets.filter((t) => t.mainStatus === "handover")
            .length,
          inProgress: empTickets.filter((t) => t.mainStatus === "inProcess")
            .length,
          // working: empTickets.filter((t) => t.mainStatus === "working").length,
        };

        return {
          employeeId: emp._id,
          name: emp.name,
          email: emp.email,
          project: emp.projectId,
          ticketStatus,
        };
      })
    );

    const users = await User.find();
    const userSummary = await Promise.all(
      users.map(async (user) => {
        const userTickets = allTickets.filter(
          (t) => t.userId?.toString() === user._id.toString()
        );

        const ticketStatus = {
          open: userTickets.filter((t) => t.mainStatus === "open").length,
          closed: userTickets.filter((t) => t.mainStatus === "closed").length,
          handover: userTickets.filter((t) => t.mainStatus === "handover")
            .length,
          inProgress: userTickets.filter((t) => t.mainStatus === "inProcess")
            .length,
        };

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          project: user.projectId,
          ticketStatus,
        };
      })
    );

    res.json({ ticketSummary, userSummary, employeeSummary });
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

        const ticketStatus = {
          open: userTickets.filter((t) => t.mainStatus === "open").length,
          closed: userTickets.filter((t) => t.mainStatus === "closed").length,
          handover: userTickets.filter((t) => t.mainStatus === "handover")
            .length,
          inProgress: userTickets.filter((t) => t.mainStatus === "inProcess")
            .length,
        };

        return {
          userId: user._id,
          name: user.name,
          email: user.email,
          project: user.projectId,
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
