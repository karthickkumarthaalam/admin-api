const db = require("../models");
const fs = require("fs");
const pagination = require("../utils/pagination");
const {
  uploadToCpanel,
  deleteFromCpanel,
} = require("../services/uploadToCpanel");
const { ProgramCategory } = db;
const auditLogs = require("../controllers/auditLogsController");
const getDiff = require("../utils/getDiff");

// Create Program Category
exports.createProgramCategory = async (req, res) => {
  const image = req.files["image"] ? req.files["image"][0] : null;
  try {
    const { category, start_time, end_time, country } = req.body;

    if (!category || !start_time || !end_time) {
      return res.status(400).json({
        status: "error",
        message: "Category, Start Time and End Time are required.",
      });
    }

    let image_url = null;

    if (image && image.path) {
      image_url = await uploadToCpanel(
        image.path,
        "programBanner/images",
        image.originalname
      );
      fs.unlinkSync(image.path);
    }

    const programCategory = await ProgramCategory.create({
      category,
      start_time,
      end_time,
      country,
      image_url,
      status: "in-active",
    });

    // AUDIT
    await auditLogs({
      entity_type: "Program Category",
      entity_id: programCategory.id,
      action: "create",
      changed_by: req.user.id,
      changes: programCategory.dataValues,
      description: "Program Category created",
    });

    res.status(201).json({
      status: "success",
      message: "Program Category created successfully",
      data: programCategory,
    });
  } catch (error) {
    if (image && fs.existsSync(image.path)) fs.unlinkSync(image.path);
    res.status(500).json({
      status: "error",
      message: "Failed to create Program Category",
      error: error.message,
    });
  }
};

// Get All Program Categories with Pagination
exports.getAllProgramCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let whereCondition = {};

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    const result = await pagination(ProgramCategory, {
      page,
      limit,
      where: whereCondition,
      order: [["start_time", "ASC"]],
    });

    return res.status(200).json({
      status: "success",
      message: "Program Categories fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Program Categories",
      error: error.message,
    });
  }
};

// Get by ID
exports.getProgramCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const programCategory = await ProgramCategory.findByPk(id);

    if (!programCategory) {
      return res
        .status(404)
        .json({ status: "error", message: "Program Category not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Program Category fetched successfully",
      data: programCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch Program Category",
      error: error.message,
    });
  }
};

// Update Status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "in-active"].includes(status)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status value." });
    }

    const programCategory = await ProgramCategory.findByPk(id);

    if (!programCategory) {
      return res
        .status(404)
        .json({ status: "error", message: "Program Category not found" });
    }

    const oldData = { status: programCategory.status };

    programCategory.status = status;
    await programCategory.save();

    await auditLogs({
      entity_type: "Program Category",
      entity_id: programCategory.id,
      action: "update-status",
      changed_by: req.user.id,
      changes: getDiff(oldData, { status }),
      description: "Program Category status updated",
    });

    return res.status(200).json({
      status: "success",
      message: "Program Category status updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to update status",
      error: error.message,
    });
  }
};

// Update Program Category
exports.updateProgramCategory = async (req, res) => {
  const image = req.files["image"] ? req.files["image"][0] : null;
  try {
    const { id } = req.params;
    const { category, start_time, end_time, country } = req.body;

    const programCategory = await ProgramCategory.findByPk(id);

    if (!programCategory) {
      return res
        .status(404)
        .json({ status: "error", message: "Program Category not found" });
    }

    const oldData = { ...programCategory.dataValues };

    if (image && image.path) {
      const serverPath = "programBanner/images";
      if (programCategory.image_url) {
        const filename = programCategory.image_url.split("/").pop();
        await deleteFromCpanel(serverPath, filename);
      }

      let image_url = await uploadToCpanel(
        image.path,
        serverPath,
        image.originalname
      );
      programCategory.image_url = image_url;
      fs.unlinkSync(image.path);
    }
    if (req.body.remove_image === "true") {
      programCategory.image_url = null;
    }

    programCategory.category = category || programCategory.category;
    programCategory.start_time = start_time || programCategory.start_time;
    programCategory.end_time = end_time || programCategory.end_time;
    programCategory.country = country || programCategory.country;

    await programCategory.save();

    await auditLogs({
      entity_type: "Program Category",
      entity_id: programCategory.id,
      action: "update",
      changed_by: req.user.id,
      changes: getDiff(oldData, programCategory.dataValues),
      description: "Program Category updated",
    });

    return res.status(200).json({
      status: "success",
      message: "Program Category updated successfully",
      data: programCategory,
    });
  } catch (error) {
    if (image && fs.existsSync(image.path)) fs.unlinkSync(image.path);
    res.status(500).json({
      status: "error",
      message: "Failed to update Program Category",
      error: error.message,
    });
  }
};

// Delete Program Category
exports.deleteProgramCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const programCategory = await ProgramCategory.findByPk(id);

    const oldData = { ...programCategory.dataValues };

    if (!programCategory) {
      return res
        .status(404)
        .json({ status: "error", message: "Program Category not found" });
    }

    await programCategory.destroy();

    await auditLogs({
      entity_type: "Program Category",
      entity_id: oldData.id,
      action: "delete",
      changed_by: req.user.id,
      changes: oldData,
      description: "Program Category deleted",
    });

    return res.status(200).json({
      status: "success",
      message: "Program Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete Program Category",
      error: error.message,
    });
  }
};

exports.updateCategoryImage = async (req, res) => {
  const image = req.files?.["image"]?.[0];

  try {
    const { id } = req.params;

    if (!image) {
      return res.status(400).json({ message: "No image uploaded." });
    }

    const program = await ProgramCategory.findByPk(id);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    const oldData = { image_url: program.image_url };

    const serverPath = "programBanner/images";

    if (program.image_url) {
      try {
        const filename = program.image_url.split("/").pop();
        await deleteFromCpanel(serverPath, filename);
      } catch (err) {
        console.log("Old image delete failed:", err);
      }
    }

    const image_url = await uploadToCpanel(
      image.path,
      serverPath,
      image.originalname
    );

    program.image_url = image_url;
    await program.save();

    await auditLogs({
      entity_type: "Program Category",
      entity_id: program.id,
      action: "update-image",
      changed_by: req.user.id,
      changes: getDiff(oldData, { image_url }),
      description: "Program Category image updated",
    });

    if (fs.existsSync(image.path)) fs.unlinkSync(image.path);

    return res.status(200).json({
      message: "Program image updated successfully",
      image_url,
    });
  } catch (error) {
    if (image?.path && fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    return res.status(500).json({
      error: error.message,
      message: "Failed to update image",
    });
  }
};
