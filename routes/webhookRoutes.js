const express = require("express");
const bodyParser = require("body-parser");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/", bodyParser.raw({ type: 'application/json' }), paymentController.webhookHandler);

module.exports = router;
