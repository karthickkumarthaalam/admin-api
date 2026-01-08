const express = require("express");
const router = express.Router();
const podcastCreatorController = require("../controllers/podcastCreatorController");
const upload = require("../middlewares/podcastCreatorUpload");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post(
  "/",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
  ]),
  podcastCreatorController.createPodcastCreator
);

router.get("/", podcastCreatorController.listPodcastCreators);
router.patch(
  "/:id/status",
  authenticateToken,
  podcastCreatorController.updateCreatorStatus
);

router.post("/login", podcastCreatorController.loginPodcastCreator);
router.post("/forgot-password", podcastCreatorController.forgotPassword);
router.post("/reset-password", podcastCreatorController.resetPassword);

module.exports = router;
