const { Module } = require("../models");

exports.createModule = async (req, res) => {
    const { name } = req.body;

    try {
        const moduleExists = await Module.findOne({ where: { name } });
        if (moduleExists) {
            return res.status(400).json({ status: "error", message: "Module already exists" });
        }

        const newModule = await Module.create({ name });
        res.status(201).json({ status: "success", message: "Module created", data: newModule });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
};

exports.getAllModules = async (req, res) => {
    try {
        const modules = await Module.findAll({ order: [["id", "ASC"]] });
        res.status(200).json({ status: "success", data: modules });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
};

exports.updateModule = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const module = await Module.findByPk(id);

        if (!module) {
            return res.status(404).json({ status: "error", message: "Module not found" });
        }

        const updatedModule = await module.update({ name });

        res.status(200).json({ status: "success", message: "Module updated successfully", data: updatedModule });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
};
exports.deleteModule = async (req, res) => {
    const { id } = req.params;

    try {
        await Module.destroy({ where: { id } });
        res.status(200).json({ status: "success", message: "Module deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
};
