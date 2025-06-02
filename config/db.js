require('dotenv').config();

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "mysql"
    },
    testing: {
        username: process.env.TESTING_DB_USER,
        password: process.env.TESTING_DB_PASS,
        database: process.env.TESTING_DB_NAME,
        host: process.env.TESTING_DB_HOST,
        dialect: "mysql"
    },
    production: {
        username: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASS,
        database: process.env.PROD_DB_NAME,
        host: process.env.PROD_DB_HOST,
        dialect: "mysql"
    }
};
