const express = require("express");
const router = express.Router();
const controller = require("../controllers/crewRoomsController");

router.post("/bulk-save", controller.bulkSaveRooms);
router.get("/:crew_list_id", controller.getRoomsByCrew);

module.exports = router;
