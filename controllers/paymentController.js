const { createCheckoutSession, handlePaymentSuccess } = require("../services/paymentService");
const db = require("../models");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Transaction, Members } = db;

exports.initiatePayment = async (req, res) => {
    const { member_id, package_id, currency, duration } = req.body;

    try {
        if (!member_id || !package_id || !currency || !duration) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const member = await Members.findOne({ where: { member_id: member_id } });

        const session = await createCheckoutSession(member.id, package_id, currency, duration);

        res.status(200).json({
            success: true,
            session_url: session.url
        });

    } catch (error) {
        res.status(500).json({
            message: "Payment initiation failed",
            error: error.message
        });
    }
};

exports.webhookHandler = async (req, res) => {

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
        case 'payment_intent.created':
            const createdPayment = event.data.object;
            try {
                await Transaction.findOrCreate({
                    where: { transaction_id: createdPayment.id },
                    defaults: {
                        member_id: createdPayment.metadata.member_id,
                        amount: createdPayment.amount / 100,
                        payment_status: 'pending',
                        payment_proof: null
                    }
                });
            } catch (error) {
                console.error('Error creating transaction:', error);
            }
            break;
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            try {
                await handlePaymentSuccess(paymentIntent.id);
            } catch (error) {
                console.error('Error handling payment success:', error);
            }
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            try {
                await Transaction.update(
                    { payment_status: 'failed' },
                    { where: { transaction_id: failedPayment.id } }
                );
            } catch (error) {
                console.error('Failed payment update error:', error);
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { transaction_id } = req.params;

        const transaction = await Transaction.findOne({
            where: { transaction_id },
            include: ['member']
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({
            transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get payment status",
            error: error.message
        });
    }
}; 