const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const { verifyToken } = require("../middlewares/authMiddleware");


router.get("/", transactionController.getAllTransactions);
router.get("/buy-package-report", verifyToken, transactionController.getMemberPackageTransactions);

module.exports = router;