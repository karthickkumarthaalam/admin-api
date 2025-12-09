const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const uploadImage = require("../middlewares/uploadImages");

router.get("/per-slug/:slug", newsController.getNewsBySlug);
router.get("/related-news/:category", newsController.getRelatedNews);
router.get("/", newsController.getAllNews);
router.get("/admin-list", authenticateToken, newsController.getAllNews);
router.get("/:id", newsController.getNewsById);

router.use(authenticateToken);

router.post(
  "/create",
  uploadImage("uploads/news", {
    mode: "fields",
    fieldsConfig: [{ name: "cover_image", maxCount: 1 }],
  }),
  newsController.createNews
);
router.patch(
  "/:id",
  uploadImage("uploads/news", {
    mode: "fields",
    fieldsConfig: [{ name: "cover_image", maxCount: 1 }],
  }),
  newsController.updateNews
);
router.delete("/:id", newsController.deleteNews);
router.patch("/status/:id", newsController.updateNewsStatus);

module.exports = router;
