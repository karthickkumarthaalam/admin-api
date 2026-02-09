const express = require("express");
const router = express.Router();
const summerFestivalRefundController = require("../controllers/summerFestivalRefundController");
const upload = require("../middlewares/uploadPdf");

router.post(
  "/",
  upload.fields([{ name: "bills", maxCount: 1 }]),
  summerFestivalRefundController.createRefundEnquiry,
);
router.get("/refund", summerFestivalRefundController.getAllRefundEnquiries);
router.get(
  "/order-id/:ORDER_ID",
  summerFestivalRefundController.checkAttendeesOrderId,
);

router.patch(
  "/refund-status/:id",
  summerFestivalRefundController.updateRefundStatus,
);
router.get(
  "/attendee/:ORDER_ID",
  summerFestivalRefundController.getAttendeeByOrderId,
);

module.exports = router;
