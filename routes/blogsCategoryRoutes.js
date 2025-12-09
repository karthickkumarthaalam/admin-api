const express = require("express");
const router = express.Router();
const blogsCategoryController = require("../controllers/blogsCategoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get("/category-list", blogsCategoryController.getCategoryList);

router.use(authenticateToken);

router.post("/", blogsCategoryController.createBlogsCategory);
router.get("/", blogsCategoryController.getCategories);
router.get("/list", blogsCategoryController.getCategoryList);
router.get(
  "/:category_name",
  blogsCategoryController.getSubCategoriesByCategoryName
);
router.patch("/:id", blogsCategoryController.updateCategories);
router.delete("/:id", blogsCategoryController.deleteCategory);

module.exports = router;
