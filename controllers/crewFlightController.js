const fs = require("fs");
const { CrewFlights } = require("../models");
const { uploadToR2, deleteFromR2 } = require("../services/crewUpload");

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
        flight_class: f.flight_class,
        airline: f.airline,
        departure_time: f.departure_time,
        arrival_time: f.arrival_time,
        departure_date: f.departure_date,
        arrival_date: f.arrival_date,
        currency: f.currency,
        ticket_charge: f.ticket_charge,
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

exports.createFlight = async (req, res) => {
  try {
    const {
      crew_list_id,
      from_city,
      to_city,
      flight_number,
      flight_class,
      airline,
      departure_date,
      arrival_date,
      departure_time,
      arrival_time,
      currency,
      ticket_charge,
      terminal,
      remarks,
      pnr,
      booking_status,
    } = req.body;

    if (!crew_list_id) {
      return res
        .status(400)
        .json({ success: false, message: "crew_list_id required" });
    }

    let ticketUrl = null;

    if (req.file) {
      ticketUrl = await uploadToR2(
        req.file.path,
        "crew/tickets",
        req.file.originalname,
      );
      fs.unlinkSync(req.file.path);
    }

    // get last sort order
    const last = await CrewFlights.findOne({
      where: { crew_list_id },
      order: [["sort_order", "DESC"]],
    });

    const sort_order = last ? last.sort_order + 1 : 1;

    const flight = await CrewFlights.create({
      crew_list_id,
      from_city,
      to_city,
      flight_number,
      flight_class,
      airline,
      departure_date,
      arrival_date,
      departure_time,
      arrival_time,
      currency,
      ticket_charge,
      terminal,
      remarks,
      pnr,
      booking_status,
      ticket_file: ticketUrl,
      sort_order,
    });

    res.json({
      success: true,
      message: "Flight created",
      data: flight,
    });
  } catch (err) {
    console.error("createFlight error:", err);
    res.status(500).json({ success: false });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await CrewFlights.findByPk(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Flight not found" });
    }

    let ticketUrl = existing.ticket_file;

    // if new file uploaded
    if (req.file) {
      // delete old
      if (existing.ticket_file) {
        const key = existing.ticket_file.replace(
          process.env.R2_PUBLIC_URL + "/",
          "",
        );
        await deleteFromR2(key);
      }

      ticketUrl = await uploadToR2(
        req.file.path,
        "crew/tickets",
        req.file.originalname,
      );

      fs.unlinkSync(req.file.path);
    }

    await existing.update({
      from_city: req.body.from_city,
      to_city: req.body.to_city,
      flight_number: req.body.flight_number,
      flight_class: req.body.flight_class,
      airline: req.body.airline,
      departure_date: req.body.departure_date,
      arrival_date: req.body.arrival_date,
      departure_time: req.body.departure_time,
      arrival_time: req.body.arrival_time,
      currency: req.body.currency,
      ticket_charge: req.body.ticket_charge,
      terminal: req.body.terminal,
      remarks: req.body.remarks,
      pnr: req.body.pnr,
      booking_status: req.body.booking_status,
      ticket_file: ticketUrl,
    });

    res.json({
      success: true,
      message: "Flight updated",
    });
  } catch (err) {
    console.error("updateFlight error:", err);
    res.status(500).json({ success: false });
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

exports.deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;

    const flight = await CrewFlights.findByPk(id);
    if (!flight) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (flight.ticket_file) {
      const key = flight.ticket_file.replace(
        process.env.R2_PUBLIC_URL + "/",
        "",
      );
      await deleteFromR2(key);
    }

    await flight.destroy();

    res.json({
      success: true,
      message: "Flight deleted",
    });
  } catch (err) {
    console.error("deleteFlight error:", err);
    res.status(500).json({ success: false });
  }
};
