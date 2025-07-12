const { RadioProgram, ProgramCategory, SystemUsers, RadioStation } = require("../models");
const { Op } = require("sequelize");
const pagination = require("../utils/pagination");

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

        if (!program_category_id || !rj_id || !radio_station_id || !broadcast_days) {
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
        res.status(500).json({ message: "Failed to create radio program.", error: error.message });
    }
};

exports.getAllRadioPrograms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || "";

        const whereCondition = {};

        if (search) {
            whereCondition[Op.or] = [
                { country: { [Op.like]: `%${search}%` } },
            ];
        }

        if (req.query.status) {
            whereCondition.status = req.query.status;
        }

        const result = await pagination(RadioProgram, {
            page,
            limit,
            where: whereCondition,
            order: [[{ model: ProgramCategory, as: "program_category" }, "start_time", "ASC"]],
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
        res.status(500).json({ message: "Failed to fetch radio programs.", error: error.message });
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
        res.status(500).json({ message: "Failed to fetch radio program.", error: error.message });
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
            status
        } = req.body;

        await program.update({
            program_category_id: program_category_id ?? program.program_category_id,
            rj_id: rj_id ?? program.rj_id,
            country: country ?? program.country,
            radio_station_id: radio_station_id ?? program.radio_station_id,
            broadcast_days: broadcast_days ?? program.broadcast_days,
            status: status ?? program.status,
            show_host_name: typeof show_host_name !== "undefined" ? show_host_name : program.show_host_name,
            show_program_name: typeof show_program_name !== "undefined" ? show_program_name : program.show_program_name,
            show_timing: typeof show_timing !== "undefined" ? show_timing : program.show_timing,
            show_host_profile: typeof show_host_profile !== "undefined" ? show_host_profile : program.show_host_profile
        });

        res.status(200).json({
            message: "Radio program updated successfully.",
            data: program,
        });

    } catch (error) {
        console.error("Update Radio Program Error:", error);
        res.status(500).json({ message: "Failed to update radio program.", error: error.message });
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
        res.status(500).json({ message: "Failed to update status.", error: error.message });
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
        res.status(500).json({ message: "Failed to delete radio program.", error: error.message });
    }
};
