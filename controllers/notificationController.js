const db = require("../models");
const { Notification } = db;
const sendNotification = require("../services/sendNotification");

// Create notification
exports.createNotification = async (req, res) => {
  try {
    await sendNotification(req.app, req.body);
    res.status(201).json({ status: "success", message: "Notification sent" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Failed to send notification" });
  }
};

// Get unread notifications only
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { is_read: false },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      status: "success",
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification)
      return res
        .status(404)
        .json({ status: "error", message: "Notification not found" });

    notification.is_read = true;
    await notification.save();

    res.status(200).json({
      status: "success",
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
