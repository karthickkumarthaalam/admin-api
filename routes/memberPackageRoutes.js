const express = require("express");
const router = express.Router();
const memberPackageController = require("../controllers/memberPackageController");


router.get("/", memberPackageController.getAllMemberPackages);


module.exports = router;