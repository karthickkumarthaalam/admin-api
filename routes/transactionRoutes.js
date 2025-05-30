const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { verifyToken } = require("../middlewares/authMiddleware");


router.get("/", transactionController.getAllTransactions);
router.get("/buy-package-report", verifyToken, transactionController.getMemberPackageTransactions);
router.post("/process-refund", transactionController.refundPayment);
router.post("/request-refund", transactionController.requestRefund);
router.post("/reject-refund", transactionController.rejectRefund);

module.exports = router;