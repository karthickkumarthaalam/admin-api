const db = require("../models");
const cron = require("node-cron");
const { Op } = require("sequelize");
const deleteFromCpanel = require("../services/uploadToCpanel");
const { Expenses, ExpenseCategory } = db;

cron.schedule("0 1 * * *", async () => {
    const transaction = await db.sequelize.transaction();
    try {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 30);

        const oldExpenses = await Expenses.findAll({
            where: {
                is_deleted: true,
                deleted_at: {
                    [Op.lte]: thresholdDate
                }
            },
            include: [
                {
                    model: ExpenseCategory,
                    as: "categories"
                }
            ],
            transaction
        });

        for (const expense of oldExpenses) {
            for (const category of expense.categories || []) {
                if (category.bill_drive_link) {
                    try {
                        const remoteFolder = "expense/bills";
                        const fileName = category.bill_drive_link.split("/").pop();
                        await deleteFromCpanel(remoteFolder, fileName);
                    } catch (error) {
                        console.error(`Error deleting file for category ${category.id}`);
                    }
                }
            }

            await ExpenseCategory.destroy({
                where: { expense_id: expense.id },
                transaction
            });

            await expense.destroy({ transaction });
        }

        await transaction.commit();

        console.log(`Deleted ${oldExpenses.length} old soft-deleted expenses.`);
    } catch (error) {
        await transaction.rollback();
        console.error("Failed to clean up old expenses:", error.message);
    }
});