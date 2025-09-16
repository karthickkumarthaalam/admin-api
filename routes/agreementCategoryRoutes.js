const express = require("express");
const router = express.Router();
const AgreementCategoryController = require("../controllers/agreementCategory");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);

router.post("/", AgreementCategoryController.createCategory);
router.get("/", AgreementCategoryController.getAllCategory);
router.put("/:id", AgreementCategoryController.updateCategory);
router.delete("/:id", AgreementCategoryController.deleteCategory);
router.post("/restore/:id", AgreementCategoryController.restoreCategory);

module.exports = router;
