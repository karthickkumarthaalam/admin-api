const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");

router.get("/podcast/:id", shareController.getPodcastMetaPage);

module.exports = router;
