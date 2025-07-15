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
db.Podcast = require("./podcast")(sequelize, Sequelize);
db.PodcastComment = require("./podcastComment")(sequelize, Sequelize);
db.PodcastReaction = require("./podcastReaction")(sequelize, Sequelize);
db.PopupBanner = require("./popupBanner")(sequelize, Sequelize);
db.SystemUsers = require("./systemUser")(sequelize, Sequelize);
db.Agreement = require("./agreement")(sequelize, Sequelize);
db.PasswordManager = require("./passwordManager")(sequelize, Sequelize);
db.PasswordManagerAccess = require("./passwordManagerAccess")(sequelize, Sequelize);
db.RadioStation = require("./radioStation")(sequelize, Sequelize);
db.ProgramCategory = require("./programCategory")(sequelize, Sequelize);
db.Department = require("./department")(sequelize, Sequelize);
db.RadioProgram = require("./radioProgram")(sequelize, Sequelize);
db.Module = require("./module")(sequelize, Sequelize);
db.UserPermission = require("./userPermission")(sequelize, Sequelize);

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;