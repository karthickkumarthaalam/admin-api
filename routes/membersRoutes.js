const express = require("express");
const router = express.Router();
const memberController = require("../controllers/mermbersController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/signup", memberController.signup);
router.post("/login", memberController.login);
router.get("/", memberController.getAllMembers);
router.get("/:id", verifyToken, memberController.getMemberById);
router.put("/:id", verifyToken, memberController.updateMember);
router.post("/change-password", verifyToken, memberController.changePassword);
router.post("/forgot-password", memberController.forgotPassword);
router.post("/verify-otp", memberController.verifyOtp);
router.post("/reset-password", memberController.resetPassword);



module.exports = router;