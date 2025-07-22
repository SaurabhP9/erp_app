// const express = require("express");
// const router = express.Router();
// const { getTimesheetFromTickets, getTimesheetForUser,getTimesheetForEmployee } = require("../controllers/timesheetController");

// router.get("/all", getTimesheetFromTickets);
// router.get("/user/:userId", getTimesheetForUser);
// // router.get("/employee/:empId", getTimesheetForEmployee);

// const {
//   addTimesheet,
//   getTimesheetsByEmployee,
// } = require("../controllers/timesheetController");

// router.post("/add", addTimesheet);
// router.get("/employee/:id", getTimesheetsByEmployee);

// module.exports = router;

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  addTimesheet,
  getTimesheetForUser,
  getTimesheetsByEmployee,
  fetchTimesheetForAllEmployees,
  fetchTimesheetsWithTicketStatus,
} = require("../controllers/timesheetController");

// router.get("/all", getTimesheetFromTickets);
router.get("/user/:userId", getTimesheetForUser);
// router.get("/employee/:empId", getTimesheetForEmployee);

router.post("/add", addTimesheet);
router.get("/employee/:id", getTimesheetsByEmployee);
// router.get("/all", fetchTimesheetForAllEmployees);
router.get("/all", fetchTimesheetsWithTicketStatus);

module.exports = router;
