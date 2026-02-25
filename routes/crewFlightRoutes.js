const express = require("express");
const router = express.Router();
const controller = require("../controllers/crewFlightController");
const upload = require("../middlewares/uploadPdf");

router.post("/bulk-save", upload.any(), controller.bulkSaveFlights);
router.get("/:crew_list_id", controller.getFlightsByCrew);

module.exports = router;
