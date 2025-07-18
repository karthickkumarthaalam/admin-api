const express = require("express");
const router = express.Router();
const paidThroughController = require("../controllers/paidThroughController");

router.get("/", paidThroughController.listPaidThrough);
router.post("/", paidThroughController.createPaidThrough);

module.exports = router;

