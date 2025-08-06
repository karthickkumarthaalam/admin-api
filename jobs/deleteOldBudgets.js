const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");
const { Budget } = db;

cron.schedule("0 2 * * *", async () => {
    try {
        console.log("Running Budget Cleanup Cron Job...");

        const thrsholdDate = new Date();
        thrsholdDate.setDate(thrsholdDate.getDate() - 30);

        const deletedCount = await Budget.destroy({
            where: {
                is_deleted: true,
                deleted_at: {
                    [Op.lte]: thrsholdDate
                }
            }
        });

        console.log(`Budget Cleanup Complete: ${deletedCount} old budgets permanently deleted`);

    } catch (error) {
        console.error("Error in Budget Cleanup cron job:", error.message);
    }
});