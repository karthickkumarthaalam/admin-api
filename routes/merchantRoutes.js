const express = require("express");
const router = express.Router();
const merchantController = require("../controllers/merchantController");

router.post("/", merchantController.createMerchant);
router.get("/", merchantController.listMerchantName);

module.exports = router;