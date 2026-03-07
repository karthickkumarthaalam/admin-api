const { CrewManagementDocument } = require("../models");
const { uploadToR2, deleteFromR2 } = require("../services/crewUpload");

exports.uploadCrewManagementMultipleDocuments = async (req, res) => {
  try {
    const { crew_management_id, document_type } = req.body;

    if (!crew_management_id || !document_type) {
      return res.status(400).json({
        success: false,
        message: "crew_management_id and document_type required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const uploadedDocs = [];

    for (const file of req.files) {
      const fileUrl = await uploadToR2(
        file.buffer,
        `crew-management-documents/${document_type}`,
        file.originalname,
        file.mimetype,
      );

      const doc = await CrewManagementDocument.create({
        crew_management_id,
        document_type,
        file_url: fileUrl,
      });

      uploadedDocs.push(doc);
    }

    res.status(201).json({
      success: true,
      message: "Documents uploaded successfully",
      data: uploadedDocs,
    });
  } catch (error) {
    console.error("Upload multiple error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

exports.uploadCrewManagementDocument = async (req, res) => {
  try {
    const { crew_management_id, document_type } = req.body;

    if (!crew_management_id || !document_type) {
      return res.status(400).json({
        success: false,
        message: "crew_management_id & document_type required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File required",
      });
    }

    const fileUrl = await uploadToR2(
      req.file.buffer,
      `crew-management-documents/${document_type}`,
      req.file.originalname,
      req.file.mimetype,
    );

    const document = await CrewManagementDocument.create({
      crew_management_id,
      document_type,
      file_url: fileUrl,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded",
      data: document,
    });
  } catch (error) {
    console.error("Upload single error:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};

exports.getCrewManagementDocuments = async (req, res) => {
  try {
    const { crew_management_id } = req.params;

    const docs = await CrewManagementDocument.findAll({
      where: { crew_management_id },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: docs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Fetch failed",
    });
  }
};

exports.deleteCrewManagementDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await CrewManagementDocument.findByPk(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const key = document.file_url.replace(`${process.env.R2_PUBLIC_URL}/`, "");

    await deleteFromR2(key);
    await document.destroy();

    res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};
