const express = require("express");
const router = express.Router();
const programQuestion = require("../controllers/programQuestionController");

router.post("/", programQuestion.createProgramQuesiton);
router.get("/program/:radio_program_id", programQuestion.getProgramQuestions);

router.get(
  "/program/:radio_program_id/active",
  programQuestion.getActiveProgramQuestionsPublic
);

router.post("/vote", programQuestion.voteForQuestion);
router.get("/results/:question_id", programQuestion.getQuestionResults);
router.post("/feedback/:question_id", programQuestion.postFeedback);

router.put("/:id", programQuestion.updateProgramQuestion);
router.patch("/:id/status", programQuestion.updateStatus);
router.delete("/:id", programQuestion.deleteQuestion);

module.exports = router;
