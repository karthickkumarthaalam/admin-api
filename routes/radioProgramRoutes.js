const express = require("express");
const router = express.Router();
const radioProgramController = require("../controllers/radioProgramController");

router.post("/", radioProgramController.createRadioProgram);
router.get("/", radioProgramController.getAllRadioPrograms);
router.get("/:id", radioProgramController.getRadioProgramById);
router.patch("/:id", radioProgramController.updateRadioProgram);
router.patch("/:id/status", radioProgramController.updateProgramStatus);
router.delete("/:id", radioProgramController.deleteRadioProgram);


module.exports = router;
