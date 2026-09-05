require('dotenv').config();

module.exports = Object.freeze({
    DB_HOST: process.env.DB_HOST || 'my3tierdb.c9m8ywsmmn3q.ap-south-1.rds.amazonaws.com',
    DB_USER: process.env.DB_USER || 'admin',
    DB_PWD: process.env.DB_PASSWORD || process.env.DB_PWD || 'root123456',
    DB_DATABASE: process.env.DB_NAME || process.env.DB_DATABASE || 'webappdb',
    DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
    DB_CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10)
});

