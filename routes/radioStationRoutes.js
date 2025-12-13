const express = require("express");
const router = express.Router();
const radioStationController = require("../controllers/radioStationController");
const uploadImages = require("../middlewares/uploadImages");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);
router.get("/", radioStationController.getAllRadioStation);
router.get("/:id", radioStationController.getRadioStationById);

router.post(
  "/create",
  uploadImages("uploads/radio-stations", {
    mode: "fields",
    fieldsConfig: [{ name: "logo", maxCount: 1 }],
  }),
  radioStationController.createRadioStation
);

router.patch("/:id/status", radioStationController.updateStatus);

router.put(
  "/:id",
  uploadImages("uploads/radio-stations", {
    mode: "fields",
    fieldsConfig: [{ name: "logo", maxCount: 1 }],
  }),
  radioStationController.updateRadioStation
);

router.delete("/:id", radioStationController.deleteRadioStation);

module.exports = router;
