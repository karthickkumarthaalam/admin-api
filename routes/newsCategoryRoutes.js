const express = require("express");
const router = express.Router();
const newsCategoryController = require("../controllers/newsCategoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get("/category-list", newsCategoryController.getCategoryList);

router.use(authenticateToken);

router.post("/", newsCategoryController.createNewsCategories);
router.get("/", newsCategoryController.getCategories);
router.get("/list", newsCategoryController.getCategoryList);
router.get(
  "/:category_name",
  newsCategoryController.getSubCategoriesByCategoryName
);
router.patch("/:id", newsCategoryController.updateCategories);
router.delete("/:id", newsCategoryController.deleteCategory);

module.exports = router;
