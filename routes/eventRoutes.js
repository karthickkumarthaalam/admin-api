const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const uploadImage = require("../middlewares/uploadImages");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "logo", maxCount: 1 }],
  }),
  eventController.createEvent
);

router.get("/", authenticateToken, eventController.getAllEvents);

router.get("/:id", authenticateToken, eventController.getEventById);

router.put(
  "/:id",
  authenticateToken,
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "logo", maxCount: 1 }],
  }),
  eventController.updateEvent
);

router.delete("/:id", authenticateToken, eventController.deleteEvent);

module.exports = router;
