const express = require("express");
const router = express.Router();
const budgetTaxController = require("../controllers/budgetTaxController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", budgetTaxController.createTax);
router.get("/", budgetTaxController.getAllTaxes);
router.get("/:id", budgetTaxController.getTaxById);
router.patch("/:id", budgetTaxController.updateTax);
router.delete("/:id", budgetTaxController.deleteTax);
router.patch("/:id/toggle-status", budgetTaxController.toggleTaxStatus);

module.exports = router;
