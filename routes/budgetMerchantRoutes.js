const express = require("express");
const router = express.Router();
const budgetMerchantController = require("../controllers/budgetMerchantController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.get("/", budgetMerchantController.listBudgetMerchants);
router.post("/", budgetMerchantController.createMerchant);
router.patch("/:id", budgetMerchantController.updateBudgetMerchants);
router.delete("/:id", budgetMerchantController.deleteBudgetMerchant);

module.exports = router;