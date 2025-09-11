const express = require("express");
const router = express.Router();
const financialYearController = require("../controllers/financialYearController");

const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", financialYearController.createFinancialYear);
router.get("/", financialYearController.getFinancialYears);
router.get("/:id", financialYearController.getFinancialYearById);
router.put("/:id", financialYearController.updateFinancialYear);
router.delete("/:id", financialYearController.deleteFinancialYear);
router.patch("/:id/restore", financialYearController.restoreFinancialYear);

module.exports = router;
