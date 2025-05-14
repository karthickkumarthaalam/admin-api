const express = require("express");
const router = express.Router();
const memberPackageController = require("../controllers/memberPackageController");


router.get("/", memberPackageController.getAllMemberPackages);
router.get('/:id/packages', memberPackageController.getPackagesByMemberId);
router.post("/details", memberPackageController.getMemberDetails);


module.exports = router;