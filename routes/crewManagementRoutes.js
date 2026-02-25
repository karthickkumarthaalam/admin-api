const express = require("express");
const router = express.Router();
const crewManagementController = require("../controllers/crewManagementController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get("/crew-id", crewManagementController.getNextCrewId);
router.post("/login", crewManagementController.loginController);
router.post("/send-otp", crewManagementController.sendOtp);
router.post("/reset-password", crewManagementController.updatePasswordWithOtp);
router.patch("/change-password/:id", crewManagementController.updatePassword);

router.post(
  "/",
  authenticateToken,
  crewManagementController.createCrewManagement,
);

router.get("/", crewManagementController.getAllCrewManagement);
router.get("/:id", crewManagementController.getCrewManagementById);
router.put("/:id", crewManagementController.updateCrewManagement);
router.delete("/:id", crewManagementController.deleteCrewManagement);
router.patch(
  "/toggle-status/:id",
  crewManagementController.toggleCrewStatusWithEmail,
);

module.exports = router;
