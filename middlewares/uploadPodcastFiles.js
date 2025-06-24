const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_PATH = 'uploads/podcasts';

if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg", "image/webp"];
    if (file.fieldname === "image") {
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, JPG, WEBP and GIF images allowed."), false);
        }
    } else {
        cb(null, true);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const podcastUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 150 * 1024 * 1024 }
});

// ✅ export the multer instance
module.exports = podcastUpload;
