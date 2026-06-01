const express = require("express");
const router = express.Router();

const pollController = require("../controllers/pollController");

router.post("/", pollController.createPoll);

router.get("/active", pollController.getActivePoll);

router.get("/:poll_id/results", pollController.getPollResults);

router.get("/:poll_id/check-vote", pollController.checkUserVote);

router.post("/vote", pollController.submitVote);

router.get("/", pollController.getPolls);

router.get("/:id", pollController.getPollById);

router.put("/:id", pollController.updatePoll);

router.patch("/:id/status", pollController.updatePollStatus);

router.delete("/:id", pollController.deletePoll);

module.exports = router;
