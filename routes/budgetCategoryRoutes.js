const express = require("express");
const router = express.Router();
const budgetCategoryController = require("../controllers/budgetCategoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", budgetCategoryController.createCategory);
router.get("/", budgetCategoryController.getCategories);
router.get("/:category_name", budgetCategoryController.getSubCategoriesByCategoryName);
router.patch("/:id", budgetCategoryController.updateCategories);
router.delete("/:id", budgetCategoryController.deleteCategories);



module.exports = router;