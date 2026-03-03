const express = require("express");
const router = express.Router();
const controller = require("../controllers/crewVisaController");
const upload = require("../middlewares/uploadPdf");

router.post("/create", upload.single("visa_file"), controller.createVisa);
router.put("/update/:id", upload.single("visa_file"), controller.updateVisa);
router.delete("/delete/:id", controller.deleteVisa);

router.post("/bulk-save", upload.any(), controller.bulkSaveVisas);
router.get("/:crew_list_id", controller.getVisasByCrew);

module.exports = router;
