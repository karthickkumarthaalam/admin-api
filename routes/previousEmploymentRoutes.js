// routes/previousEmploymentRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/previousEmploymentController");

router.post("/", controller.createPreviousEmployment);
router.get("/", controller.getPreviousEmployments);
router.put("/:id", controller.updatePreviousEmployment);
router.delete("/:id", controller.deletePreviousEmployment);

module.exports = router;
