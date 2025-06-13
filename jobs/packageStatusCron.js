const cron = require('node-cron');
const { Op } = require("sequelize");
const moment = require("moment");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MemberPackage, Members, Package, Transaction } = require("../models");
const { sendExpiryEmail, sendPreExpiryEmail, sendPaymentReceiptEmail, sendGracePeriodEmail } = require("../utils/sendEmail");

module.exports = () => {

    cron.schedule("0 0 * * *", async () => {
        console.log("Running Package expiry check...");

        const today = moment().format("YYYY-MM-DD");
        const preExpiryDate = moment().add(2, "days").format("YYYY-MM-DD");
        const graceExpiryLimit = moment().subtract(3, "days").format("YYYY-MM-DD");

        const expiringToday = await MemberPackage.findAll({
            where: {
                end_date: today,
                status: "active"
            },
            include: [{ model: Members, as: "member" }, { model: Package, as: "package" }]
        });

        for (const pkg of expiringToday) {
            const member = pkg.member;
            const packageData = pkg.package;

            if (!member) continue;

            if (member.auto_renew && member.payment_method_id) {
                try {
                    let startDate = moment(pkg.start_date);
                    let endDate = moment(pkg.end_date);
                    const durationInDays = endDate.diff(startDate, "days");

                    let amount = 0;
                    let durationLabel = '';

                    if (durationInDays >= 364) {
                        amount = packageData.yearly_price * 100;
                        durationLabel = 'year';
                    } else if (durationInDays >= 28 && durationInDays <= 32) {
                        amount = packageData.price * 100;
                        durationLabel = 'month';
                    } else {
                        console.error(`unknown duration for package ${pkg.id}`);
                        continue;
                    }

                    const paymentIntent = await stripe.paymentIntents.create({
                        amount,
                        currency: 'chf',
                        customer: member.stripe_customer_id,
                        payment_method: member.payment_method_id,
                        off_session: true,
                        confirm: true,
                        metadata: {
                            member_id: member.id,
                            package_id: packageData.id,
                            duration: durationLabel
                        }
                    });

                    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
                    const receiptUrl = charge.receipt_url;

                    await Transaction.create({
                        transaction_id: paymentIntent.id,
                        member_id: member.id,
                        package_id: packageData.id,
                        amount: amount / 100,
                        payment_status: "completed",
                        payment_proof: null
                    });

                    const newStartDate = moment();
                    const newEndDate = moment(newStartDate).add(durationLabel === 'month' ? 1 : 12, 'months');

                    await pkg.update({
                        status: 'active',
                        purchase_date: newStartDate.toDate(),
                        start_date: newStartDate.toDate(),
                        end_date: newEndDate.toDate()
                    });

                    await sendPaymentReceiptEmail(
                        member.email,
                        member.name,
                        packageData.package_name,
                        (amount / 100).toFixed(2),
                        'CHF',
                        receiptUrl
                    );

                    console.log(`Auto-renewed package for ${member.name}`);
                } catch (error) {
                    console.error(`Failed to auto-renew for ${member.name}:`, error.message);
                }
            } else {
                await pkg.update({ status: "grace_period" });
                await sendGracePeriodEmail(member.email, member.name, pkg.end_date);

                console.log(`Package moved to grace period for ${member.name}`);
            }
        }

        const graceExpired = await MemberPackage.findAll({
            where: {
                end_date: {
                    [Op.lte]: graceExpiryLimit
                },
                status: "grace_period"
            },
            include: [{ model: Members, as: "member" }]
        });

        for (const pkg of graceExpired) {
            const member = pkg.member;
            if (!member) continue;

            await sendExpiryEmail(member.email, member.name, pkg.end_date);
            await pkg.update({ status: "expired" });

            console.log(`Package expired after grace for ${member.name}`);
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

            await sendPreExpiryEmail(member.email, member.name, pkg.end_date);

            console.log(`Pre-expiry email sent for package ID ${pkg.id}`);
        }

        console.log("Package expiry check completed.");
    });
};