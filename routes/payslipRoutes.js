const express = require("express");
const router = express.Router();
const payslipController = require("../controllers/payslipController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadPdf");

router.get("/verify-data", payslipController.verifyData);

router.use(authenticateToken);

router.post("/", payslipController.createPayslip);
router.get("/", payslipController.getAllPayslips);
router.get("/:id", payslipController.getPayslipById);
router.put("/:id", payslipController.updatePayslip);
router.delete("/:id", payslipController.deletePaySlip);
router.patch("/:id/restore", payslipController.restorePaySlip);
router.post(
  "/send-email",
  upload.single("payslip"),
  payslipController.sendPayslipEmail
);

module.exports = router;
