const multer = require("multer");
const path = require("path");

// Define storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  cb(null, true); // Allow all for now
};

// Multer upload instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
