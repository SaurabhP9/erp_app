const express = require("express");
const router = express.Router();
const { sendTicketEmail } = require("../controllers/emailController");

router.post("/send-email", sendTicketEmail);

module.exports = router;
