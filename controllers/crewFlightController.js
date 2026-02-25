const fs = require("fs");
const { CrewFlights } = require("../models");
const { uploadToR2, deleteFromR2 } = require("../services/uploadToR2");

exports.bulkSaveFlights = async (req, res) => {
  try {
    let { crew_list_id, flights } = req.body;

    if (!crew_list_id) {
      return res.status(400).json({
        success: false,
        message: "crew_list_id required",
      });
    }

    if (typeof flights === "string") {
      flights = JSON.parse(flights);
    }

    if (!Array.isArray(flights)) {
      return res.status(400).json({
        success: false,
        message: "flights must be array",
      });
    }

    const existingFlights = await CrewFlights.findAll({
      where: { crew_list_id },
    });

    const existingIds = existingFlights.map((f) => f.id);
    const incomingIds = flights.filter((f) => f.id).map((f) => f.id);

    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

    for (const id of toDelete) {
      const flight = existingFlights.find((f) => f.id === id);

      if (flight?.ticket_file) {
        const key = flight.ticket_file.replace(
          process.env.R2_PUBLIC_URL + "/",
          "",
        );
        await deleteFromR2(key);
      }

      await CrewFlights.destroy({ where: { id } });
    }

    for (let i = 0; i < flights.length; i++) {
      const f = flights[i];

      let ticketUrl = f.ticket_file || null;

      const fileKey = `ticket_${i}`;
      const file = req.files?.find((fl) => fl.fieldname === fileKey);

      if (file) {
        if (f.id) {
          const existing = existingFlights.find((x) => x.id === f.id);
          if (existing?.ticket_file) {
            const key = existing.ticket_file.replace(
              process.env.R2_PUBLIC_URL + "/",
              "",
            );
            await deleteFromR2(key);
          }
        }

        ticketUrl = await uploadToR2(
          file.path,
          "crew/tickets",
          file.originalname,
        );

        fs.unlinkSync(file.path);
      }

      const payload = {
        crew_list_id,
        sort_order: i + 1,
        from_city: f.from_city,
        to_city: f.to_city,
        flight_number: f.flight_number,
        airline: f.airline,
        departure_time: f.departure_time,
        arrival_time: f.arrival_time,
        terminal: f.terminal,
        remarks: f.remarks,
        ticket_number: f.ticket_number,
        pnr: f.pnr,
        ticket_issued_date: f.ticket_issued_date,
        booking_status: f.booking_status,
        ticket_file: ticketUrl,
      };

      if (f.id) {
        await CrewFlights.update(payload, { where: { id: f.id } });
      } else {
        await CrewFlights.create(payload);
      }
    }

    return res.json({
      success: true,
      message: "Flights saved successfully",
    });
  } catch (error) {
    console.error("bulkSaveFlights error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getFlightsByCrew = async (req, res) => {
  try {
    const { crew_list_id } = req.params;

    const data = await CrewFlights.findAll({
      where: { crew_list_id },
      order: [["sort_order", "ASC"]],
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("getFlightsByCrew error:", error);
    res.status(500).json({ success: false });
  }
};
