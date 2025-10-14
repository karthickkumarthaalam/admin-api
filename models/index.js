const { Sequelize } = require("sequelize");
const config = require("../config/db");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Error: " + err));

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user")(sequelize, Sequelize);
db.Coupon = require("./coupon")(sequelize, Sequelize);
db.Currency = require("./currency")(sequelize, Sequelize);
db.Package = require("./package")(sequelize, Sequelize);
db.CouponPackage = require("./couponPackage")(sequelize, Sequelize);
db.Members = require("./members")(sequelize, Sequelize);
db.MemberPackage = require("./memberPackage")(sequelize, Sequelize);
db.Transaction = require("./transaction")(sequelize, Sequelize);
db.Banner = require("./banner")(sequelize, Sequelize);
db.Podcast = require("./podcast")(sequelize, Sequelize);
db.PodcastComment = require("./podcastComment")(sequelize, Sequelize);
db.PodcastReaction = require("./podcastReaction")(sequelize, Sequelize);
db.PopupBanner = require("./popupBanner")(sequelize, Sequelize);
db.SystemUsers = require("./systemUser")(sequelize, Sequelize);
db.Agreement = require("./agreement")(sequelize, Sequelize);
db.PasswordManager = require("./passwordManager")(sequelize, Sequelize);
db.PasswordManagerAccess = require("./passwordManagerAccess")(
  sequelize,
  Sequelize
);
db.RadioStation = require("./radioStation")(sequelize, Sequelize);
db.ProgramCategory = require("./programCategory")(sequelize, Sequelize);
db.Department = require("./department")(sequelize, Sequelize);
db.RadioProgram = require("./radioProgram")(sequelize, Sequelize);
db.Module = require("./module")(sequelize, Sequelize);
db.UserPermission = require("./userPermission")(sequelize, Sequelize);
db.Expenses = require("./expense")(sequelize, Sequelize);
db.ExpenseCategory = require("./expenseCategory")(sequelize, Sequelize);
db.PaidThrough = require("./paidThrough")(sequelize, Sequelize);
db.PaymentMode = require("./paymentMode")(sequelize, Sequelize);
db.Merchant = require("./merchant")(sequelize, Sequelize);
db.Category = require("./category")(sequelize, Sequelize);
db.BudgetCategory = require("./budgetCategory")(sequelize, Sequelize);
db.Budget = require("./budget")(sequelize, Sequelize);
db.BudgetItem = require("./budgetItem")(sequelize, Sequelize);
db.BudgetTaxes = require("./budgetTaxes")(sequelize, Sequelize);
db.BudgetTaxApplication = require("./budgetTaxApplication")(
  sequelize,
  Sequelize
);
db.BudgetMerchant = require("./budgetMerchant")(sequelize, Sequelize);
db.BudgetUnits = require("./budgetUnits")(sequelize, Sequelize);
db.Enquiry = require("./enquiry")(sequelize, Sequelize);
db.Careers = require("./careers")(sequelize, Sequelize);
db.Advertisement = require("./advertisement")(sequelize, Sequelize);
db.FinancialYear = require("./financialYear")(sequelize, Sequelize);
db.ExpenseBill = require("./expenseBills")(sequelize, Sequelize);
db.ExpenseBillItem = require("./expenseBillItem")(sequelize, Sequelize);
db.AgreementCategory = require("./agreementCategory")(sequelize, Sequelize);
db.PayslipComponent = require("./payslipComponent")(sequelize, Sequelize);
db.Payslip = require("./payslip")(sequelize, Sequelize);
db.PayslipItem = require("./payslipItem")(sequelize, Sequelize);
db.FestivalGif = require("./festivalGif")(sequelize, Sequelize);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
