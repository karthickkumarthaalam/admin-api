const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/", notificationController.createNotification);
router.get("/", authenticateToken, notificationController.getNotifications);
router.put("/:id/read", authenticateToken, notificationController.markAsRead);

module.exports = router;
