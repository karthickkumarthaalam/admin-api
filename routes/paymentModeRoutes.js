const express = require("express");
const router = express.Router();
const paymentModeController = require("../controllers/paymentModeController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.get("/", paymentModeController.listPaymentMode);
router.post("/", paymentModeController.createPaymentMode);


module.exports = router;