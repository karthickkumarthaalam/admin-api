// controllers/employeeDocumentsController.js
const db = require("../models");
const fs = require("fs");
const { EmployeeDocuments } = db;
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");

exports.uploadEmployeeDocument = async (req, res) => {
  const file = req.file;
  let { system_user_id, user_id, doc_type, notes } = req.body;

  const tempFilePath = file?.path;

  if (!file || !doc_type) {
    if (tempFilePath) fs.unlink(tempFilePath, () => {});
    return res.status(400).json({
      message: "doc_type and file are required",
    });
  }

  try {
    if (user_id) {
      const systemUser = await db.SystemUsers.findOne({
        where: { user_id },
      });

      if (!systemUser) {
        if (tempFilePath) fs.unlink(tempFilePath, () => {});
        return res.status(404).json({
          message: "No system user found for given user_id",
        });
      }

      system_user_id = systemUser.id;
    }

    // Final validation
    if (!system_user_id) {
      if (tempFilePath) fs.unlink(tempFilePath, () => {});
      return res.status(400).json({
        message: "system_user_id or user_id is required",
      });
    }

    const remoteFolder = "employee_docs";
    const remoteFileName = `${Date.now()}_${file.originalname}`;

    const fileUrl = await uploadToCpanel(
      tempFilePath,
      remoteFolder,
      remoteFileName
    );

    const document = await EmployeeDocuments.create({
      system_user_id,
      doc_type,
      file_name: remoteFileName,
      file_url: fileUrl,
      uploaded_by: req.user?.id || null,
      notes: notes || null,
    });

    fs.unlink(tempFilePath, () => {});

    res.status(201).json({
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);

    if (tempFilePath) fs.unlink(tempFilePath, () => {});

    res.status(500).json({
      message: "Failed to upload employee document",
      error: error.message,
    });
  }
};

exports.getEmployeeDocuments = async (req, res) => {
  try {
    const { system_user_id, user_id } = req.query;

    let whereClause;

    if (system_user_id) {
      whereClause = {
        system_user_id,
      };
    }

    if (user_id) {
      const systemUser = await db.SystemUsers.findOne({
        where: {
          user_id,
        },
      });

      if (!systemUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      whereClause = {
        system_user_id: systemUser.id,
      };
    }

    const documents = await EmployeeDocuments.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ data: documents });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

exports.verifyEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await EmployeeDocuments.findByPk(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    await doc.update({ verified: true });

    res.status(200).json({
      message: "Document verified successfully",
      data: doc,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to verify document",
      error: error.message,
    });
  }
};

exports.deleteEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await EmployeeDocuments.findByPk(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const remoteFolder = "employee_docs";
    await deleteFromCpanel(remoteFolder, doc.file_name);
    await doc.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete document",
      error: error.message,
    });
  }
};
