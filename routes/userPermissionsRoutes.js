const express = require("express");
const router = express.Router();
const userPermissionController = require("../controllers/userPermissionsController");

router.post("/", userPermissionController.savePermissions);
router.get("/", userPermissionController.getAllUserPermissions);
router.get("/:system_user_id", userPermissionController.getPermissionsByUser);
router.delete(
  "/:system_user_id",
  userPermissionController.deletePermissionsByUser,
);

module.exports = router;
