const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require("../models");

const { Transaction, MemberPackage, Package } = db;

exports.createCheckoutSession = async (memberId, packageId, currency) => {
    const packageData = await Package.findByPk(packageId);
    if (!packageData) throw new Error("Package not found");

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
            price_data: {
                currency: currency.toLowerCase(),
                product_data: {
                    name: packageData.package_name,
                    description: `Subscription for ${packageData.duration}`
                },
                unit_amount: packageData.price * 100
            },
            quantity: 1
        }],
        payment_intent_data: {
            metadata: {
                member_id: memberId,
                package_id: packageId
            },
        },
        success_url: `${process.env.FRONTEND_URL}/payment_success.html`,
        cancel_url: `${process.env.FRONTEND_URL}/payment_failure.html`,
    });

    return session;
};

exports.handlePaymentSuccess = async (paymentIntentId) => {
    const t = await db.sequelize.transaction();
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        const { member_id, package_id } = paymentIntent.metadata;

        const pkg = await Package.findByPk(package_id, { transaction: t });
        if (!pkg) {
            throw new Error('Package not found');
        }

        let transaction = await Transaction.findOne({
            where: { transaction_id: paymentIntent.id },
            transaction: t,
        });

        if (transaction) {
            if (transaction.payment_status !== 'completed') {
                await transaction.update({ payment_status: 'completed' }, { transaction: t });
            }
        } else {
            transaction = await Transaction.create({
                transaction_id: paymentIntent.id,
                member_id,
                package_id,
                amount: paymentIntent.amount_received,
                payment_status: 'completed',
                payment_proof: paymentIntent.charges?.data?.[0]?.receipt_url || null,
                refund_status: null,
            }, { transaction: t });
        }

        const startDate = new Date();
        const endDate = new Date(startDate);

        if (pkg.duration === "month") {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (pkg.duration === "year") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
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
        return { success: true, memberPackage };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};