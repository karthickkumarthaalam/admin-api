const fs = require("fs");
const db = require("../models");
const pagination = require("../utils/pagination");
const auditLogs = require("../controllers/auditLogsController");
const getDiff = require("../utils/getDiff");
const { RadioStation } = db;

exports.createRadioStation = async (req, res) => {
  const logo = req.files["logo"] ? req.files["logo"][0] : null;
  try {
    const { station_name, radio_stream_url, country, play_type, redirect_url } =
      req.body;

    if (!station_name || !radio_stream_url) {
      return res.status(400).json({
        status: "error",
        message: "Need Station name and Radio Stream URL",
      });
    }

    if (!logo) {
      return res
        .status(400)
        .json({ status: "error", message: "Need Radio Logo" });
    }

    const radioStation = await RadioStation.create({
      station_name,
      radio_stream_url,
      country,
      logo: logo.path,
      status: "in-active",
      play_type,
      redirect_url,
    });

    await auditLogs({
      entity_type: "Radio Station",
      entity_id: radioStation.id,
      action: "create",
      changed_by: req.user.id,
      changes: radioStation.dataValues,
      description: "Radio Station Created",
    });

    res.status(201).json({
      status: "success",
      message: "Radio Station Created Successfully",
      data: radioStation,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create Radio Station",
      error: error.message,
    });
  }
};

exports.getAllRadioStation = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let whereCondition = {};

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    const result = await pagination(RadioStation, {
      page,
      limit,
      where: whereCondition,
    });

    return res.status(200).json({
      status: "success",
      message: "Radio Station Fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch Radio Station",
      error: error.message,
    });
  }
};

exports.getRadioStationById = async (req, res) => {
  try {
    const { id } = req.params;

    const radioStation = await RadioStation.findByPk(id);

    if (!radioStation) {
      return res
        .status(404)
        .json({ status: "error", message: "Radio Station Not Found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Radio Station Fetched successfully",
      data: radioStation,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch Radio Station",
      error: error.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "in-active"].includes(status)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status value." });
    }

    const radioStation = await RadioStation.findByPk(id);

    if (!radioStation) {
      return res
        .status(404)
        .json({ status: "error", message: "Radio Station not found" });
    }

    const oldData = { status: radioStation.status };

    radioStation.status = status;

    await radioStation.save();

    await auditLogs({
      entity_type: "Radio Station",
      entity_id: radioStation.id,
      action: "update-status",
      changed_by: req.user.id,
      changes: getDiff(oldData, { status }),
      description: "Radio Station status updated",
    });

    return res.status(200).json({
      status: "success",
      message: "Radio Station status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to updated Radio Station status",
      error: error.message,
    });
  }
};

exports.updateRadioStation = async (req, res) => {
  const { id } = req.params;
  try {
    const { station_name, radio_stream_url, country, redirect_url, play_type } =
      req.body;

    const radioStation = await RadioStation.findByPk(id);

    if (!radioStation) {
      return res
        .status(404)
        .json({ status: "error", message: "Radio Station not found" });
    }
    const oldData = { ...radioStation.dataValues };

    const logo = req.files["logo"] ? req.files["logo"][0] : null;

    if (logo && radioStation.logo) {
      fs.unlinkSync(radioStation.logo);
    }

    radioStation.station_name = station_name || radioStation.station_name;
    radioStation.radio_stream_url =
      radio_stream_url || radioStation.radio_stream_url;
    radioStation.country = country || radioStation.country;
    radioStation.redirect_url = redirect_url || radioStation.redirect_url;
    radioStation.play_type = play_type || radioStation.play_type;

    if (logo) {
      radioStation.logo = logo.path;
    }

    await radioStation.save();

    await auditLogs({
      entity_type: "Radio Station",
      entity_id: radioStation.id,
      action: "update",
      changed_by: req.user.id,
      changes: getDiff(oldData, radioStation.dataValues),
      description: "Radio Station updated",
    });

    return res.status(200).json({
      status: "success",
      message: "Radio Station updated successfully",
      data: radioStation,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update Radio Station",
      error: error.message,
    });
  }
};

exports.deleteRadioStation = async (req, res) => {
  const { id } = req.params;
  try {
    const radioStation = await RadioStation.findByPk(id);

    if (!radioStation) {
      return res
        .status(404)
        .json({ status: "error", message: "Radio Station not found" });
    }

    if (radioStation.logo) {
      fs.unlinkSync(radioStation.logo);
    }
    const oldData = { ...radioStation.dataValues };

    await radioStation.destroy();

    await auditLogs({
      entity_type: "Radio Station",
      entity_id: radioStation.id,
      action: "delete",
      changed_by: req.user.id,
      changes: oldData,
      description: "Radio Station deleted",
    });

    return res.status(200).json({
      status: "success",
      message: "Radio Station deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete Radio Station",
      error: error.message,
    });
  }
};
