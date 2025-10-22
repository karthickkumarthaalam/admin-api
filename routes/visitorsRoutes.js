const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorsController");

router.post("/", express.text({ type: "*/*" }), visitorController.trackVisit);
router.get("/all", visitorController.getAllVisitors);
router.get("/report", visitorController.getVisitorReport);

module.exports = router;
