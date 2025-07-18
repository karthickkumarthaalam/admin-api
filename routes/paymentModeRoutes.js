const express = require("express");
const router = express.Router();
const paymentModeController = require("../controllers/paymentModeController");

router.get("/", paymentModeController.listPaymentMode);
router.post("/", paymentModeController.createPaymentMode);


module.exports = router;