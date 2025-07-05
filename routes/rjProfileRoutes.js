const express = require("express");
const router = express.Router();
const rjProfileController = require("../controllers/rjProfileController");
const uploadImages = require("../middlewares/uploadImages");

router.post(
    "/create",
    uploadImages("uploads/rjProfiles", {
        mode: "fields",
        fieldsConfig: [{ name: "profile_image", maxCount: 1 }]
    }),
    rjProfileController.createRjProfile
);

router.patch(
    "/update/:id",
    uploadImages("uploads/rjProfiles", {
        mode: "fields",
        fieldsConfig: [{ name: "profile_image", maxCount: 1 }]
    }),
    rjProfileController.updateRjProfile
);

router.patch("/update-status/:id", rjProfileController.updateRjStatus);

router.delete("/delete/:id", rjProfileController.deleteRjProfile);

router.get("/list", rjProfileController.getAllRjProfiles);

router.get("/details/:id", rjProfileController.getRjProfileById);

module.exports = router;
