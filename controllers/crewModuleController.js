const { CrewModulePermission, SystemUsers } = require("../models");

exports.addCrewPermissions = async (req, res) => {
  try {
    const {
      crew_management_id,
      system_user_id,
      can_manage_flight,
      can_manage_rooms,
    } = req.body;

    if (!crew_management_id || !system_user_id) {
      return res.status(400).json({
        success: false,
        message: "crew_management_id and system_user_id required",
      });
    }

    let permission = await CrewModulePermission.findOne({
      where: { crew_management_id, system_user_id },
    });

    if (permission) {
      await permission.update({
        can_manage_flight: !!can_manage_flight,
        can_manage_rooms: !!can_manage_rooms,
      });

      return res.json({
        success: true,
        message: "Permission updated successfully",
        data: permission,
      });
    }

    permission = await CrewModulePermission.create({
      crew_management_id,
      system_user_id,
      can_manage_flight: !!can_manage_flight,
      can_manage_rooms: !!can_manage_rooms,
    });

    res.json({
      success: true,
      message: "Permission assigned successfully",
      data: permission,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add Crew Permission", error: error.message });
  }
};

exports.getCrewPermissions = async (req, res) => {
  try {
    const { crew_management_id } = req.params;

    const permissions = await CrewModulePermission.findAll({
      where: { crew_management_id },
      include: [
        {
          model: SystemUsers,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("getCrewPermissions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteCrewPermission = async (req, res) => {
  try {
    const { id } = req.params;

    const permission = await CrewModulePermission.findByPk(id);
    if (!permission) {
      return res
        .status(404)
        .json({ success: false, message: "Permission not found" });
    }

    await permission.destroy();

    res.json({
      success: true,
      message: "Permission removed",
    });
  } catch (error) {
    console.error("deleteCrewPermission error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.checkModuleAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { crew_management_id } = req.query;

    if (!crew_management_id) {
      return res.status(400).json({
        success: false,
        message: "crew_management_id required",
      });
    }

    const permission = await CrewModulePermission.findOne({
      where: {
        system_user_id: userId,
        crew_management_id,
      },
    });

    if (!permission) {
      return res.json({
        success: true,
        can_manage_flight: false,
        can_manage_rooms: false,
      });
    }

    return res.json({
      success: true,
      can_manage_flight: permission.can_manage_flight || false,
      can_manage_rooms: permission.can_manage_rooms || false,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Permission check failed",
    });
  }
};
