const { createPaymentIntent, handlePaymentSuccess } = require("../services/paymentService");
const db = require("../models");

const { Transaction } = db;

exports.initiatePayment = async (req, res) => {
    const { member_id, package_id, currency, payment_method } = req.body;

    try {
        if (!member_id || !package_id || !currency || !payment_method) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const paymentIntent = await createPaymentIntent(
            member_id,
            package_id,
            currency,
            payment_method
        );

        const transaction = await Transaction.create({
            member_id,
            transaction_id: paymentIntent.id,
            amount: paymentIntent.amount,
            payment_status: paymentIntent.status,
            payment_proof: paymentIntent.id
        });

        if (paymentIntent.status === "succeeded") {
            await handlePaymentSuccess(paymentIntent.id);
        }

        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id,
            transaction
        });

    } catch (error) {
        res.status(500).json({
            message: "payment initiation failed",
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
            await Transaction.update(
                { payment_status: 'failed' },
                { where: { transaction_id: failedPayment.id } }
            );
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