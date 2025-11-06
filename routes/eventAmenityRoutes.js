const express = require("express");
const router = express.Router();
const eventAmenityController = require("../controllers/eventAmenityController");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post("/", authenticateToken, eventAmenityController.addAmenity);

router.put("/:id", authenticateToken, eventAmenityController.updateAmenity);

router.get(
  "/event/:event_id",
  authenticateToken,
  eventAmenityController.listAmenitiesByEventId
);
router.delete("/:id", authenticateToken, eventAmenityController.deleteAmenity);

module.exports = router;
