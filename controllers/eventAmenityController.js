const db = require("../models");
const { EventAmenity, Event } = db;

// 🟢 Add Amenity
exports.addAmenity = async (req, res) => {
  try {
    const { event_id, name, description } = req.body;

    if (!event_id || !name) {
      return res.status(400).json({
        status: "error",
        message: "Event ID and name are required",
      });
    }

    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    const newAmenity = await EventAmenity.create({
      event_id,
      name,
      description,
    });

    res.status(200).json({
      status: "success",
      message: "Amenity added successfully",
      data: newAmenity,
    });
  } catch (error) {
    console.error("❌ Error adding amenity:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add amenity",
      error: error.message,
    });
  }
};

// 🟡 Update Amenity
exports.updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const amenity = await EventAmenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found",
      });
    }

    await amenity.update({
      name: name || amenity.name,
      description: description ?? amenity.description,
    });

    res.status(200).json({
      status: "success",
      message: "Amenity updated successfully",
      data: amenity,
    });
  } catch (error) {
    console.error("❌ Error updating amenity:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update amenity",
      error: error.message,
    });
  }
};

// 🔵 List Amenities by Event ID
exports.listAmenitiesByEventId = async (req, res) => {
  try {
    const { event_id } = req.params;

    if (!event_id) {
      return res.status(400).json({
        status: "error",
        message: "Event ID is required",
      });
    }

    const eventExists = await Event.findByPk(event_id);
    if (!eventExists) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    const amenities = await EventAmenity.findAll({
      where: { event_id },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      status: "success",
      message: "Event amenities fetched successfully",
      data: amenities,
    });
  } catch (error) {
    console.error("❌ Error fetching amenities:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch amenities",
      error: error.message,
    });
  }
};

// 🔴 Delete Amenity
exports.deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;

    const amenity = await EventAmenity.findByPk(id);
    if (!amenity) {
      return res.status(404).json({
        status: "error",
        message: "Amenity not found",
      });
    }

    await amenity.destroy();

    res.status(200).json({
      status: "success",
      message: "Amenity deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting amenity:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete amenity",
      error: error.message,
    });
  }
};
