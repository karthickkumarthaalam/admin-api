const {
  RadioProgram,
  ProgramCategory,
  SystemUsers,
  RadioStation,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const pagination = require("../utils/pagination");
const moment = require("moment-timezone");

exports.createRadioProgram = async (req, res) => {
  try {
    const {
      program_category_id,
      rj_id,
      country,
      radio_station_id,
      broadcast_days,
      status,
    } = req.body;

    if (
      !program_category_id ||
      !rj_id ||
      !radio_station_id ||
      !broadcast_days
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newProgram = await RadioProgram.create({
      program_category_id,
      rj_id,
      country,
      radio_station_id,
      broadcast_days,
      status: status || "active",
    });

    res.status(201).json({
      message: "Radio program created successfully.",
      data: newProgram,
    });
  } catch (error) {
    console.error("Create Radio Program Error:", error);
    res.status(500).json({
      message: "Failed to create radio program.",
      error: error.message,
    });
  }
};

exports.getAllRadioPrograms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";

    const whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [{ country: { [Op.like]: `%${search}%` } }];
    }

    if (req.query.status) {
      whereCondition.status = req.query.status;
    }

    if (req.query.user_id) {
      const systemUser = await SystemUsers.findOne({
        where: {
          user_id: req.query.user_id,
        },
      });

      whereCondition.rj_id = systemUser.id;
    }

    const result = await pagination(RadioProgram, {
      page,
      limit,
      where: whereCondition,
      order: [
        [
          { model: ProgramCategory, as: "program_category" },
          "start_time",
          "ASC",
        ],
      ],
      include: [
        { model: ProgramCategory, as: "program_category" },
        { model: SystemUsers, as: "system_users" },
        { model: RadioStation, as: "radio_station" },
      ],
    });

    res.status(200).json({
      message: "Radio programs fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get All Radio Programs Error:", error);
    res.status(500).json({
      message: "Failed to fetch radio programs.",
      error: error.message,
    });
  }
};

exports.getRadioProgramById = async (req, res) => {
  try {
    const program = await RadioProgram.findByPk(req.params.id, {
      include: [
        { model: ProgramCategory, as: "program_category" },
        { model: SystemUsers, as: "system_users" },
        { model: RadioStation, as: "radio_station" },
      ],
    });

    if (!program) {
      return res.status(404).json({ message: "Radio program not found." });
    }

    res.status(200).json({ data: program });
  } catch (error) {
    console.error("Get Radio Program By ID Error:", error);
    res.status(500).json({
      message: "Failed to fetch radio program.",
      error: error.message,
    });
  }
};

exports.updateRadioProgram = async (req, res) => {
  try {
    const program = await RadioProgram.findByPk(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Radio program not found." });
    }

    const {
      program_category_id,
      rj_id,
      country,
      radio_station_id,
      broadcast_days,
      show_host_name,
      show_program_name,
      show_timing,
      show_host_profile,
      status,
    } = req.body;

    await program.update({
      program_category_id: program_category_id ?? program.program_category_id,
      rj_id: rj_id ?? program.rj_id,
      country: country ?? program.country,
      radio_station_id: radio_station_id ?? program.radio_station_id,
      broadcast_days: broadcast_days ?? program.broadcast_days,
      status: status ?? program.status,
      show_host_name:
        typeof show_host_name !== "undefined"
          ? show_host_name
          : program.show_host_name,
      show_program_name:
        typeof show_program_name !== "undefined"
          ? show_program_name
          : program.show_program_name,
      show_timing:
        typeof show_timing !== "undefined" ? show_timing : program.show_timing,
      show_host_profile:
        typeof show_host_profile !== "undefined"
          ? show_host_profile
          : program.show_host_profile,
    });

    res.status(200).json({
      message: "Radio program updated successfully.",
      data: program,
    });
  } catch (error) {
    console.error("Update Radio Program Error:", error);
    res.status(500).json({
      message: "Failed to update radio program.",
      error: error.message,
    });
  }
};

exports.updateProgramStatus = async (req, res) => {
  try {
    const program = await RadioProgram.findByPk(req.params.id);
    if (!program) {
      return res.status(404).json({ message: "Radio program not found." });
    }

    const newStatus = program.status === "active" ? "in-active" : "active";
    await program.update({ status: newStatus });

    res.status(200).json({
      message: `Radio program status updated to ${newStatus}.`,
      data: program,
    });
  } catch (error) {
    console.error("Update Program Status Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update status.", error: error.message });
  }
};

exports.deleteRadioProgram = async (req, res) => {
  try {
    const program = await RadioProgram.findByPk(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Radio program not found." });
    }

    await program.destroy();

    res.status(200).json({ message: "Radio program deleted successfully." });
  } catch (error) {
    console.error("Delete Radio Program Error:", error);
    res.status(500).json({
      message: "Failed to delete radio program.",
      error: error.message,
    });
  }
};

exports.getCurrentProgram = async (req, res) => {
  try {
    const nowCH = moment().tz("Europe/Zurich");
    const currentTime = nowCH.format("HH:mm:ss");

    // Current running program
    const program = await RadioProgram.findOne({
      include: [
        { model: ProgramCategory, as: "program_category" },
        { model: SystemUsers, as: "system_users" },
        { model: RadioStation, as: "radio_station" },
      ],
      where: {
        status: "active",
        [Op.or]: [
          // Normal case: start <= now <= end
          {
            [Op.and]: [
              Sequelize.where(
                Sequelize.col("program_category.start_time"),
                "<=",
                currentTime
              ),
              Sequelize.where(
                Sequelize.col("program_category.end_time"),
                ">=",
                currentTime
              ),
            ],
          },
          // Midnight wrap: start > end, so now is after start or before end
          {
            [Op.and]: [
              Sequelize.where(
                Sequelize.col("program_category.start_time"),
                ">",
                Sequelize.col("program_category.end_time")
              ),
              {
                [Op.or]: [
                  Sequelize.where(
                    Sequelize.col("program_category.start_time"),
                    "<=",
                    currentTime
                  ),
                  Sequelize.where(
                    Sequelize.col("program_category.end_time"),
                    ">=",
                    currentTime
                  ),
                ],
              },
            ],
          },
        ],
      },
      order: [[Sequelize.col("program_category.start_time"), "ASC"]],
    });

    if (!program) {
      return res.status(404).json({ message: "No program currently running" });
    }

    // Minutes left
    let endTime = moment.tz(
      program.program_category.end_time,
      "HH:mm:ss",
      "Europe/Zurich"
    );
    if (endTime.isBefore(nowCH)) {
      endTime.add(1, "day");
    }
    const minutesLeft = endTime.diff(nowCH, "minutes");

    // Next program (including next day wrap-around)
    let nextProgram = await RadioProgram.findOne({
      include: [{ model: ProgramCategory, as: "program_category" }],
      where: {
        status: "active",
        [Op.and]: [
          Sequelize.where(
            Sequelize.col("program_category.start_time"),
            ">",
            program.program_category.start_time
          ),
        ],
      },
      order: [[Sequelize.col("program_category.start_time"), "ASC"]],
    });

    if (!nextProgram) {
      // Wrap to the first program of the next day
      nextProgram = await RadioProgram.findOne({
        include: [{ model: ProgramCategory, as: "program_category" }],
        where: { status: "active" },
        order: [[Sequelize.col("program_category.start_time"), "ASC"]],
      });
    }

    res.json({
      current: program,
      next: nextProgram || null,
      minutesLeft,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching current program" });
  }
};
