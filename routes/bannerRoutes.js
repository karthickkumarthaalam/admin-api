const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const uploadImages = require('../middlewares/uploadImages');
const { authenticateToken, checkPermission } = require("../middlewares/authMiddleware");

router.get("/", bannerController.getAllBanner);
router.get("/:id", bannerController.getBannerById);

// router.use(authenticateToken);
// router.use(checkPermission("banners"));

router.post("/create", uploadImages("uploads/banners", {
    mode: "fields",
    fieldsConfig: [
        { name: "website_image", maxCount: 1 },
        { name: "mobile_image", maxCount: 1 }
    ]
}), bannerController.createBanner);

router.patch("/:id", bannerController.updateBannerStatus);
router.put("/:id", uploadImages("uploads/banners", {
    mode: "fields",
    fieldsConfig: [
        { name: "website_image", maxCount: 1 },
        { name: "mobile_image", maxCount: 1 }
    ]
}),
    bannerController.updateBanner);
router.delete("/:id", bannerController.deleteBanner);


module.exports = router;