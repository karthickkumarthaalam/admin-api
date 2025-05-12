const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middlewares/authMiddleware");


router.post("/initiate", verifyToken, paymentController.initiatePayment);
router.post("/webhook", bodyParser.raw({ type: 'application/json' }), paymentController.webhookHandler);
router.get("/status/:transaction_id", verifyToken, paymentController.getPaymentStatus);


module.exports = router;