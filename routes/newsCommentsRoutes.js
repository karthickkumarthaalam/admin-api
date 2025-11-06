const express = require("express");
const router = express.Router();
const newsCommentController = require("../controllers/newsCommentsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/", newsCommentController.addComments);

router.get("/", authenticateToken, newsCommentController.commentList);

router.put(
  "/:comment_id/status",
  authenticateToken,
  newsCommentController.updateCommentStatus
);

router.delete(
  "/:comment_id",
  authenticateToken,
  newsCommentController.deleteComment
);

router.get("/news/:id", newsCommentController.getCommentByNews);

module.exports = router;
