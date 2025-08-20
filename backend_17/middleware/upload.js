// // const multer = require("multer");
// // const path = require("path");

// // // Define storage
// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/");
// //   },
// //   filename: (req, file, cb) => {
// //     const uniqueName = `${Date.now()}-${file.originalname}`;
// //     cb(null, uniqueName);
// //   }
// // });

// // // File filter (optional)
// // const fileFilter = (req, file, cb) => {
// //   cb(null, true); // Allow all for now
// // };

// // // Multer upload instance
// // const upload = multer({ storage, fileFilter });

// // module.exports = upload;

// // middleware/upload.js
// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const multer = require("multer");

// // Configure Cloudinary using Environment Variables for security and flexibility
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "ticket_attachments", // Files will be stored in this folder on Cloudinary
//     resource_type: "auto", // Automatically detect file type (image, raw, video)
//     allowed_formats: ["jpg", "png", "pdf", "doc", "docx", "xls", "xlsx", "txt"], // Define allowed types
//     public_id: (req, file) => {
//       // Generate a unique public_id for each file
//       return `ticket-${Date.now()}-${file.originalname.replace(/\s/g, "_")}`;
//     },
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },

// });

// module.exports = upload;

// middleware/upload.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ticket_attachments",
    resource_type: "auto", // auto-detect type (image, raw, video, etc.)
    public_id: (req, file) =>
      `ticket-${Date.now()}-${file.originalname.replace(/\s/g, "_")}`,
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, JPG, PNG, Word, Excel, CSV allowed."
        ),
        false
      );
    }
  },
});

module.exports = upload;
