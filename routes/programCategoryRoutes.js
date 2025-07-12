const express = require("express");
const router = express.Router();
const programCategoryController = require("../controllers/programCategoryController");

router.get("/", programCategoryController.getAllProgramCategories);

router.get("/:id", programCategoryController.getProgramCategoryById);

router.post("/create", programCategoryController.createProgramCategory);

router.patch("/:id/status", programCategoryController.updateStatus);

router.put("/:id", programCategoryController.updateProgramCategory);

router.delete("/:id", programCategoryController.deleteProgramCategory);

module.exports = router;
