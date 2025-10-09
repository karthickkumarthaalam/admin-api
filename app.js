const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
require("dotenv").config();

require("./jobs/deleteOldBudgets");
require("./jobs/deleteOldExpenses");

const startPackageExpiryChecker = require("./jobs/packageStatusCron");
startPackageExpiryChecker();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const webhookRoute = require("./routes/webhookRoutes");
app.use("/api/payments/webhook", webhookRoute);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/userRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/currency", require("./routes/currencyRoutes"));
app.use("/api/package", require("./routes/packageRoutes"));
app.use("/api/members", require("./routes/membersRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/memberPackage", require("./routes/memberPackageRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/banners", require("./routes/bannerRoutes"));
app.use("/api/podcasts", require("./routes/podcastRoutes"));
app.use("/api/popup-banner", require("./routes/popupBannerRoutes"));
app.use("/share", require("./routes/shareRoutes"));
app.use("/api/agreements", require("./routes/agreementRoutes"));
app.use("/api/passwords", require("./routes/passwordManagerRoutes"));
app.use("/api/radio-station", require("./routes/radioStationRoutes"));
app.use("/api/program-category", require("./routes/programCategoryRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/system-user", require("./routes/systemUserRoutes"));
app.use("/api/radio-program", require("./routes/radioProgramRoutes"));
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/user-permissions", require("./routes/userPermissionsRoutes"));
app.use("/api/expense", require("./routes/expenseRoutes"));
app.use("/api/paid-through", require("./routes/paidThroughRoutes"));
app.use("/api/payment-mode", require("./routes/paymentModeRoutes"));
app.use("/api/merchant", require("./routes/merchantRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/budget-category", require("./routes/budgetCategoryRoutes"));
app.use("/api/budget", require("./routes/budgetRoutes"));
app.use("/api/budget-tax", require("./routes/budgetTaxesRoutes"));
app.use("/api/budget-merchant", require("./routes/budgetMerchantRoutes"));
app.use("/api/budget-units", require("./routes/budgetUnitsRoutes"));
app.use("/api/enquiry", require("./routes/enquiryRoutes"));
app.use("/api/careers", require("./routes/careerRoutes"));
app.use("/api/advertisement", require("./routes/advertisementRoutes"));
app.use("/api/financial-year", require("./routes/financialYearRoutes"));
app.use("/api/expense-bills", require("./routes/expenseBillRoutes"));
app.use("/api/agreement-category", require("./routes/agreementCategoryRoutes"));
app.use("/api/payslip-category", require("./routes/payslipComponentRoutes"));
app.use("/api/payslip", require("./routes/payslipRoutes"));

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH"],
  },
});
const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    const initAllSockets = require("./sockets");
    initAllSockets(io);
  })
  .catch((err) => {
    console.error("Redis connection error:", err);
  });

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server with Socket.IO running on port ${PORT}`);
});
