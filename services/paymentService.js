const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require("../models");
const { sendPaymentReceiptEmail } = require('../utils/sendEmail');

const { Transaction, MemberPackage, Package, Members } = db;

exports.createCheckoutSession = async (member, packageId, currency, duration, autoRenew) => {
    const packageData = await Package.findByPk(packageId);
    if (!packageData) throw new Error("Package not found");

    const unitPrice = duration === 'year' ? packageData.yearly_price : packageData.price;

    let customerId = member?.stripe_customer_id;

    if (!customerId) {
        const customer = await stripe.customers.create({
            email: member.email,
            name: member.name
        });

        customerId = customer.id;

        await member.update({ stripe_customer_id: customerId });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: autoRenew ? ['card'] : ['card', 'twint'],
        mode: 'payment',
        customer: customerId,
        line_items: [{
            price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                    name: packageData.package_name,
                    description: `Subscription for ${duration}`
                },
                unit_amount: unitPrice * 100
            },
            quantity: 1
        }],
        payment_intent_data: {
            metadata: {
                member_id: member.id,
                package_id: packageId,
                duration: duration,
                auto_renew: autoRenew
            },
            ...autoRenew && {
                setup_future_usage: 'off_session'
            }
        },
        success_url: `${process.env.FRONTEND_URL}/payment_success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment_failure`,
    });

    return session;
};

exports.handlePaymentSuccess = async (paymentIntentId) => {
    const t = await db.sequelize.transaction();
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const { member_id, package_id, duration } = paymentIntent.metadata;

        const member = await Members.findByPk(member_id, { transaction: t });
        if (!member) throw new Error("Member not found");

        const pkg = await Package.findByPk(package_id, { transaction: t });
        if (!pkg) {
            throw new Error('Package not found');
        }
        const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
        const receiptUrl = charge.receipt_url;

        let transaction = await Transaction.findOne({
            where: { transaction_id: paymentIntent.id },
            transaction: t,
        });

        if (transaction) {
            if (transaction.payment_status !== 'completed') {
                await transaction.update({
                    payment_status: 'completed',
                    payment_proof: receiptUrl || null
                }, { transaction: t });
            }
        } else {
            transaction = await Transaction.create({
                transaction_id: paymentIntent.id,
                member_id,
                package_id,
                amount: paymentIntent.amount_received,
                payment_status: 'completed',
                payment_proof: receiptUrl || null,
                refund_status: null,
            }, { transaction: t });
        }

        const startDate = new Date();
        const endDate = new Date(startDate);

        if (duration === "month") {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (duration === "year") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const [memberPackage, created] = await MemberPackage.findOrCreate({
            where: { member_id, package_id },
            defaults: {
                member_id,
                package_id,
                status: 'active',
                purchase_date: new Date(),
                start_date: startDate,
                end_date: endDate,
                transaction_id: transaction.id,
            },
            transaction: t,
        });

        if (!created) {
            await memberPackage.update({
                status: 'active',
                start_date: startDate,
                end_date: endDate,
                transaction_id: transaction.id,
            }, { transaction: t });
        }
        await t.commit();
        return { success: true, memberPackage, member, pkg, receiptUrl };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

exports.sendRecieptToMember = async (paymentIntent, member, pkg, receiptUrl) => {
    try {
        const amountPaid = (paymentIntent.amount_received / 100).toFixed(2);
        const currency = paymentIntent.currency;

        await sendPaymentReceiptEmail(
            member.email,
            member.name,
            pkg.package_name,
            amountPaid,
            currency,
            receiptUrl
        );

    } catch (error) {
        throw error;
    }
};
