const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

/* ===============================
   CLOUDINARY CONFIG
================================ */

cloudinary.config({
  secure: true // Uses CLOUDINARY_URL from environment variables
});

/* ===============================
   CLOUDINARY STORAGE CONFIG
================================ */

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dms_uploads", // folder name in Cloudinary
    resource_type: "auto"  // supports pdf, images, docs, etc.
  }
});

/* ===============================
   MULTER INSTANCE
================================ */

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;