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
app.use("/api/audit-log", require("./routes/auditLogsRoutes"));

//podcasts
app.use("/api/podcasts", require("./routes/podcastRoutes"));
app.use("/api/podcast-category", require("./routes/podcastCategoryRoutes"));

app.use("/api/popup-banner", require("./routes/popupBannerRoutes"));
app.use("/share", require("./routes/shareRoutes"));
app.use("/api/agreements", require("./routes/agreementRoutes"));
app.use("/api/passwords", require("./routes/passwordManagerRoutes"));

//Radio programs
app.use("/api/radio-station", require("./routes/radioStationRoutes"));
app.use("/api/program-category", require("./routes/programCategoryRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/system-user", require("./routes/systemUserRoutes"));
app.use("/api/radio-program", require("./routes/radioProgramRoutes"));
app.use("/api/program-question", require("./routes/programQuestionRoutes"));

//Module Routes
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/user-permissions", require("./routes/userPermissionsRoutes"));

//expense Routes
app.use("/api/expense", require("./routes/expenseRoutes"));
app.use("/api/paid-through", require("./routes/paidThroughRoutes"));
app.use("/api/payment-mode", require("./routes/paymentModeRoutes"));
app.use("/api/merchant", require("./routes/merchantRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));

//Budget Routes
app.use("/api/budget-category", require("./routes/budgetCategoryRoutes"));
app.use("/api/budget", require("./routes/budgetRoutes"));
app.use("/api/budget-tax", require("./routes/budgetTaxesRoutes"));
app.use("/api/budget-merchant", require("./routes/budgetMerchantRoutes"));
app.use("/api/budget-units", require("./routes/budgetUnitsRoutes"));

//enquiry Routes
app.use("/api/enquiry", require("./routes/enquiryRoutes"));
app.use("/api/careers", require("./routes/careerRoutes"));
app.use("/api/advertisement", require("./routes/advertisementRoutes"));

//Audit Bill Routes
app.use("/api/financial-year", require("./routes/financialYearRoutes"));
app.use("/api/expense-bills", require("./routes/expenseBillRoutes"));
app.use("/api/agreement-category", require("./routes/agreementCategoryRoutes"));

//payslip-Routes
app.use("/api/payslip-category", require("./routes/payslipComponentRoutes"));
app.use("/api/payslip", require("./routes/payslipRoutes"));

//Festival-Images-Routes
app.use("/api/festival-gif", require("./routes/festivalGifRoutes"));

//Visitor Tracking Routes
app.use("/api/visit", require("./routes/visitorsRoutes"));
app.use(
  "/api/previous-employment",
  require("./routes/previousEmploymentRoutes")
);

//employee-document-routes
app.use("/api/employee-documents", require("./routes/employeeDocumentsRoutes"));
app.use("/api/experience-letter", require("./routes/experienceLetterRoutes"));

// News Router
app.use("/api/news-category", require("./routes/newsCategoryRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));
app.use("/api/news-media", require("./routes/newsMediaRoutes"));
app.use("/api/news-reactions", require("./routes/newsReactionRoutes"));
app.use("/api/news-comments", require("./routes/newsCommentsRoutes"));

//Event Router
app.use("/api/event", require("./routes/eventRoutes"));
app.use("/api/event-banner", require("./routes/eventBannerRoutes"));
app.use("/api/event-amenity", require("./routes/eventAmenityRoutes"));
app.use("/api/event-crew", require("./routes/eventCrewMemberRoutes"));

//notification
app.use("/api/notifications", require("./routes/notificationRoutes"));

//RJ Details
app.use("/api/rj-details", require("./routes/rjDetailsRoutes"));

//Blogs
app.use("/api/blogs-category", require("./routes/blogsCategoryRoutes"));
app.use("/api/blogs", require("./routes/blogsRoutes"));

//Podcast Creator
app.use("/api/creator", require("./routes/podcastCreatorRoutes"));

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH"],
  },
});

app.set("io", io);

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
