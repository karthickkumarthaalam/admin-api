const express = require("express");
const router = express.Router();
const podcastController = require("../controllers/podcastController");
const podcastUpload = require("../middlewares/uploadPodcastFiles");
const podcastCommentController = require("../controllers/podcastCommentController");
const podcastReactionController = require("../controllers/podcastReactionController");
const { authenticateToken } = require("../middlewares/authMiddleware");


//comment
router.post("/comments", podcastCommentController.addComment);
router.get("/comments", authenticateToken, podcastCommentController.commentList);
router.patch("/comments/:comment_id/status", podcastCommentController.updateCommentStatus);
router.get("/:id/comments", podcastCommentController.getCommentByPodcast);
router.delete("/:comment_id/comments", podcastCommentController.deleteComment);

//reaction 
router.post("/reaction", podcastReactionController.addorupdateReaction);
router.get("/:podcastId/reactions", podcastReactionController.getReactionCountsByPodcastId);
router.get("/:id/reaction/:member_id", podcastReactionController.getUserReaction);
router.get("/reaction-stats", podcastController.getPodcastReactions);

router.get("/admin", authenticateToken, (req, res, next) => {
    req.isAuthenticated = true,
        next();
}, podcastController.getAllPodcasts);

// Public
router.get("/", podcastController.getAllPodcasts);
router.get("/:id", podcastController.getPodcastById);
router.get("/stream-audio/:fileName", podcastController.streamAudio);

router.use(authenticateToken);


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
