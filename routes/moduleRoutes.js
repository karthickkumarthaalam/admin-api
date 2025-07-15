const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/modulesController");

router.post("/", moduleController.createModule);
router.get("/", moduleController.getAllModules);
router.put("/:id", moduleController.updateModule);
router.delete("/:id", moduleController.deleteModule);

module.exports = router;
