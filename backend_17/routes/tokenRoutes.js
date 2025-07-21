// const express = require("express");
// const router = express.Router();
// const { verifyToken } = require("../middleware/auth");

// router.get("/verify-token", verifyToken, (req, res) => {
//   res.json({ valid: true, user: req.user });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

router.get("/verify-token", verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
