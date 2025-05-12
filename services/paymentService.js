const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require("../models");

const { Transaction, MemberPackage, Package } = db;

exports.createPaymentIntent = async (memberId, packageId, currency, paymentMethod) => {
    try {
        const package = await Package.findByPk(packageId);

        if (!package) {
            throw new Error("Package not found");
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(package.price * 100),
            currency: currency.toLowerCase(),
            payment_method: paymentMethod,
            confirmation_method: 'manual',
            confirm: true,
            metadata: {
                member_id: memberId,
                package_id: packageId
            },
            description: `Payment for Package: ${package.package_name}`
        });

        return paymentIntent;

    } catch (error) {
        throw error;
    }
};

exports.handlePaymentSuccess = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const { member_id, package_id } = paymentIntent.metadata;
        const package = await Package.findByPk(package_id);

        if (!package) {
            throw new Error('Package not found');
        }

        const startDate = new Date();
        let endDate = new Date();

        if (package.duration == "month") {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (package.duration == "year") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const charges = paymentIntent.charges.data;
        let receiptUrl = null;
        if (charges && charges.length > 0) {
            receiptUrl = charges[0].receipt_url;
        }

        await Transaction.update(
            { payment_status: 'completed', payment_proof: receiptUrl },
            { where: { transaction_id: paymentIntent.id } }
        );

        const [memberPackage, created] = await MemberPackage.findOrCreate({
            where: { member_id, package_id },
            defaults: {
                member_id,
                package_id,
                status: 'active',
                purchase_date: new Date(),
                start_date: startDate,
                end_date: endDate
            }
        });

        if (!created) {
            await memberPackage.update({
                status: 'active',
                start_date: startDate,
                end_date: endDate
            });
        }

        return { success: true, memberPackage };

    } catch (error) {
        throw error;
    }
};