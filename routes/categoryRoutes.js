const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", categoryController.createCategory);
router.get("/", categoryController.listCategory);

module.exports = router;