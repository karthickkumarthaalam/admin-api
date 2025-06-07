const express = require("express");
const router = express.Router();
const memberController = require("../controllers/membersController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/signup", memberController.signup);
router.post("/login", memberController.login);
router.post("/forgot-password", memberController.forgotPassword);
router.post("/verify-otp", memberController.verifyOtp);
router.post("/reset-password", memberController.resetPassword);

router.post("/change-password", verifyToken, memberController.changePassword);
router.post("/:id/request-update-otp", verifyToken, memberController.requestUpdateOtp);

router.get("/:id", verifyToken, memberController.getMemberById);
router.put("/:id", verifyToken, memberController.updateMember);

router.get("/", memberController.getAllMembers);


module.exports = router;