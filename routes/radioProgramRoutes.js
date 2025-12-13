const express = require("express");
const router = express.Router();
const radioProgramController = require("../controllers/radioProgramController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.get("/live-program", radioProgramController.getCurrentProgram);
router.post("/", authenticateToken, radioProgramController.createRadioProgram);
router.get("/", authenticateToken, radioProgramController.getAllRadioPrograms);
router.get(
  "/:id",
  authenticateToken,
  radioProgramController.getRadioProgramById
);
router.patch(
  "/:id",
  authenticateToken,
  radioProgramController.updateRadioProgram
);
router.patch(
  "/:id/status",
  authenticateToken,
  radioProgramController.updateProgramStatus
);
router.delete(
  "/:id",
  authenticateToken,
  radioProgramController.deleteRadioProgram
);

module.exports = router;
