const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.getHomeSummary);
router.get("/:role", homeController.getTicketSummaryByRole);

module.exports = router;
