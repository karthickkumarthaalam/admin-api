const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware");


router.post("/initiate", verifyToken, paymentController.initiatePayment);
router.get("/status/:transaction_id", verifyToken, paymentController.getPaymentStatus);


module.exports = router;