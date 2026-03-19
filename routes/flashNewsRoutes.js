const express = require("express");
const router = express.Router();
const flashNewsController = require("../controllers/flashNewsController");

router.post("/", flashNewsController.createFlashNews);
router.get("/", flashNewsController.getFlashNews);
router.get("/program/:programId", flashNewsController.getFlashNewsByCategory);
router.put("/:id", flashNewsController.updateFlashNews);
router.delete("/:id", flashNewsController.deleteFlashNews);
router.patch("/:id/status", flashNewsController.updateFlashNewsStatus);

module.exports = router;
