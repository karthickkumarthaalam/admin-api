const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/temp";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  // Profile image
  if (file.fieldname === "profile") {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Profile must be an image"), false);
    }
  }

  // ID proof
  if (file.fieldname === "id_proof") {
    if (
      !file.mimetype.startsWith("image/") &&
      file.mimetype !== "application/pdf"
    ) {
      return cb(new Error("ID proof must be image or PDF"), false);
    }
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
