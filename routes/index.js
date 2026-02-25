const express = require("express");
const router = express.Router();

// Auth & Core
router.use("/auth", require("./userRoutes"));
router.use("/coupons", require("./couponRoutes"));
router.use("/currency", require("./currencyRoutes"));
router.use("/package", require("./packageRoutes"));
router.use("/members", require("./membersRoutes"));
router.use("/payments", require("./paymentRoutes"));
router.use("/memberPackage", require("./memberPackageRoutes"));
router.use("/transactions", require("./transactionRoutes"));
router.use("/banners", require("./bannerRoutes"));
router.use("/audit-log", require("./auditLogsRoutes"));

// Podcasts
router.use("/podcasts", require("./podcastRoutes"));
router.use("/podcast-category", require("./podcastCategoryRoutes"));
router.use("/creator", require("./podcastCreatorRoutes"));
router.use("/podcast-analytics", require("./podcastAnalyticsRoutes"));

// Popup / Share
router.use("/popup-banner", require("./popupBannerRoutes"));
router.use("/share", require("./shareRoutes"));

// Agreements & Passwords
router.use("/agreements", require("./agreementRoutes"));
router.use("/passwords", require("./passwordManagerRoutes"));

// Radio
router.use("/radio-station", require("./radioStationRoutes"));
router.use("/program-category", require("./programCategoryRoutes"));
router.use("/departments", require("./departmentRoutes"));
router.use("/system-user", require("./systemUserRoutes"));
router.use("/radio-program", require("./radioProgramRoutes"));
router.use("/program-question", require("./programQuestionRoutes"));

// Modules & Permissions
router.use("/modules", require("./moduleRoutes"));
router.use("/user-permissions", require("./userPermissionsRoutes"));

// Expenses
router.use("/expense", require("./expenseRoutes"));
router.use("/paid-through", require("./paidThroughRoutes"));
router.use("/payment-mode", require("./paymentModeRoutes"));
router.use("/merchant", require("./merchantRoutes"));
router.use("/category", require("./categoryRoutes"));

// Budgets
router.use("/budget-category", require("./budgetCategoryRoutes"));
router.use("/budget", require("./budgetRoutes"));
router.use("/budget-tax", require("./budgetTaxesRoutes"));
router.use("/budget-merchant", require("./budgetMerchantRoutes"));
router.use("/budget-units", require("./budgetUnitsRoutes"));

// Enquiry / Career / Ads
router.use("/enquiry", require("./enquiryRoutes"));
router.use("/careers", require("./careerRoutes"));
router.use("/advertisement", require("./advertisementRoutes"));

// Audit Bills
router.use("/financial-year", require("./financialYearRoutes"));
router.use("/expense-bills", require("./expenseBillRoutes"));
router.use("/agreement-category", require("./agreementCategoryRoutes"));

// Payslip
router.use("/payslip-category", require("./payslipComponentRoutes"));
router.use("/payslip", require("./payslipRoutes"));

// Festival
router.use("/festival-gif", require("./festivalGifRoutes"));

// Visitors
router.use("/visit", require("./visitorsRoutes"));
router.use("/previous-employment", require("./previousEmploymentRoutes"));

// Employees
router.use("/employee-documents", require("./employeeDocumentsRoutes"));
router.use("/experience-letter", require("./experienceLetterRoutes"));

// News
router.use("/news-category", require("./newsCategoryRoutes"));
router.use("/news", require("./newsRoutes"));
router.use("/news-media", require("./newsMediaRoutes"));
router.use("/news-reactions", require("./newsReactionRoutes"));
router.use("/news-comments", require("./newsCommentsRoutes"));

// Events
router.use("/event", require("./eventRoutes"));
router.use("/event-banner", require("./eventBannerRoutes"));
router.use("/event-amenity", require("./eventAmenityRoutes"));
router.use("/event-crew", require("./eventCrewMemberRoutes"));
router.use("/event-enquiries", require("./eventEnquiryRoutes"));
router.use("/event-contact-details", require("./eventContactDetailsRoutes"));

// Notifications
router.use("/notifications", require("./notificationRoutes"));

// RJ
router.use("/rj-details", require("./rjDetailsRoutes"));

// Blogs
router.use("/blogs-category", require("./blogsCategoryRoutes"));
router.use("/blogs", require("./blogsRoutes"));

//SummerFestivalRefund
router.use("/summer-festival", require("./summerFestivalRefundRoutes"));

//crewManagement
router.use("/crew-management", require("./crewManagementRoutes"));
router.use("/crew-member", require("./crewMemberRoutes"));
router.use("/crew-flights", require("./crewFlightRoutes"));
router.use("/crew-rooms", require("./crewRoomsRoutes"));
router.use("/crew-document", require("./crewDocumentRoutes"));
router.use("/crew-merchant", require("./crewMerchantRoutes"));

module.exports = router;
