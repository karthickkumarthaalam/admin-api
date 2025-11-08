const db = require("../models");
const { Notification } = db;

/**
 * Sends a real-time notification to admin and saves it in DB
 * @param {object} app - Express app (to access Socket.IO)
 * @param {object} options - notification data
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (e.g. member, comment, enquiry)
 * @param {string} [options.created_by] - Creator name (optional)
 */
const sendNotification = async (app, { title, message, type, created_by }) => {
  try {
    const io = app.get("io");

    // Save to DB
    const notification = await Notification.create({
      title,
      message,
      type,
      created_by,
    });

    // Emit real-time event
    io.emit("new-notification", notification);
  } catch (error) {
    console.error("⚠️ Error sending notification:", error.message);
  }
};

module.exports = sendNotification;
