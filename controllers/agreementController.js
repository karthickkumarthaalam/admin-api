const db = require("../models");
const fs = require("fs");
const { uploadPdfFile, deletePdfFile } = require("../services/googleDriveService");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");
const { Agreement } = db;

exports.createAgreement = async (req, res) => {

    try {
        const { document_number, title, date, category } = req.body;

        if (!document_number || !title || !date || !category) {
            return res.status(400).json({ status: "error", message: "All fields are required" });
        }

        const agreement = await Agreement.create({
            document_number,
            title,
            date,
            category,
        });

        res.status(201).json({ status: "success", message: "Agreement created", data: agreement });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to create agreement" });
    }
};

exports.updateAgreement = async (req, res) => {

    try {
        const agreement = await Agreement.findByPk(req.params.id);
        if (!agreement) {
            return res.status(404).json({ status: "error", message: "Agreement not found" });
        }

        const { document_number, title, date, category } = req.body;

        agreement.document_number = document_number || agreement.document_number;
        agreement.title = title || agreement.title;
        agreement.date = date || agreement.date;
        agreement.category = category || agreement.category;

        await agreement.save();

        res.status(200).json({ status: "success", message: "Agreement updated", data: agreement });

    } catch (error) {
        res.status(500).json({ status: "error", message: "Failed to update agreement" });
    }
};

exports.uploadPdfFile = async (req, res) => {
    const pdfFile = req.files["pdf"] ? req.files["pdf"][0] : null;

    try {
        const agreement = await Agreement.findByPk(req.params.id);

        if (!agreement) {
            return res.status(404).json({ status: "error", message: "Agreement not found" });
        }

        if (!pdfFile) {
            return res.status(400).json({ status: "error", message: "PDF is required" });
        }

        if (agreement.pdf_drive_file_id) {
            await deletePdfFile(agreement.pdf_drive_file_id);
        }

        const pdfBuffer = fs.readFileSync(pdfFile.path);

        const pdfUpload = await uploadPdfFile(
            pdfBuffer,
            pdfFile.originalname,
            process.env.GOOGLE_DRIVE_AGREEMENT_FOLDER_ID
        );

        await agreement.update({
            pdf_drive_file_id: pdfUpload.id,
            pdf_drive_link: pdfUpload.webViewLink
        });

        fs.unlinkSync(pdfFile.path);

        res.status(200).json({
            status: "success",
            message: "PDF uploaded successfully",
            data: agreement,
        });


    } catch (error) {
        if (pdfFile && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to upload Pdf File" });
    }
};

exports.uploadSignedPdf = async (req, res) => {
    const signedPdf = req.files["signed_pdf"] ? req.files["signed_pdf"][0] : null;

    try {
        const agreement = await Agreement.findByPk(req.params.id);
        if (!agreement) {
            return res.status(404).json({ status: "error", message: "Agreement not found" });
        }

        if (!signedPdf) {
            return res.status(400).json({ status: "error", message: "Signed PDF is required" });
        }

        if (agreement.signed_pdf_drive_file_id) {
            await deletePdfFile(agreement.signed_pdf_drive_file_id);
        }

        const pdfBuffer = fs.readFileSync(signedPdf.path);
        const pdfUpload = await uploadPdfFile(
            pdfBuffer,
            signedPdf.originalname,
            process.env.GOOGLE_DRIVE_SIGNED_FOLDER_ID
        );

        await agreement.update({
            signed_pdf_drive_file_id: pdfUpload.id,
            signed_pdf_drive_link: pdfUpload.webViewLink,
        });

        fs.unlinkSync(signedPdf.path);

        res.status(200).json({
            status: "success",
            message: "Signed PDF uploaded successfully",
            data: agreement,
        });

    } catch (error) {
        if (signedPdf && fs.existsSync(signedPdf.path)) fs.unlinkSync(signedPdf.path);
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to upload signed PDF" });
    }
};

exports.deleteAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findByPk(req.params.id);
        if (!agreement) {
            return res.status(404).json({ status: "error", message: "Agreement not found" });
        }

        if (agreement.pdf_drive_file_id) {
            await deletePdfFile(agreement.pdf_drive_file_id);
        }

        if (agreement.signed_pdf_drive_file_id) {
            await deletePdfFile(agreement.signed_pdf_drive_file_id);
        }

        await agreement.destroy();

        res.status(200).json({ status: "success", message: "Agreement deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to delete agreement" });
    }
};

exports.getAllAgreements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        let whereCondition = {};

        if (req.query.search) {
            const searchQuery = `%${req.query.search}%`;

            whereCondition[Op.or] = [
                { document_number: { [Op.like]: searchQuery } },
                { title: { [Op.like]: searchQuery } }
            ];
        };

        const result = await pagination(Agreement, {
            page,
            limit,
            where: whereCondition
        });

        res.status(200).json({ status: "success", data: result.data, padination: result.pagination });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to fetch agreements" });
    }
};

exports.getAgreementById = async (req, res) => {
    try {
        const agreement = await Agreement.findByPk(req.params.id);
        if (!agreement) {
            return res.status(404).json({ status: "error", message: "Agreement not found" });
        }

        res.status(200).json({ status: "success", data: agreement });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Failed to fetch agreement" });
    }
};


exports.getLastDocumentNumber = async (req, res) => {
    const date = req.query.date;

    try {
        const lastAgreement = await Agreement.findOne({
            where: {
                document_number: { [Op.like]: `%${date}-%` }
            },
            order: [["createdAt", "DESC"]]
        });

        let lastNumber = 0;
        if (lastAgreement) {
            const parts = lastAgreement.document_number.split("-");
            lastNumber = parseInt(parts[1]);
        }

        res.json({ lastNumber });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch document number" });

    }
};

exports.deleteAgreementPdf = async (req, res) => {
    try {
        const { id, type } = req.params;
        const agreement = await Agreement.findByPk(id);
        if (!agreement) return res.status(404).json({ message: "Agreement not found" });

        let driveFileId;
        if (type === "pdf") {
            driveFileId = agreement.pdf_drive_file_id;
        } else if (type === "signed_pdf") {
            driveFileId = agreement.signed_pdf_drive_file_id;
        } else {
            return res.status(400).json({ message: "Invalid type specified" });
        }

        if (!driveFileId) return res.status(404).json({ message: "No file to delete" });

        await deletePdfFile(driveFileId);

        await agreement.update({
            [`${type}_drive_file_id`]: null,
            [`${type}_drive_link`]: null,
        });

        return res.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error("Delete PDF error:", error);
        res.status(500).json({ message: "Failed to delete file" });
    }
};