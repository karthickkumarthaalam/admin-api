const express = require("express");
const cors = require("cors");
const db = require("./models");
const cookieParser = require("cookie-parser");
require('dotenv').config();


// jobs
const startOtpCleaner = require("./jobs/otpCleaner");
startOtpCleaner();


const app = express();

app.use(cors({
    origin: process.env.ADMIN_LINK,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database sync
if (process.env.NODE_ENV === "development") {
    db.sequelize.sync().then(() => {
        console.log("Database synchronized (alter mode)");
    });
}


// Routes 
const userRoutes = require("./routes/userRoutes");
const couponRoutes = require("./routes/couponRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const packageRoutes = require("./routes/packageRoutes");

app.use("/api/auth", userRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/package", packageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});