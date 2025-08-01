const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", categoryController.createCategory);
router.get("/", categoryController.listCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;