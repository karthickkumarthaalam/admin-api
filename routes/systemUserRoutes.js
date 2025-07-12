const express = require("express");
const router = express.Router();
const systemUsersController = require("../controllers/systemUserController");
const uploadImages = require("../middlewares/uploadImages");


router.post("/create", uploadImages("uploads/systemUsers", {
    mode: "fields",
    fieldsConfig: [{ name: "profile_image", maxCount: 1 }]
}), systemUsersController.createSystemUser);

router.patch("/update/:id", uploadImages("uploads/rjProfiles", {
    mode: "fields",
    fieldsConfig: [{ name: "profile_image", maxCount: 1 }]
}), systemUsersController.updateSystemUser);

router.patch("/:id/status", systemUsersController.updateSystemUserStatus);
router.delete("/:id", systemUsersController.deleteSystemUser);
router.get("/", systemUsersController.getAllSystemUsers);
router.get("/:id", systemUsersController.getSystemUserById);

module.exports = router;
