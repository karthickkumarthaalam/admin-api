const router = require("express").Router();
const controller = require("../controllers/CrewMDocumentController");
const upload = require("../middlewares/crewUpload");

router.post(
  "/upload",
  upload.single("file"),
  controller.uploadCrewManagementDocument,
);

router.post(
  "/upload-multiple",
  upload.array("files", 20),
  controller.uploadCrewManagementMultipleDocuments,
);

router.get("/:crew_management_id", controller.getCrewManagementDocuments);

router.delete("/:id", controller.deleteCrewManagementDocument);

module.exports = router;
