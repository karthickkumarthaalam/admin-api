const express = require("express");
const router = express.Router();
const podcastController = require("../controllers/podcastsController");
const podcastUpload = require("../middlewares/uploadPodcastFiles");
const podcastCommentController = require("../controllers/podcastCommentController");
const podcastReactionController = require("../controllers/podcastReactionController");
const { authenticateToken } = require("../middlewares/authMiddleware");

/*-----------------
#Meta data route
--------------------*/
router.get("/:slug/meta-data", podcastController.getMetaData);

/*-----------------
#comments route
-------------------*/
router.post("/comments", podcastCommentController.addComment);
router.get(
  "/comments",
  authenticateToken,
  podcastCommentController.commentList,
);
router.patch(
  "/comments/:comment_id/status",
  podcastCommentController.updateCommentStatus,
);
router.get("/:id/comments", podcastCommentController.getCommentByPodcast);
router.delete("/:comment_id/comments", podcastCommentController.deleteComment);

/*-----------------
#reactions route
----------------- */

router.post("/reaction", podcastReactionController.addorupdateReaction);
router.post("/reaction/:id/view", podcastReactionController.addPodcastView);
router.post("/reaction/:id/share", podcastReactionController.addPodcastShare);
router.get(
  "/:podcastId/reactions",
  podcastReactionController.getReactionCountsByPodcastId,
);
router.get(
  "/:id/reaction/:member_id",
  podcastReactionController.getUserReaction,
);
router.get("/reaction-stats", podcastController.getPodcastReactions);

router.get(
  "/admin",
  authenticateToken,
  (req, res, next) => {
    ((req.isAuthenticated = true), next());
  },
  podcastController.getAllPodcasts,
);

/*-----------------
 #Public route
-------------------*/
router.get("/", podcastController.getAllPodcasts);
router.get("/:id", podcastController.getPodcastById);

/*-----------------
#Admin route
-------------------*/
router.use(authenticateToken);

router.post(
  "/create",
  podcastUpload.fields([{ name: "image", maxCount: 1 }]),
  podcastController.createPodcast,
);
router.put(
  "/:id/audio",
  podcastUpload.fields([{ name: "audio", maxCount: 1 }]),
  podcastController.uploadPodcastAudio,
);

router.delete("/:id/audio", podcastController.deletePodcastAudio);

router.put(
  "/:id/video",
  podcastUpload.fields([{ name: "video", maxCount: 1 }]),
  podcastController.uploadPodcastVideo,
);

router.delete("/:id/video", podcastController.deletePodcastVideo);

router.put(
  "/update/:id",
  podcastUpload.fields([{ name: "image", maxCount: 1 }]),
  podcastController.updatePodcast,
);
router.patch("/status/:id", podcastController.updatePodcastStatus);
router.delete("/delete/:id", podcastController.deletePodcast);

module.exports = router;
