const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const upload = require("../middlewares/uploadPdf");


router.post("/", expenseController.createExpenseWithCategories);
router.get("/", expenseController.getAllExpenses);
router.get("/document-no", expenseController.getNextDocumentNumber);
router.get("/:id", expenseController.getExpenseById);
router.put("/:id", expenseController.updateExpenseWithCategories);
router.patch("/:id/status", expenseController.updateExpenseStatus);
router.delete("/:id", expenseController.deleteExpense);
router.patch("/category/:id/status", expenseController.updateExpenseCategoryStatus);
router.post("/category/:id/add-bill", upload.fields([{ name: "bill", maxCount: 1 }]), expenseController.updateCategoryBill);
router.delete("/category/:id/delete-bill", expenseController.deleteBill);

module.exports = router;
