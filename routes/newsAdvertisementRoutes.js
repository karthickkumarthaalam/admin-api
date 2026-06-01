const express = require("express");
const router = express.Router();
const advertisementController = require("../controllers/newsAdvertisementController");
const upload = require("../middlewares/uploadPdf");

router.post(
  "/",
  upload.single("image"),
  advertisementController.createAdvertisement,
);
router.get("/", advertisementController.getAdvertisements);
router.get("/active", advertisementController.getActiveAdvertisement);
router.get("/:id", advertisementController.getAdvertisementById);
router.put(
  "/:id",
  upload.single("image"),
  advertisementController.updateAdvertisement,
);
router.patch("/status/:id", advertisementController.updateAdsStatus);
router.delete("/:id", advertisementController.deleteAdvertisement);

module.exports = router;
