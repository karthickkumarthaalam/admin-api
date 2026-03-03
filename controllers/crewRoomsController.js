const { CrewRooms } = require("../models");

exports.bulkSaveRooms = async (req, res) => {
  try {
    const { crew_list_id, rooms } = req.body;

    if (!crew_list_id) {
      return res.status(400).json({
        success: false,
        message: "crew_list_id required",
      });
    }

    if (!Array.isArray(rooms)) {
      return res.status(400).json({
        success: false,
        message: "rooms must be array",
      });
    }

    // 🟢 Existing rooms in DB
    const existingRooms = await CrewRooms.findAll({
      where: { crew_list_id },
    });

    const existingIds = existingRooms.map((r) => r.id);
    const incomingIds = rooms.filter((r) => r.id).map((r) => r.id);

    // 🗑 DELETE removed rooms
    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
    if (toDelete.length) {
      await CrewRooms.destroy({
        where: { id: toDelete },
      });
    }

    // 🟢 CREATE or UPDATE
    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];

      const payload = {
        crew_list_id,
        sort_order: i + 1,
        hotel_name: r.hotel_name,
        room_number: r.room_number,
        room_type: r.room_type,
        checkin_date: r.checkin_date,
        checkout_date: r.checkout_date,
        city: r.city,
        remarks: r.remarks,
      };

      if (r.id) {
        await CrewRooms.update(payload, {
          where: { id: r.id },
        });
      } else {
        await CrewRooms.create(payload);
      }
    }

    return res.json({
      success: true,
      message: "Rooms saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const {
      crew_list_id,
      hotel_name,
      room_number,
      room_type,
      checkin_date,
      checkout_date,
      city,
      remarks,
    } = req.body;

    if (!crew_list_id) {
      return res.status(400).json({
        success: false,
        message: "crew_list_id required",
      });
    }

    // next sort order
    const last = await CrewRooms.findOne({
      where: { crew_list_id },
      order: [["sort_order", "DESC"]],
    });

    const sort_order = last ? last.sort_order + 1 : 1;

    const room = await CrewRooms.create({
      crew_list_id,
      hotel_name,
      room_number,
      room_type,
      checkin_date,
      checkout_date,
      city,
      remarks,
      sort_order,
    });

    res.json({
      success: true,
      message: "Room added successfully",
      data: room,
    });
  } catch (error) {
    console.error("createRoom error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await CrewRooms.findByPk(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await room.update({
      hotel_name: req.body.hotel_name,
      room_number: req.body.room_number,
      room_type: req.body.room_type,
      checkin_date: req.body.checkin_date,
      checkout_date: req.body.checkout_date,
      city: req.body.city,
      remarks: req.body.remarks,
    });

    res.json({
      success: true,
      message: "Room updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await CrewRooms.findByPk(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await room.destroy();

    res.json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getRoomsByCrew = async (req, res) => {
  try {
    const { crew_list_id } = req.params;

    const data = await CrewRooms.findAll({
      where: { crew_list_id },
      order: [["sort_order", "ASC"]],
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
