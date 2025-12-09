const express = require("express");
const router = express.Router();
const controller = require("../controllers/rjController");

router.get(`/data/:slug`, controller.getRjDetails);
router.get(`/meta-tag/:slug`, controller.getMetaTag);

module.exports = router;
