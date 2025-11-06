const express = require("express");
const router = express.Router();
const eventCrewMemberController = require("../controllers/eventCrewMembersController");
const uploadImage = require("../middlewares/uploadImages");
const { authenticateToken } = require("../middlewares/authMiddleware");

router.post(
  "/",
  authenticateToken,
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "image", maxCount: 1 }],
  }),
  eventCrewMemberController.addCrewMember
);

router.put(
  "/:id",
  authenticateToken,
  uploadImage("uploads/events", {
    mode: "fields",
    fieldsConfig: [{ name: "image", maxCount: 1 }],
  }),
  eventCrewMemberController.updateCrewMember
);

router.get(
  "/event/:event_id",
  authenticateToken,
  eventCrewMemberController.listCrewMembersByEventId
);

router.delete(
  "/:id",
  authenticateToken,
  eventCrewMemberController.deleteCrewMember
);

module.exports = router;
