const express = require("express");
const router = express.Router();
const controller = require("../controllers/crewMemberController");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/", controller.createCrewMember);

router.post("/upload-excel", upload.single("file"), controller.uploadCrewExcel);

router.get("/event/:crew_management_id", controller.getCrewByManagementId);
router.get("/:id", controller.getCrewById);
router.patch("/status/:id", controller.updateCrewMemberStatus);
router.put("/:id", controller.updateCrewMember);
router.delete("/:id", controller.deleteCrewMember);

module.exports = router;
