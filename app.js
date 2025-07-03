const express = require("express");
const cors = require("cors");
const db = require("./models");
const cookieParser = require("cookie-parser");
const path = require('path');
require('dotenv').config();


// jobs
// const startOtpCleaner = require("./jobs/otpCleaner");
// startOtpCleaner();
const startPackageExpiryChecker = require("./jobs/packageStatusCron");
startPackageExpiryChecker();


const app = express();

app.use(cors({
    origin: (origin, callback) => {
        callback(null, origin);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const webhookRoute = require("./routes/webhookRoutes");
app.use("/api/payments/webhook", webhookRoute);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database sync
db.sequelize.sync().then(() => {
    console.log("Database synchronized (alter mode)");
});


// Routes 
const userRoutes = require("./routes/userRoutes");
const couponRoutes = require("./routes/couponRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const packageRoutes = require("./routes/packageRoutes");
const memberRoutes = require("./routes/membersRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const memberPackageRoutes = require("./routes/memberPackageRoutes");
const transactionRouters = require("./routes/transactionRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const podcastRoutes = require("./routes/podcastRoutes");
const popupBannerRoutes = require("./routes/popupBannerRoutes");

app.use("/api/auth", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/memberPackage", memberPackageRoutes);
app.use("/api/transactions", transactionRouters);
app.use("/api/banners", bannerRoutes);
app.use("/api/uploads", express.static(path.join(__dirname, 'uploads')));
app.use("/api/podcasts", podcastRoutes);
app.use("/api/popup-banner", popupBannerRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});