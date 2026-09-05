const dbcreds = require('./DbConfig');
const mysql = require('mysql2');

// Use Connection Pool for resiliency, auto-reconnect, and multi-user performance
const pool = mysql.createPool({
    host: dbcreds.DB_HOST,
    user: dbcreds.DB_USER,
    password: dbcreds.DB_PWD,
    database: dbcreds.DB_DATABASE,
    port: dbcreds.DB_PORT,
    waitForConnections: true,
    connectionLimit: dbcreds.DB_CONNECTION_LIMIT || 10,
    queueLimit: 0
});

// Check database connectivity
function checkDbHealth(callback) {
    pool.query('SELECT 1 + 1 AS health_check', (err, results) => {
        if (err) {
            return callback(err, null);
        }
        return callback(null, { status: 'connected', server: dbcreds.DB_HOST });
    });
}

function addTransaction(amount, desc, callback) {
    const sql = 'INSERT INTO `transactions` (`amount`, `description`) VALUES (?, ?)';
    pool.query(sql, [amount, desc], function (err, result) {
        if (err) {
            console.error('Error inserting transaction:', err.message);
            if (callback) return callback(err, null);
            return;
        }
        console.log('Transaction inserted successfully with ID:', result.insertId);
        if (callback) return callback(null, result);
    });
}

function getAllTransactions(callback) {
    const sql = 'SELECT id, amount, description FROM `transactions` ORDER BY id DESC';
    pool.query(sql, function (err, results) {
        if (err) {
            console.error('Error fetching transactions:', err.message);
            return callback(err, null);
        }
        return callback(null, results);
    });
}

function findTransactionById(id, callback) {
    const sql = 'SELECT id, amount, description FROM `transactions` WHERE id = ?';
    pool.query(sql, [id], function (err, results) {
        if (err) {
            console.error(`Error retrieving transaction with id ${id}:`, err.message);
            return callback(err, null);
        }
        return callback(null, results);
    });
}

function deleteAllTransactions(callback) {
    const sql = 'DELETE FROM `transactions`';
    pool.query(sql, function (err, result) {
        if (err) {
            console.error('Error deleting all transactions:', err.message);
            return callback(err, null);
        }
        console.log('Deleted all transactions. Rows affected:', result.affectedRows);
        return callback(null, result);
    });
}

function deleteTransactionById(id, callback) {
    const sql = 'DELETE FROM `transactions` WHERE id = ?';
    pool.query(sql, [id], function (err, result) {
        if (err) {
            console.error(`Error deleting transaction with id ${id}:`, err.message);
            return callback(err, null);
        }
        console.log(`Deleted transaction with id ${id}. Rows affected:`, result.affectedRows);
        return callback(null, result);
    });
}

module.exports = {
    pool,
    checkDbHealth,
    addTransaction,
    getAllTransactions,
    findTransactionById,
    deleteAllTransactions,
    deleteTransactionById
};








