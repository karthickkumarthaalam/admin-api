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


sequelize.authenticate()
    .then(() => console.log('Database connected'))
    .catch(err => console.log('Error: ' + err));

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

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;