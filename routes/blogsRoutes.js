const express = require("express");
const router = express.Router();
const blogsController = require("../controllers/blogsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const uploadImage = require("../middlewares/uploadImages");

router.get("/per-slug/:slug", blogsController.getBlogBySlug);
router.get("/related-blogs/:category", blogsController.getRelatedBlogs);
router.get("/", blogsController.getAllBlogs);
router.get("/admin-list", authenticateToken, blogsController.getAllBlogs);
router.get("/:id", blogsController.getBlogById);

router.use(authenticateToken);

router.post(
  "/create",
  uploadImage("uploads/blogs", {
    mode: "fields",
    fieldsConfig: [{ name: "cover_image", maxCount: 1 }],
  }),
  blogsController.createBlog
);
router.patch(
  "/:id",
  uploadImage("uploads/blogs", {
    mode: "fields",
    fieldsConfig: [{ name: "cover_image", maxCount: 1 }],
  }),
  blogsController.updateBlog
);
router.delete("/:id", blogsController.deleteBlog);
router.patch("/status/:id", blogsController.updateBlogStatus);

module.exports = router;
