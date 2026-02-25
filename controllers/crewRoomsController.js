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
    console.error("bulkSaveRooms error:", error);
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
    console.error(error);
    res.status(500).json({ success: false });
  }
};
