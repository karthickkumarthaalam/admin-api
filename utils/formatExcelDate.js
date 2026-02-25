const moment = require("moment");

const formatExcelDate = (value) => {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value)) {
    return moment(value).format("YYYY-MM-DD");
  }

  const formats = ["DD.MM.YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "MM/DD/YYYY"];

  for (let f of formats) {
    const m = moment(value, f, true);
    if (m.isValid()) return m.format("YYYY-MM-DD");
  }

  return null;
};

module.exports = formatExcelDate;
