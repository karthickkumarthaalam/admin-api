const express = require("express");
const router = express.Router();
const podcastController = require("../controllers/podcastController");
const podcastUpload = require("../middlewares/uploadPodcastFiles");
const { authenticateToken, checkPermission } = require("../middlewares/authMiddleware");

// Public
router.get("/", podcastController.getAllPodcasts);
router.get("/:id", podcastController.getPodcastById);
router.get("/stream-audio/:fileId", podcastController.streamAudioFromDrive);


// Protected
// router.use(authenticateToken);
// router.use(checkPermission("podcasts"));

router.post(
    "/create",
    podcastUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    podcastController.createPodcast
);

router.put(
    "/update/:id",
    podcastUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    podcastController.updatePodcast
);

router.patch("/status/:id", podcastController.updatePodcastStatus);
router.delete("/delete/:id", podcastController.deletePodcast);

module.exports = router;
