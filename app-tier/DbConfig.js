module.exports = Object.freeze({
    DB_HOST: process.env.DB_HOST || 'mysqldb.c9m8ywsmmn3q.ap-south-1.rds.amazonaws.com',
    DB_USER: process.env.DB_USER || 'admin',
    DB_PWD: process.env.DB_PWD || 'root123456',
    DB_DATABASE: process.env.DB_DATABASE || 'webappdb'
});

