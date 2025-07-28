const express = require("express");
const router = express.Router();
const budgetUnitsController = require("../controllers/budgetUnitsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.get("/", budgetUnitsController.listBudgetUnits);
router.post("/", budgetUnitsController.createBudgetUnits);
router.patch("/:id", budgetUnitsController.updateBudgetUnits);
router.delete("/:id", budgetUnitsController.deleteBudgetUnits);

module.exports = router;