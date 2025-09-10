const Ticket = require("../models/ticket");
const User = require("../models/user");
const Timesheet = require("../models/timesheet");
const sendEmail = require("../utils/sendMail");
const dayjs = require("dayjs");

// exports.getTimesheetFromTickets = async (req, res) => {
//   try {
//     const tickets = await Ticket.find({});

//     const userIds = [
//       ...new Set([
//         ...tickets.map((t) => t.employeeId),
//         ...tickets.map((t) => t.userId),
//       ]),
//     ];

//     const users = await User.find({ _id: { $in: userIds } });
//     const userMap = {};
//     users.forEach((u) => {
//       userMap[u._id] = u.name;
//     });

//     const timesheetData = tickets.map((ticket) => {
//       const employeeName =
//         ticket.employee || userMap[ticket.employeeId] || "Unknown";
//       const createdTime = ticket.createdTime
//         ? new Date(ticket.createdTime)
//         : null;

//       let timeRange = "-";
//       let totalWorkFormatted = "-";
//       let dateFormatted = "-";

//       if (createdTime instanceof Date && !isNaN(createdTime)) {
//         let endTime;

//         if (ticket.mainStatus?.toLowerCase() === "closed") {
//           // Use updatedTime only if it's a valid date string
//           endTime = new Date(ticket.updatedTime);
//           if (!(endTime instanceof Date) || isNaN(endTime)) {
//             console.warn("Invalid updatedTime, falling back to current time");
//             endTime = new Date();
//           }
//         } else {
//           endTime = new Date();
//         }

//         const totalMinutes = Math.floor((endTime - createdTime) / 60000);
//         const hours = Math.floor(totalMinutes / 60);
//         const minutes = totalMinutes % 60;
//         totalWorkFormatted = `${hours} Hrs ${minutes} Min`;

//         const formatTime = (date) =>
//           new Date(date).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: false,
//           });

//         timeRange = `${formatTime(createdTime)} To ${formatTime(endTime)}`;
//         dateFormatted = createdTime.toISOString().split("T")[0];
//       }

//       return {
//         employee: employeeName,
//         ticketId: ticket.ticketNo || ticket._id?.toString().slice(-6),
//         subject: ticket.subject || "-",
//         task: ticket.issue || "-",
//         date: dateFormatted,
//         time: timeRange,
//         status: ticket.mainStatus,
//         totalWork: totalWorkFormatted,
//       };
//     });

//     return res.status(200).json(timesheetData);
//   } catch (err) {
//     console.error("Timesheet generation failed:", err.message);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.getTimesheetForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const tickets = await Ticket.find({
      userId: userId,
    }).populate("employee");

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

// exports.getTimesheetForEmployee = async (req, res) => {
//   try {
//     const { empId } = req.params;

//     const tickets = await Ticket.find({
//       employeeId: empId,
//     }).populate("employee");

//     const timesheetData = tickets.map((ticket) => {
//       const employeeName = ticket.employee || "Unknown";
//       const createdTime = ticket.createdTime
//         ? new Date(ticket.createdTime)
//         : null;

//       let timeRange = "-";
//       let totalWorkFormatted = "-";
//       let dateFormatted = "-";

//       if (createdTime instanceof Date && !isNaN(createdTime)) {
//         let endTime;

//         if (ticket.mainStatus?.toLowerCase() === "closed") {
//           // Use updatedTime only if it's a valid date string
//           endTime = new Date(ticket.updatedTime);
//           if (!(endTime instanceof Date) || isNaN(endTime)) {
//             console.warn("Invalid updatedTime, falling back to current time");
//             endTime = new Date();
//           }
//         } else {
//           endTime = new Date();
//         }

//         const totalMinutes = Math.floor((endTime - createdTime) / 60000);
//         const hours = Math.floor(totalMinutes / 60);
//         const minutes = totalMinutes % 60;
//         totalWorkFormatted = `${hours} Hrs ${minutes} Min`;

//         const formatTime = (date) =>
//           new Date(date).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//             hour12: false,
//           });

//         timeRange = `${formatTime(createdTime)} To ${formatTime(endTime)}`;
//         dateFormatted = createdTime.toISOString().split("T")[0];
//       }

//       return {
//         employee: employeeName,
//         ticket: `#${ticket._id.toString().slice(-6)}`,
//         subject: ticket.subject || "-",
//         task: ticket.issue || "-",
//         date: dateFormatted,
//         time: timeRange,
//         totalWork: totalWorkFormatted,
//       };
//     });

//     return res.status(200).json(timesheetData);
//   } catch (err) {
//     console.error("User Timesheet fetch failed:", err.message);
//     return res.status(500).json({ error: "Failed to fetch user timesheet" });
//   }
// };

// Create or add timesheet

exports.addTimesheet = async (req, res) => {
  try {
    const { employeeId, ticket, date, workingTime} = req.body;

    // Prevent duplicate entry for same employee+ticket+date
    // const existing = await Timesheet.findOne({ employeeId, ticket, date });
    // if (existing) {
    //   return res
    //     .status(400)
    //     .json({ message: "Timesheet already exists for this ticket and date" });
    // }

    let formattedWorkingTime = workingTime;
    if (typeof workingTime === "number") {
      const hrs = Math.floor(workingTime);
      const mins = Math.round((workingTime - hrs) * 60);
      formattedWorkingTime = parseFloat(`${hrs}.${mins.toString().padStart(2, "0")}`);
    }

    const newEntry = new Timesheet({
      ...req.body,
      workingTime: formattedWorkingTime,
    });

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

// exports.fetchTimesheetForAllEmployees = async (req, res) => {
//   try {
//     const timesheets = await Timesheet.find({}).sort({ createdAt: -1 });
//     res.json(timesheets);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch timesheets", error: err });
//   }
// };

exports.fetchTimesheetsWithTicketStatus = async (req, res) => {
  try {
    const result = await Timesheet.aggregate([
      {
        $addFields: {
          ticketObjectId: {
            $convert: {
              input: "$ticket",
              to: "objectId",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $lookup: {
          from: "tickets",
          localField: "ticketObjectId",
          foreignField: "_id",
          as: "ticketData",
        },
      },
      {
        $unwind: {
          path: "$ticketData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          // Include only timesheet fields
          employee: 1,
          employeeId: 1,
          ticket: 1,
          ticketNo: 1,
          subject: 1,
          task: 1,
          date: 1,
          workingTime: 1,
          totalWork: 1,

          // From ticketData, only mainStatus
          mainStatus: "$ticketData.mainStatus",
        },
      },
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in aggregation:", err);
    res.status(500).json({ message: "Failed to fetch enriched timesheets." });
  }
};

// exports.triggerEmailForEmployeeTimeSheet = async () => {
//   try {
//     const today = dayjs().format("YYYY-MM-DD");

//     const employeeIds = await Timesheet.distinct("employeeId", { date: today });

//     for (const empId of employeeIds) {
//       const timesheets = await Timesheet.find({
//         employeeId: empId,
//         date: today,
//       }); // console.log("Subject =? ", subject);
//       // console.log("plaint text ", plainText);
//       console.log(timesheets);
//       if (timesheets.length === 0) continue;

//       const user = await User.findById(empId);
//       if (!user?.email) continue;

//       const totalHoursDecimal = timesheets.reduce(
//         (sum, t) => sum + (t.workingTime || 0),
//         0
//       );
//       const totalHours = `${Math.floor(totalHoursDecimal)} hr ${Math.round(
//         (totalHoursDecimal % 1) * 60
//       )} min`;

//       const submittedRows = timesheets
//         .map(
//           (t) => `
//         <tr>
//           <td>${t.ticketNo || "-"}</td>
//           <td>${t.subject || "-"}</td>
//           <td>${t.project || "-"}</td>
//           <td>${t.issue || "-"}</td>
//           <td>${(t.workingTime || 0).toFixed(2)} hr</td>
//         </tr>
//       `
//         )
//         .join("");

//       const statusRows = timesheets
//         .map(
//           (t) => `
//         <tr>
//           <td>${dayjs(t.updatedAt).format("DD-MM-YYYY HH:mm")}</td>
//           <td>${t.assigneeName || "-"}</td>
//           <td>${t.subStatus || "-"}</td>
//           <td>${t.mainStatus || "-"}</td>
//         </tr>
//       `
//         )
//         .join("");

//       const html = `
//       <div style="font-family: Arial, sans-serif; padding: 15px;">
//         <h2 style="color: #333;">🕒 Timesheet Summary for ${today}</h2>
//         <p><strong>Name:</strong> ${user.name}</p>
//         <p><strong>Total Time:</strong> ${totalHours}</p>

//         <div style="overflow-x: auto;">
//           <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; min-width: 1000px; width: 100%;">
//             <thead style="background-color: #f0f0f0;">
//               <tr style="text-align: left;">
//                 <th>#</th>
//                 <th>Project</th>
//                 <th>Ticket Id</th>
//                 <th>Subject</th>
//                 <th>Issue</th>
//                 <th>Task</th>
//                 <th>Submitted Time</th>
//                 <th>Last Updated</th>
//                 <th>Previous Working Time</th>
//                 <th>Today's Working Time</th>
//                 <th>Total Time (hr)</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${timesheets
//                 .map((t, index) => {
//                   return `
//                     <tr>
//                       <td>${index + 1}</td>
//                       <td>${t.project || "-"}</td>
//                       <td>${t.ticketNo || "-"}</td>
//                       <td>${t.subject || "-"}</td>
//                       <td>${t.issuedDate || "-"}</td>
//                       <td>${t.task || "-"}</td>

//                       <td>${dayjs(t.createdAt).format("DD-MM-YYYY HH:mm")}</td>
//                       <td>${dayjs(t.updatedAt).format("DD-MM-YYYY HH:mm")}</td>

//                       <td>${t.previousWork || "—"}</td>
//                       <td>${(t.workingTime || 0).toFixed(2)}</td>
//                       <td>${t.totalWork || "—"}</td>
//                     </tr>`;
//                 })
//                 .join("")}
//             </tbody>
//           </table>
//         </div>

//         <p style="margin-top: 20px; color: #777;">
//           This is an automated email. Please do not reply.
//         </p>
//       </div>
//     `;

//       const subject = `Timesheet Summary of ${user.name} for ${today}`;
//       const plainText = `Hi ${user.name}, your total time logged today is ${totalHours}.`;
//       console.log(html);
//       const ccEmails = [
//         "erpdevelopment@clickerpservices.com",
//         "yogesh.kale@clickerpservices.com",
//         "prasad.chilwar@clickerpservices.com",
//       ];
//       await sendEmail(user.email, subject, plainText, html, ccEmails);
//       console.log(`Email sent to ${user.email}`);
//     }
//   } catch (err) {
//     console.error("Error sending timesheet emails:", err);
//     throw err;
//   }
// };

exports.triggerEmailForEmployeeTimeSheet = async () => {
  try {
    const today = dayjs().format("YYYY-MM-DD");

    // Get all timesheets of today and populate employee
    const timesheets = await Timesheet.find({ date: today }).populate(
      "employeeId"
    );

    if (!timesheets || timesheets.length === 0) {
      console.log("No timesheets found for today");
      return;
    }

    // Group by employee
    const employeeMap = {};
    for (const t of timesheets) {
      const empName = t.employee;
      if (!employeeMap[empName]) employeeMap[empName] = [];
      employeeMap[empName].push(t);
    }

    // Sort employees by name
    const sortedEmployees = Object.keys(employeeMap).sort();

    // Build HTML rows employee by employee
    let employeeSections = "";
    for (const empName of sortedEmployees) {
      const empTimesheets = employeeMap[empName];
      const totalHoursDecimal = empTimesheets.reduce(
        (sum, t) => sum + (t.workingTime || 0),
        0
      );
      const totalHours = `${Math.floor(totalHoursDecimal)} hr ${Math.round(
        (totalHoursDecimal % 1) * 60
      )} min`;

      const rows = empTimesheets
        .map(
          (t, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${empName || "-"}</td>
              <td>${t.project || "-"}</td>
              <td>${t.ticketNo || "-"}</td>
              <td>${t.subject || "-"}</td>
              <td>${t.issuedDate || "-"}</td>
              <td>${
                dayjs(t.targetDate).isValid()
                  ? dayjs(t.targetDate).format("DD-MM-YYYY")
                  : "-"
              }</td>
              <td>${t.task || "-"}</td>
              <td>${dayjs(t.createdAt).format("DD-MM-YYYY HH:mm")}</td>
              <td>${dayjs(t.updatedAt).format("DD-MM-YYYY HH:mm")}</td>
              <td>${t.previousWork || "—"}</td>
              <td>${(t.workingTime || 0).toFixed(2)}</td>
              <td>${t.totalWork || "—"}</td>
            </tr>`
        )
        .join("");

      employeeSections += `
        <h3 style="margin-top:25px; color:#444;">${empName} (Total: ${totalHours})</h3>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; margin-bottom:20px;">
          <thead style="background:#f0f0f0;">
            <tr>
              <th>#</th>
              <th>Employee Name</th>
              <th>Project</th>
              <th>Ticket Id</th>
              <th>Subject</th>
              <th>Issued Date</th>
              <th>Target Date</th>
              <th>Task</th>
              <th>Submitted Time</th>
              <th>Last Updated</th>
              <th>Previous Work</th>
              <th>Today's Work</th>
              <th>Total Work</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>`;
    }

    const html = `
      <div style="font-family:Arial, sans-serif; padding:20px;">
        <h2>🕒 Consolidated Timesheet Summary for ${today}</h2>
        ${employeeSections}
        <p style="margin-top:20px; color:#777;">This is an automated email. Please do not reply.</p>
      </div>
    `;

    const subject = `Consolidated Timesheet Summary - ${today}`;
    const plainText = `Consolidated timesheet summary for ${today}`;

    // 🔹 Hardcoded email IDs
    const toEmail = "development@clickerpservices.com";
    const ccEmails = [
      "yogesh.kale@clickerpservices.com",
      "prasad.chilwar@clickerpservices.com",
    ];

    await sendEmail(toEmail, subject, plainText, html, ccEmails);
  } catch (err) {
    console.error("Error sending consolidated timesheet email:", err);
    throw err;
  }
};
