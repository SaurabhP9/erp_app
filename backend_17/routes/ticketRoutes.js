const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post(
  "/create",
  upload.array("attachments", 5),
  ticketController.createTicket
);

// Create ticket with file upload
// router.post(
//   "/create",
//   verifyToken,
//   requireRole(["admin"]),
//   upload.array("attachments", 10), // allow up to 10 files
//   ticketController.createTicket
// );

// All users can view tickets
router.get("/", verifyToken, ticketController.getAllTickets);
router.get("/:id", verifyToken, ticketController.getTicketById);

// Admins can update and delete
router.put("/:id", verifyToken, ticketController.updateTicket);
router.delete(
  "/:id",
  verifyToken,
  requireRole(["admin"]),
  ticketController.deleteTicket
);
// routes/ticket.js
router.get("/filtered", ticketController.getFilteredTickets);

router.get("/:id", verifyToken, ticketController.getTicketById);

router.get("/user/:userId", verifyToken, ticketController.getTicketsByUserId);
router.get(
  "/employee/:empId",
  verifyToken,
  ticketController.getTicketsByEmployeeId
);
router.post("/report", ticketController.getReportTickets);
router.get("/handover/by/:userId", ticketController.getTicketsHandedOverByUser);
router.get("/handover/count/:userId", ticketController.getHandoverTicketCountByUser);

module.exports = router;
