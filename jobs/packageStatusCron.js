const cron = require('node-cron');
const { Op } = require("sequelize");
const moment = require("moment");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { MemberPackage, Members, Package, Transaction } = require("../models");
const { sendExpiryEmail, sendPreExpiryEmail, sendPaymentReceiptEmail, sendGracePeriodEmail } = require("../utils/sendEmail");

module.exports = () => {

    cron.schedule("* * * * *", async () => {
        console.log("Running Package expiry check...");

        // Use start/end of day to handle timezone correctly
        const todayStart = moment().startOf("day").toDate();
        const todayEnd = moment().endOf("day").toDate();
        const preExpiryDateStart = moment().add(2, "days").startOf("day").toDate();
        const preExpiryDateEnd = moment().add(2, "days").endOf("day").toDate();
        const graceExpiryLimit = moment().subtract(3, "days").endOf("day").toDate();

        // Packages expiring today
        const expiringToday = await MemberPackage.findAll({
            where: {
                end_date: { [Op.between]: [todayStart, todayEnd] },
                status: "active"
            },
            include: [
                { model: Members, as: "member" },
                { model: Package, as: "package" }
            ]
        });

        for (const pkg of expiringToday) {
            const member = pkg.member;
            const packageData = pkg.package;
            if (!member || !packageData) continue;

            if (member.auto_renew && member.payment_method_id) {
                try {
                    const startDate = moment(pkg.start_date);
                    const endDate = moment(pkg.end_date);
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
                        console.error(`Unknown package duration for ID ${pkg.id}`);
                        continue;
                    }

                    // Stripe auto payment
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

                    // Record transaction
                    await Transaction.create({
                        transaction_id: paymentIntent.id,
                        member_id: member.id,
                        package_id: packageData.id,
                        amount: amount / 100,
                        payment_status: "completed",
                        payment_proof: null
                    });

                    // Update package dates
                    const newStartDate = moment();
                    const newEndDate = moment(newStartDate).add(durationLabel === 'month' ? 1 : 12, 'months');

                    await pkg.update({
                        status: 'active',
                        purchase_date: newStartDate.toDate(),
                        start_date: newStartDate.toDate(),
                        end_date: newEndDate.toDate(),
                        transaction_id: paymentIntent.id // ensure transaction_id is set
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

                } catch (err) {
                    console.error(`Auto-renew failed for ${member.name}:`, err.message);

                    // If Stripe fails, move package to grace period
                    try {
                        await pkg.update({ status: "grace_period" });
                        await sendGracePeriodEmail(member.email, member.name, pkg.end_date);
                        console.log(`Package moved to grace period for ${member.name}`);
                    } catch (updateErr) {
                        console.error(`Failed to update status for ${member.name}:`, updateErr.message);
                    }
                }
            } else {
                // No auto-renew, move to grace period
                try {
                    await pkg.update({ status: "grace_period" });
                    await sendGracePeriodEmail(member.email, member.name, pkg.end_date);
                    console.log(`Package moved to grace period for ${member.name}`);
                } catch (updateErr) {
                    console.error(`Failed to update status for ${member.name}:`, updateErr.message);
                }
            }
        }

        // Packages that expired after grace period
        const graceExpired = await MemberPackage.findAll({
            where: {
                end_date: { [Op.lte]: graceExpiryLimit },
                status: "grace_period"
            },
            include: [{ model: Members, as: "member" }]
        });

        for (const pkg of graceExpired) {
            const member = pkg.member;
            if (!member) continue;

            try {
                await sendExpiryEmail(member.email, member.name, pkg.end_date);
                await pkg.update({ status: "expired" });
                console.log(`Package expired after grace for ${member.name}`);
            } catch (err) {
                console.error(`Failed to expire package ${pkg.id}:`, err.message);
            }
        }

        // Packages expiring soon (pre-expiry email)
        const expiringSoon = await MemberPackage.findAll({
            where: {
                end_date: { [Op.between]: [preExpiryDateStart, preExpiryDateEnd] },
                status: "active"
            },
            include: [{ model: Members, as: "member", attributes: ["id", "name", "email"] }]
        });

        for (const pkg of expiringSoon) {
            const member = pkg.member;
            if (!member) continue;

            try {
                await sendPreExpiryEmail(member.email, member.name, pkg.end_date);
                console.log(`Pre-expiry email sent for package ID ${pkg.id}`);
            } catch (err) {
                console.error(`Failed to send pre-expiry email for ${pkg.id}:`, err.message);
            }
        }

        console.log("Package expiry check completed.");
    });
};
