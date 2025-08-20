const express = require("express");
const routes = express.Router();
const upload = require("../middlewares/uploadPdf");
const careerController = require("../controllers/careersController");

routes.post("/",
    upload.fields([{ name: "resume", maxCount: 1 }]),
    careerController.createApplication);
routes.get("/", careerController.getAllApplications);

module.exports = routes;