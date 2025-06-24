const multer = require("multer");
const storage = multer.memoryStorage();

const uploadAudio = multer({
    storage: storage,
    limits: {
        fileSize: 150 * 1024 * 1024,
    }
});

module.exports = uploadAudio;