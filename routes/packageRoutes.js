const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");
const { authenticateToken, checkPermission } = require("../middlewares/authMiddleware");


router.post("/", authenticateToken, checkPermission("packages"), packageController.createPackage);
router.get("/", packageController.getPackages);

router.get("/:id", packageController.getPackageById);
router.put("/:id", authenticateToken, checkPermission("packages"), packageController.updatePackage);
router.delete("/:id", authenticateToken, checkPermission("packages"), packageController.deletePackage);
router.patch("/:id", authenticateToken, checkPermission("packages"), packageController.updatePackageStatus);


module.exports = router;