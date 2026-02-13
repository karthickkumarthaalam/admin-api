const express = require("express");
const router = express.Router();
const eventEnquiryController = require("../controllers/eventEnquiryController");

// 🔹 Public
router.post("/", eventEnquiryController.createEnquiry);

// 🔹 Admin
router.get("/enquiry/:event_id", eventEnquiryController.getAllEnquiries);
router.get("/:id", eventEnquiryController.getSingleEnquiry);
router.put("/:id/status", eventEnquiryController.updateEnquiryStatus);
router.delete("/:id", eventEnquiryController.deleteEnquiry);

module.exports = router;
