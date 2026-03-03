const express = require("express");
const router = express.Router();
const controller = require("../controllers/crewRoomsController");

router.post(
  "/create",
  (req, res, next) => {
    console.log(req.body);
    next();
  },
  controller.createRoom,
);
router.put("/update/:id", controller.updateRoom);
router.delete("/delete/:id", controller.deleteRoom);

router.post("/bulk-save", controller.bulkSaveRooms);
router.get("/:crew_list_id", controller.getRoomsByCrew);

module.exports = router;
