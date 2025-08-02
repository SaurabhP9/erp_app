const express = require("express");
const router = express.Router();
const {triggerEmailForEmployeeTimeSheet} = require("../controllers/timesheetController");

// Secure using secret key
router.get("/daily-timesheet-emails", async (req, res) => {
  if (req.query.key !== process.env.CRON_SECRET) {
    return res.status(403).send("Forbidden: Invalid API Key");
  }

  try {
    await triggerEmailForEmployeeTimeSheet();
    res.send("✅ Timesheet emails sent");
  } catch (err) {
    res.status(500).send("❌ Failed to send emails");
  }
});

module.exports = router;