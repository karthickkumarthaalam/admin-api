const express = require("express");
const router = express.Router();
const eventBannerController = require("../controllers/eventBannerController");
const uploadImage = require("../middlewares/uploadImages");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "file", maxCount: 1 }],
  }),
  eventBannerController.addBanner
);

router.put(
  "/:id",
  authenticateToken,
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "file", maxCount: 1 }],
  }),
  eventBannerController.updateBanner
);

router.patch(
  "/status/:id",
  authenticateToken,
  eventBannerController.updateBannerStatus
);

router.get(
  "/event/:event_id",
  authenticateToken,
  eventBannerController.listBannersByEventId
);

router.delete("/:id", authenticateToken, eventBannerController.deleteBanner);

module.exports = router;
