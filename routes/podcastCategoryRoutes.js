const express = require("express");
const router = express.Router();
const podcastCategoryController = require("../controllers/podcastCategoryController");
const podcastUpload = require("../middlewares/uploadPodcastFiles");

router.get("/", podcastCategoryController.getAllCategory);
router.post(
  "/",
  podcastUpload.fields([{ name: "image", maxCount: 1 }]),
  podcastCategoryController.createCategory
);
router.patch(
  "/:id",
  podcastUpload.fields([{ name: "image", maxCount: 1 }]),
  podcastCategoryController.updateCategory
);
router.delete("/:id", podcastCategoryController.deleteCategory);

module.exports = router;
