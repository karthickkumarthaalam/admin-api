const db = require("../models");
const { EventContactDetails, Event } = db;

/**
 * Create or Update Contact Details (Upsert)
 */
exports.upsertContactDetails = async (req, res) => {
  try {
    const { event_id, address, mobile_numbers, emails, social_links } =
      req.body;

    if (!event_id || !address) {
      return res.status(400).json({
        status: "error",
        message: "event_id and address are required",
      });
    }

    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Event not found",
      });
    }

    const existing = await EventContactDetails.findOne({
      where: { event_id },
    });

    if (existing) {
      await existing.update({
        address,
        mobile_numbers: mobile_numbers || null,
        emails: emails || null,
        social_links: social_links || null,
      });

      return res.status(200).json({
        status: "success",
        message: "Contact details updated successfully",
      });
    }

    await EventContactDetails.create({
      event_id,
      address,
      mobile_numbers: mobile_numbers || null,
      emails: emails || null,
      social_links: social_links || null,
    });

    return res.status(201).json({
      status: "success",
      message: "Contact details created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to save contact details",
      error: error.message,
    });
  }
};

/**
 * Get Contact Details by Event
 */
exports.getContactDetails = async (req, res) => {
  try {
    const { event_id } = req.params;

    const details = await EventContactDetails.findOne({
      where: { event_id },
    });

    if (!details) {
      return res.status(404).json({
        status: "error",
        message: "Contact details not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: details,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch contact details",
      error: error.message,
    });
  }
};
