const express = require("express");
const router = express.Router();
const programCategoryController = require("../controllers/programCategoryController");
const uploadImage = require("../middlewares/uploadImages");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.use(authenticateToken);
router.get("/", programCategoryController.getAllProgramCategories);

router.get("/:id", programCategoryController.getProgramCategoryById);

router.post(
  "/create",
  uploadImage("uploads/programBanner", {
    mode: "fields",
    fieldsConfig: [{ name: "image", maxCount: 1 }],
  }),
  programCategoryController.createProgramCategory
);

router.patch("/:id/status", programCategoryController.updateStatus);

router.patch(
  "/:id/image",
  uploadImage("uploads/programBanner", {
    mode: "fields",
    fieldsConfig: [{ name: "image", maxCount: 1 }],
  }),
  programCategoryController.updateCategoryImage
);

router.put(
  "/:id",
  uploadImage("uploads/programBanner", {
    mode: "fields",
    fieldsConfig: [{ name: "image", maxCount: 1 }],
  }),
  programCategoryController.updateProgramCategory
);

router.delete("/:id", programCategoryController.deleteProgramCategory);

module.exports = router;
