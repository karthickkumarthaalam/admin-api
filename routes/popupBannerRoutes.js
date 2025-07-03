const express = require("express");
const router = express.Router();
const popupBannerController = require("../controllers/popupBannerController");
const uploadImages = require("../middlewares/uploadImages");

router.get("/", popupBannerController.listBanners);

router.post("/create",
    uploadImages("uploads/popupBanner", {
        mode: "fields",
        fieldsConfig: [
            { name: "website_image", maxCount: 1 },
            { name: "mobile_image", maxCount: 1 }
        ]
    }),
    popupBannerController.createOrUpdateBanner
);

router.patch("/", popupBannerController.updateBannerStatus);
router.delete("/:id", popupBannerController.deleteBanner);

module.exports = router;
