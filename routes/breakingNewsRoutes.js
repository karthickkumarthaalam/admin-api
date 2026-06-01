const express = require("express");
const router = express.Router();
const breakingNewsController = require("../controllers/breakingNewsController");

router.post("/", breakingNewsController.createBreakingNews);
router.get("/", breakingNewsController.getAllBreakingNews);
router.get("/active-news", breakingNewsController.getActiveNews);
router.get("/:id", breakingNewsController.getNewsById);
router.put("/:id", breakingNewsController.updateNews);
router.delete("/:id", breakingNewsController.deleteNews);

module.exports = router;
