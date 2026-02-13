const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventContactDetailsController");

router.post("/", controller.upsertContactDetails);
router.get("/:event_id", controller.getContactDetails);

module.exports = router;
