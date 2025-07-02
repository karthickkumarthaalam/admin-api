const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");
const { authenticateToken, checkPermission } = require("../middlewares/authMiddleware");


router.post("/", packageController.createPackage);
router.get("/", packageController.getPackages);

router.get("/:id", packageController.getPackageById);
router.put("/:id", packageController.updatePackage);
router.delete("/:id", packageController.deletePackage);
router.patch("/:id", packageController.updatePackageStatus);


module.exports = router;