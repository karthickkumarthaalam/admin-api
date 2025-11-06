const express = require("express");
const router = express.Router();
const newsMediaController = require("../controllers/newsMediaController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const uploadImages = require("../middlewares/uploadImages");

// ✅ Public route — list media by news_id
router.get("/by-news/:news_id", newsMediaController.getNewsMediaByNewsId);

// ✅ Protected routes — only authenticated users can upload/update/delete
router.use(authenticateToken);

// Create new media (single upload only)
router.post(
  "/create",
  uploadImages("uploads/news-media", {
    mode: "fields",
    fieldsConfig: [{ name: "media", maxCount: 1 }],
  }),
  newsMediaController.createNewsMedia
);

// Update an existing media item
router.patch(
  "/:id",
  uploadImages("uploads/news-media", {
    mode: "fields",
    fieldsConfig: [{ name: "media", maxCount: 1 }],
  }),
  newsMediaController.updateNewsMedia
);

// Delete media by ID
router.delete("/:id", newsMediaController.deleteNewsMedia);

module.exports = router;
