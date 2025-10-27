// routes/employeeDocumentsRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/employeeDocumentsController");
const multer = require("multer");
const upload = multer({ dest: "temp_uploads/" });

router.post("/", upload.single("file"), controller.uploadEmployeeDocument);
router.get("/", controller.getEmployeeDocuments);
router.put("/verify/:id", controller.verifyEmployeeDocument);
router.delete("/:id", controller.deleteEmployeeDocument);

module.exports = router;
