const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditLogsListController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Admin-only route
router.get("/", authenticateToken, getAuditLogs);

module.exports = router;
