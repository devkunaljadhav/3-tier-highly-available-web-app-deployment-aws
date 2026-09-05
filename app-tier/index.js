const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const transactionService = require('./TransactionService');

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// ROUTES FOR OUR API
// =======================================================

// Enhanced Health Check - verifies node server and DB connectivity
const healthHandler = (req, res) => {
    transactionService.checkDbHealth((err, dbStatus) => {
        const responseData = {
            status: err ? 'DEGRADED' : 'UP',
            tier: 'Application Tier (Backend)',
            timestamp: new Date().toISOString(),
            uptime_seconds: process.uptime(),
            database: err ? { status: 'disconnected', error: err.message } : dbStatus
        };
        
        if (err) {
            return res.status(503).json(responseData);
        }
        return res.status(200).json(responseData);
    });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Simple text health check for backwards compatibility with ALB
app.get('/ping', (req, res) => {
    res.status(200).send('This is the health check');
});

// ADD TRANSACTION
app.post(['/transaction', '/api/transaction'], (req, res) => {
    const { amount, desc, description } = req.body;
    const itemDesc = desc || description;

    if (!amount || !itemDesc) {
        return res.status(400).json({
            success: false,
            message: 'Both amount and desc (description) fields are required'
        });
    }

    transactionService.addTransaction(amount, itemDesc, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to insert transaction into database',
                error: err.message
            });
        }
        return res.status(201).json({
            success: true,
            message: 'added transaction successfully',
            id: result.insertId
        });
    });
});

// GET ALL TRANSACTIONS
app.get(['/transaction', '/api/transaction'], (req, res) => {
    transactionService.getAllTransactions((err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'could not get all transactions',
                error: err.message
            });
        }
        
        const transactionList = results.map(row => ({
            id: row.id,
            amount: row.amount,
            description: row.description
        }));
        
        return res.status(200).json({
            success: true,
            result: transactionList,
            count: transactionList.length
        });
    });
});

// DELETE ALL TRANSACTIONS
app.delete(['/transaction', '/api/transaction'], (req, res) => {
    transactionService.deleteAllTransactions((err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Deleting all transactions failed',
                error: err.message
            });
        }
        return res.status(200).json({
            success: true,
            message: 'delete function execution finished.',
            affectedRows: result.affectedRows
        });
    });
});

// DELETE ONE TRANSACTION (Supports URL params /:id, query ?id=, and body { id })
app.delete(['/transaction/:id', '/api/transaction/:id', '/transaction', '/api/transaction'], (req, res) => {
    const id = req.params.id || req.body.id || req.query.id;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Transaction ID is required to delete an item'
        });
    }

    transactionService.deleteTransactionById(id, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error deleting transaction',
                error: err.message
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: `Transaction with id ${id} not found`
            });
        }
        return res.status(200).json({
            success: true,
            message: `transaction with id ${id} seemingly deleted`
        });
    });
});

// GET SINGLE TRANSACTION (Supports URL params /:id, query ?id=, and body { id })
app.get(['/transaction/:id', '/api/transaction/:id'], (req, res) => {
    const id = req.params.id || req.body.id || req.query.id;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'Transaction ID is required'
        });
    }

    transactionService.findTransactionById(id, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error retrieving transaction',
                error: err.message
            });
        }
        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Transaction with id ${id} not found`
            });
        }
        const item = results[0];
        return res.status(200).json({
            id: item.id,
            amount: item.amount,
            desc: item.description,
            description: item.description
        });
    });
});

// Global 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

app.listen(port, () => {
    console.log(`========================================`);
    console.log(`AWS 3-Tier Backend App listening on port ${port}`);
    console.log(`Health endpoint: http://localhost:${port}/health`);
    console.log(`========================================`);
});

