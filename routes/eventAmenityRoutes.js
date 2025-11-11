const express = require("express");
const router = express.Router();
const eventAmenityController = require("../controllers/eventAmenityController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const uploadImage = require("../middlewares/uploadImages");

router.use(authenticateToken);

router.post(
  "/",
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "amenity_image", maxCount: 1 }],
  }),
  eventAmenityController.addAmenity
);
router.put(
  "/:id",
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "amenity_image", maxCount: 1 }],
  }),
  eventAmenityController.updateAmenity
);

router.patch("/status/:id", eventAmenityController.updateStatus);
router.get("/event/:event_id", eventAmenityController.listAmenitiesByEventId);
router.delete("/:id", eventAmenityController.deleteAmenity);

module.exports = router;
