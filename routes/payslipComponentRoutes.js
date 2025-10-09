const express = require("express");
const router = express.Router();
const payslipComponentController = require("../controllers/payslipComponentController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.get("/", payslipComponentController.getAllPayslipComponents);
router.get("/:id", payslipComponentController.getPayslipComponentById);
router.post("/", payslipComponentController.createPayslipComponent);
router.patch("/:id", payslipComponentController.updateComponent);
router.delete("/:id", payslipComponentController.deleteComponent);

module.exports = router;
