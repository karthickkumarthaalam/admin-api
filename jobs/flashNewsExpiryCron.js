const cron = require("node-cron");
const { Op } = require("sequelize");
const { FlashNews } = require("../models");

module.exports = () => {
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    const [count] = await FlashNews.update(
      { status: "in-active" },
      {
        where: {
          status: "active",
          end_date: { [Op.lt]: now },
        },
      }
    );
    if (count > 0) console.log(`${count} flash news marked as in-active.`);
  });
};
