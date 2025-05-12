const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require("../models");
const transaction = require('../models/transaction');

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
    const t = await db.sequelize.transaction();
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const { member_id, package_id } = paymentIntent.metadata;
        const package = await Package.findByPk(package_id);

        if (!package) {
            throw new Error('Package not found');
        }

        const existingTransaction = await Transaction.findOne({
            where: { transaction_id: paymentIntent.id, payment_status: 'completed' },
            transaction: t
        });
        if (existingTransaction) {
            await t.commit();
            return { success: true, message: "Already processed" };
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

        const receiptUrl = paymentIntent.charges?.data?.[0]?.receipt_url || null;

        await Transaction.update(
            { payment_status: 'completed', payment_proof: receiptUrl },
            { where: { transaction_id: paymentIntent.id }, transaction: t }
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
            },
            transaction: t
        });

        if (!created) {
            await memberPackage.update({
                status: 'active',
                start_date: startDate,
                end_date: endDate
            }, { transaction: t });
        }
        await t.commit();
        return { success: true, memberPackage };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};