const cron = require("node-cron");
const db = require("../models");
const { Op } = require("sequelize");

const User = db.User;

const startOtpCleaner = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const result = await User.update(
                { otp: null, otpExpiresAt: null },
                {
                    where: {
                        otpExpiresAt: {
                            [Op.lt]: new Date(),
                        },
                    },
                }
            );

        } catch (error) {

        }
    });
};


module.exports = startOtpCleaner;