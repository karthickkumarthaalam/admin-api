const express = require("express");
const router = express.Router();
const controller = require("../controllers/crewDocumentController");
const upload = require("../middlewares/uploadPdf");

router.post(
  "/passport/:crewId",
  upload.array("passport_files", 10),
  controller.uploadPassportFiles,
);

router.post(
  "/visa/:crewId",
  upload.array("visa_files", 10),
  controller.uploadVisaFiles,
);

router.delete("/passport/:crewId", controller.deleteSinglePassport);

router.delete("/visa/:crewId", controller.deleteSingleVisa);

module.exports = router;
