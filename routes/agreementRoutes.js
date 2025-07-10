const express = require("express");
const router = express.Router();
const agreementController = require("../controllers/agreementController");
const upload = require("../middlewares/uploadPdf");

router.post(
    "/create",
    upload.fields([{ name: "pdf", maxCount: 1 }]),
    agreementController.createAgreement
);

router.put(
    "/update/:id",
    upload.fields([{ name: "pdf", maxCount: 1 }]),
    agreementController.updateAgreement
);

router.post("/upload-agreement-pdf/:id",
    upload.fields([{ name: "pdf", maxCount: 1 }]),
    agreementController.uploadPdfFile
);

router.post(
    "/upload-signed-pdf/:id",
    upload.fields([{ name: "signed_pdf", maxCount: 1 }]),
    agreementController.uploadSignedPdf
);

router.delete("/delete/:id", agreementController.deleteAgreement);

router.get("/list", agreementController.getAllAgreements);

router.get("/get/:id", agreementController.getAgreementById);

router.get("/last-dcoument-number", agreementController.getLastDocumentNumber);

router.delete("/delete-pdf/:id/:type", agreementController.deleteAgreementPdf);


module.exports = router;
