const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Allowed image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, JPG, and GIF are allowed."), false);
    }
};

// Core storage creator
const createStorage = (uploadPath) => {
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    });
};


const uploadImage = (uploadPath, config) => {
    const storage = createStorage(uploadPath);

    const upload = multer({
        storage,
        fileFilter,
        limits: { fileSize: 5 * 1024 * 1024 }
    });

    const { mode, fieldName, maxCount, fieldsConfig } = config;

    if (mode === "single") {
        return upload.single(fieldName);
    } else if (mode === "array") {
        return upload.array(fieldName, maxCount);
    } else if (mode === "fields") {
        return upload.fields(fieldsConfig);
    } else if (mode === "any") {
        return upload.any();
    } else {
        throw new Error("Invalid upload mode provided.");
    }
};

module.exports = uploadImage;
