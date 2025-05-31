const cron = require('node-cron');
const { Op } = require("sequelize");
const { MemberPackage, Members } = require("../models");
const { sendExpiryEmail, sendPreExpiryEmail } = require("../utils/sendEmail");
const moment = require("moment");

module.exports = () => {

    cron.schedule("0 0 * * *", async () => {
        console.log("Running Package expiry check...");

        try {
            const today = moment().format("YYYY-MM-DD");
            const preExpiryDate = moment().add(2, "days").format("YYYY-MM-DD");

            const expiringToday = await MemberPackage.findAll({
                where: {
                    end_date: today,
                    status: "active"
                },
                include: [{ model: Members, as: "member", attributes: ["id", "name", "email"] }]
            });

            for (const pkg of expiringToday) {
                const member = pkg.member;

                if (!member) continue;

                await sendExpiryEmail(member.email, member.name, pkg.expiry_date);

                pkg.status = "expired";
                await pkg.save();

                console.log(`Expiry email sent & status updated for package ID ${pkg.id}`);
            }

            const expiringSoon = await MemberPackage.findAll({
                where: {
                    end_date: preExpiryDate,
                    status: "active"
                },
                include: [{ model: Members, as: "member", attributes: ["id", "name", "email"] }]
            });

            for (const pkg of expiringSoon) {
                const member = pkg.member;
                if (!member) continue;

                await sendPreExpiryEmail(member.email, member.name, pkg.expiry_date);

                console.log(`Pre-expiry email sent for package ID ${pkg.id}`);
            }

            console.log("Package expiry check completed.");

        } catch (error) {
            console.error("Error in package expiry cron:", error);
        }
    });
};