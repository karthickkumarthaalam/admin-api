const express = require("express");
const router = express.Router();
const advertisementController = require("../controllers/advertisementController");

router.post("/", advertisementController.createAdvertisement);
router.get("/", advertisementController.getAllAdvertisement);
router.patch("/:id/status", advertisementController.updateStatus);

module.exports = router;
