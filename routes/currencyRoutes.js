const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");
const { authenticateToken, checkPermission } = require("../middlewares/authMiddleware");

// router.use(authenticateToken);
// router.use(checkPermission("packages"));

router.get("/", currencyController.getCurrencies);
router.post("/", currencyController.createCurrency);
router.put("/:id", currencyController.updateCurrencies);
router.delete("/:id", currencyController.deleteCurrency);


module.exports = router;