const express = require("express");
const router = express.Router();
const experienceLetterController = require("../controllers/experienceLetterController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadPdf");

router.get("/verify-data", experienceLetterController.verifyData);

router.use(authenticateToken);

router.post("/", experienceLetterController.createExperience);
router.get("/", experienceLetterController.getAllExperience);
router.get("/:id", experienceLetterController.getExperiencById);
router.put("/:id", experienceLetterController.updateExperience);
router.delete("/:id", experienceLetterController.deleteExperience);
router.patch("/:id/restore", experienceLetterController.restoreExperience);
router.post(
  "/send-email",
  upload.single("experience"),
  experienceLetterController.sendExperienceEmail
);

module.exports = router;
