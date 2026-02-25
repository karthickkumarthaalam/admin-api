const express = require("express");
const router = express.Router();
const crewMerchantController = require("../controllers/crewMerchantController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/", authenticateToken, crewMerchantController.createCrewMerchant);
router.get("/", crewMerchantController.getAllCrewMerchants);
router.get("/merchant-type", crewMerchantController.getMerchantByType);
router.put("/:id", crewMerchantController.updateCrewMerchant);
router.delete("/:id", crewMerchantController.deleteCrewMerchant);

module.exports = router;
