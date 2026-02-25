const express = require("express");
const router = express.Router();
const crewModuleController = require("../controllers/crewModuleController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get(
  "/check-module-access",
  authenticateToken,
  crewModuleController.checkModuleAccess,
);

router.post("/assign", crewModuleController.addCrewPermissions);
router.get("/:crew_management_id", crewModuleController.getCrewPermissions);
router.delete("/:id", crewModuleController.deleteCrewPermission);

module.exports = router;
