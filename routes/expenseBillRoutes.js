const express = require("express");
const router = express.Router();

const expenseBillController = require("../controllers/expenseBillsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const uploadBills = require("../middlewares/uploadBills");

router.use(authenticateToken);

router.post("/", uploadBills, expenseBillController.createExpenseBill);
router.get("/", expenseBillController.getAllExpenseBills);
router.get("/:id", expenseBillController.getExpenseBillById);
router.put("/:id", uploadBills, expenseBillController.updateExpenseBill);
router.delete("/:id", expenseBillController.deleteExpenseBill);
router.delete(
  "/delete-bill-item/:billId",
  expenseBillController.deleteBillItem
);

module.exports = router;
