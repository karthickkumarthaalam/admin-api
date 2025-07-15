const { UserPermission, Module, SystemUsers } = require("../models");
const pagination = require("../utils/pagination");

exports.savePermissions = async (req, res) => {
    const { system_user_id, permissions } = req.body;

    try {
        await UserPermission.destroy({ where: { system_user_id } });

        const permissionRecords = permissions.map(p => ({
            system_user_id,
            module_id: p.module_id,
            access_type: p.access_types.join(",")
        }));

        await UserPermission.bulkCreate(permissionRecords);

        res.status(200).json({ message: "Permissions updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUserPermissions = async (req, res) => {
    try {
        const permissions = await UserPermission.findAll({
            where: req.query.system_user_id ? {
                system_user_id: req.query.system_user_id
            } : {},
            include: [
                {
                    model: SystemUsers,
                    as: "systemUser",
                    attributes: ["id", "name", "email"]
                },
                {
                    model: Module,
                    as: "module",
                    attributes: ["id", "name"]
                }
            ],
            order: [["id", "ASC"]]
        });

        const groupPermissions = permissions.reduce((acc, perm) => {
            const userId = perm.system_user_id;

            if (!acc[userId]) {
                acc[userId] = {
                    system_user_id: userId,
                    systemUser: perm.systemUser,
                    modules: []
                };
            }

            acc[userId].modules.push({
                id: perm.module.id,
                name: perm.module.name,
                access_type: perm.access_type
            });
            return acc;
        }, {});

        const result = Object.values(groupPermissions);

        res.status(200).json({
            status: "success",
            data: result
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch user permissions",
            error: error.message,
        });
    }
};

exports.getPermissionsByUser = async (req, res) => {
    const { system_user_id } = req.params;

    try {
        const permissions = await UserPermission.findAll({
            where: { system_user_id },
            include: [{ model: Module, as: "module", attributes: ["name"] }]
        });

        res.status(200).json({ data: permissions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePermissionsByUser = async (req, res) => {
    const { system_user_id } = req.params;

    try {
        await UserPermission.destroy({ where: { system_user_id } });
        res.status(200).json({ message: "Permissions cleared for user" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
