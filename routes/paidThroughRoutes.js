const express = require("express");
const router = express.Router();
const paidThroughController = require("../controllers/paidThroughController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.get("/", paidThroughController.listPaidThrough);
router.post("/", paidThroughController.createPaidThrough);

module.exports = router;

