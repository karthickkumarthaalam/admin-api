const { CrewDocument } = require("../models");
const { uploadToR2, deleteFromR2 } = require("../services/crewUpload");

exports.uploadCrewMultipleDocuments = async (req, res) => {
  try {
    const { crew_list_id, document_type } = req.body;

    if (!crew_list_id || !document_type) {
      return res.status(400).json({
        success: false,
        message: "crew_list_id and document_type required",
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
        `crew-documents/${document_type}`,
        file.originalname,
        file.mimetype,
      );

      const doc = await CrewDocument.create({
        crew_list_id,
        document_type,
        file_url: fileUrl,
        file_name: file.originalname,
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

exports.uploadCrewDocument = async (req, res) => {
  try {
    const { crew_list_id, document_type } = req.body;

    if (!crew_list_id || !document_type) {
      return res.status(400).json({
        success: false,
        message: "crew_list_id & document_type required",
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
      `crew-documents/${document_type}`,
      req.file.originalname,
      req.file.mimetype,
    );

    const document = await CrewDocument.create({
      crew_list_id,
      document_type,
      file_url: fileUrl,
      file_name: req.file.originalname,
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

exports.getCrewDocuments = async (req, res) => {
  try {
    const { crew_list_id } = req.params;

    const docs = await CrewDocument.findAll({
      where: { crew_list_id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: docs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

exports.deleteCrewDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await CrewDocument.findByPk(id);
    if (!document) {
      return res.status(404).json({ success: false, message: "Not found" });
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
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
