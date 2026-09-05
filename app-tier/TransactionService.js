const dbcreds = require('./DbConfig');
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: dbcreds.DB_HOST,
    user: dbcreds.DB_USER,
    password: dbcreds.DB_PWD,
    database: dbcreds.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

pool.on('error', (err) => {
    console.error('MySQL Pool Error:', err.message);
});

function addTransaction(amount, desc, callback) {
    const query = 'INSERT INTO `transactions` (`amount`, `description`) VALUES (?, ?)';
    pool.query(query, [amount, desc], function(err, result) {
        if (err) {
            console.error("Error inserting transaction:", err.message);
            if (callback) return callback(err, null);
            return;
        }
        console.log("Transaction inserted successfully");
        if (callback) callback(null, result);
    });
    return 200;
}

function getAllTransactions(callback) {
    const query = "SELECT * FROM transactions ORDER BY id DESC";
    pool.query(query, function(err, result) {
        if (err) {
            console.error("Error retrieving transactions:", err.message);
            return callback([]);
        }
        console.log("Retrieved transactions from database");
        return callback(result || []);
    });
}

function findTransactionById(id, callback) {
    const query = 'SELECT * FROM transactions WHERE id = ?';
    pool.query(query, [id], function(err, result) {
        if (err) {
            console.error(`Error finding transaction #${id}:`, err.message);
            return callback([]);
        }
        return callback(result || []);
    });
}

function deleteAllTransactions(callback) {
    const query = "DELETE FROM transactions";
    pool.query(query, function(err, result) {
        if (err) {
            console.error("Error deleting all transactions:", err.message);
            return callback(err);
        }
        console.log("Deleted all transactions");
        return callback(null, result);
    });
}

function deleteTransactionById(id, callback) {
    const query = 'DELETE FROM transactions WHERE id = ?';
    pool.query(query, [id], function(err, result) {
        if (err) {
            console.error(`Error deleting transaction #${id}:`, err.message);
            return callback(err);
        }
        console.log(`Deleted transaction #${id}`);
        return callback(null, result);
    });
}

module.exports = {
    addTransaction,
    getAllTransactions,
    deleteAllTransactions,
    findTransactionById,
    deleteTransactionById
};








