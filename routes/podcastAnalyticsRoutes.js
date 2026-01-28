const express = require("express");
const router = express.Router();
const podcastAnalytics = require("../controllers/podcastAnalyticsController");

router.get("/creator/:creator_id", podcastAnalytics.getSimplePodcastReport);

router.get("/:id", podcastAnalytics.getPodcastAnalytics);

module.exports = router;
