const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const budgetItemsController = require("../controllers/budgetItemsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.get("/next-budget_id", budgetController.getNextBudgetId);
router.post("/", budgetController.createBudget);
router.get("/", budgetController.getAllBudgets);
router.get("/:id", budgetController.getBudgetById);
router.patch("/:id", budgetController.updateBudget);
router.delete("/:id", budgetController.deleteBudget);

router.patch("/:id/restore", authenticateToken, budgetController.restoreBudget);

router.post("/apply-tax", budgetController.applyBudgetTax);
router.get("/budget-tax/:budget_id", budgetController.getBudgetTax);

router.post("/budget-items", budgetItemsController.createBudgetItems);
router.get("/budget-items/:budget_id", budgetItemsController.getBudgetItemsByBudgetId);
router.patch("/budget-items/:budget_id", budgetItemsController.updateBudgetItems);

router.post("/duplicate/:budgetId", budgetController.duplicateBudget);


module.exports = router;