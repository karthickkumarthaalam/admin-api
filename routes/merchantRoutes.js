const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", merchantController.createMerchant);
router.get("/", merchantController.listMerchantName);
router.put("/:id", merchantController.updateMerchant);
router.delete("/:id", merchantController.deleteMerchant);

module.exports = router;