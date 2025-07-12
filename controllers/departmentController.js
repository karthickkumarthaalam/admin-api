const { Department } = require("../models");
const pagination = require("../utils/pagination");

exports.createDepartment = async (req, res) => {
    try {
        const { department_name, description, status } = req.body;

        if (!department_name) {
            return res.status(400).json({ message: "Department name is required" });
        }

        const newDepartment = await Department.create({
            department_name,
            description,
            status: status || "active",
        });

        res.status(201).json({
            status: "success",
            message: "Department created successfully",
            data: newDepartment,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to create department",
            error: error.message,
        });
    }
};

exports.getAllDepartments = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        let whereCondition = {};

        if (req.query.status) {
            whereCondition.status = req.query.status;
        }

        const result = await pagination(Department, { page, limit, where: whereCondition });

        res.status(200).json({
            status: "success",
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch departments",
            error: error.message,
        });
    }
};

exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({
                status: "error",
                message: "Department not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: department,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch department",
            error: error.message,
        });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { department_name, description, status } = req.body;

        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({
                status: "error",
                message: "Department not found",
            });
        }

        await department.update({
            department_name: department_name || department.department_name,
            description: description || department.description,
            status: status || department.status,
        });

        res.status(200).json({
            status: "success",
            message: "Department updated successfully",
            data: department,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update department",
            error: error.message,
        });
    }
};

exports.updateDepartmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({
                status: "error",
                message: "Department not found",
            });
        }

        await department.update({ status });

        res.status(200).json({
            status: "success",
            message: "Department status updated successfully",
            data: department,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to update status",
            error: error.message,
        });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({
                status: "error",
                message: "Department not found",
            });
        }

        await department.destroy();

        res.status(200).json({
            status: "success",
            message: "Department deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to delete department",
            error: error.message,
        });
    }
};
