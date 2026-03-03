const express = require("express");
const router = express.Router();

const controller = require("../controllers/crewDocumentController");
const upload = require("../middlewares/crewUpload");

router.post("/upload", upload.single("file"), controller.uploadCrewDocument);

router.post(
  "/upload-multiple",
  upload.array("files", 20),
  controller.uploadCrewMultipleDocuments,
);

router.get("/:crew_list_id", controller.getCrewDocuments);

router.delete("/:id", controller.deleteCrewDocument);

module.exports = router;
