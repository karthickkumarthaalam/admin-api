const express = require("express");
const router = express.Router();
const newsReactionController = require("../controllers/newsReactionController");

// ➕ Add or update reaction (like/dislike)
router.post("/", newsReactionController.addReaction);

// ❌ Remove reaction
router.delete("/", newsReactionController.removeReaction);

// 📊 Get total likes/dislikes by news_id
router.get("/:news_id", newsReactionController.getReactionsByNewsId);

module.exports = router;
