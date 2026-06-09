const xlsx = require("xlsx");
const db = require("../models");
const { Attendee } = db;

async function updateCountries() {
  try {
    const workbook = xlsx.readFile("./attendees.xlsx");
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log(`Found ${data.length} rows in Excel`);

    let updatedCount = 0;

    for (const row of data) {
      const ticketId = row.TICKET_ID?.toString().trim();
      const country = row.PURCHASER_BILLING_COUNTRY?.toString().trim();

      if (!ticketId || !country) continue;

      const [updatedRows] = await Attendee.update(
        {
          COUNTRY: country,
        },
        {
          where: {
            TICKET_ID: ticketId,
          },
        },
      );
      updatedCount += updatedRows;
    }

    console.log(`Updated ${updatedCount} attendee records`);
  } catch (error) {
    console.error("Update failed:", error);
  }
}

updateCountries()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
