const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const uploadImage = require("../middlewares/uploadImages");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get("/all-events", eventController.getAllEventForUsers);

router.use(authenticateToken);

router.post(
  "/",
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "logo", maxCount: 1 }],
  }),
  eventController.createEvent
);

router.get("/", eventController.getAllEvents);

router.get("/:id", eventController.getEventById);

router.put(
  "/:id",
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "logo", maxCount: 1 }],
  }),
  eventController.updateEvent
);

router.delete("/:id", eventController.deleteEvent);

module.exports = router;
