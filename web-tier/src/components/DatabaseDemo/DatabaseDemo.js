import React, { Component } from 'react';
import './DatabaseDemo.css';

class DatabaseDemo extends Component {
    constructor(props) {
        super(props);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleButtonClickDel = this.handleButtonClickDel.bind(this);
        this.handleDeleteSingle = this.handleDeleteSingle.bind(this);
        this.state = {
            transactions: [],
            text_amt: "",
            text_desc: "",
            loading: false,
            message: "",
            messageType: "" // 'success' or 'error'
        };
    }

    componentDidMount() {
        this.populateData();
    }

    setMessage(msg, type = 'info', duration = 4000) {
        this.setState({ message: msg, messageType: type });
        if (duration > 0) {
            setTimeout(() => {
                if (this.state.message === msg) {
                    this.setState({ message: "", messageType: "" });
                }
            }, duration);
        }
    }

    async fetchWithRetry(url, options = {}, retries = 3) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }
            return res;
        } catch (err) {
            if (retries <= 1) throw err;
            await new Promise(resolve => setTimeout(resolve, 800));
            return await this.fetchWithRetry(url, options, retries - 1);
        }
    }

    populateData() {
        this.setState({ loading: true });
        this.fetchWithRetry('/api/transaction', { method: 'GET' }, 3)
            .then(res => res.json())
            .then((data) => {
                const list = data.result || [];
                this.setState({ transactions: list, loading: false });
            })
            .catch((err) => {
                console.error("Failed to fetch transactions:", err);
                this.setState({ loading: false });
                this.setMessage("Could not connect to Backend or Database. Verify your ALB/RDS setup.", "error", 6000);
            });
    }

    handleButtonClickDel() {
        if (!window.confirm("Are you sure you want to delete ALL transactions?")) {
            return;
        }

        this.setState({ loading: true });
        this.fetchWithRetry('/api/transaction', { method: 'DELETE' }, 2)
            .then(res => res.json())
            .then((data) => {
                this.setState({ text_amt: "", text_desc: "", transactions: [], loading: false });
                this.setMessage("All transactions deleted successfully.", "success");
            })
            .catch((err) => {
                this.setState({ loading: false });
                this.setMessage("Failed to delete all transactions: " + err.message, "error");
            });
    }

    handleDeleteSingle(id) {
        this.setState({ loading: true });
        this.fetchWithRetry(`/api/transaction/${id}`, { method: 'DELETE' }, 2)
            .then(res => res.json())
            .then((data) => {
                this.setMessage(`Transaction #${id} deleted.`, "success");
                this.populateData();
            })
            .catch((err) => {
                this.setState({ loading: false });
                this.setMessage(`Failed to delete transaction #${id}: ${err.message}`, "error");
            });
    }

    handleButtonClick(e) {
        e.preventDefault();
        const { text_amt, text_desc } = this.state;

        if (!text_amt || !text_desc) {
            this.setMessage("Please provide both an amount and a description.", "error");
            return;
        }

        if (isNaN(text_amt) || Number(text_amt) <= 0) {
            this.setMessage("Please enter a valid positive numeric amount.", "error");
            return;
        }

        this.setState({ loading: true });
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: text_amt, desc: text_desc })
        };

        this.fetchWithRetry('/api/transaction', requestOptions, 2)
            .then(res => res.json())
            .then((data) => {
                this.setState({ text_amt: "", text_desc: "" });
                this.setMessage("Transaction added successfully!", "success");
                this.populateData();
            })
            .catch((err) => {
                this.setState({ loading: false });
                this.setMessage("Failed to add transaction: " + err.message, "error");
            });
    }

    handleTextChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    renderTableData() {
        if (this.state.transactions.length === 0) {
            return (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        {this.state.loading ? 'Fetching transactions from Aurora/RDS MySQL...' : 'No transactions found in Database. Add one using the form above!'}
                    </td>
                </tr>
            );
        }

        return this.state.transactions.map((transaction) => {
            const { id, amount, description } = transaction;
            return (
                <tr key={id} className="data-row">
                    <td><strong>#{id}</strong></td>
                    <td style={{ color: '#38bdf8', fontWeight: '600' }}>${Number(amount).toFixed(2)}</td>
                    <td>{description}</td>
                    <td style={{ textAlign: 'center' }}>
                        <button
                            className="btn-delete-single"
                            onClick={() => this.handleDeleteSingle(id)}
                            title="Delete this transaction"
                        >
                            🗑️ Delete
                        </button>
                    </td>
                </tr>
            );
        });
    }

    render() {
        const { message, messageType, loading, text_amt, text_desc, transactions } = this.state;

        return (
            <div className="database-container">
                <div className="header-bar">
                    <div>
                        <h1 id='title'>RDS MySQL Database Transactions</h1>
                        <p className="subtitle">Live 3-Tier CRUD Operations across Web, App & Database Tiers</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn-refresh"
                            onClick={() => this.populateData()}
                            disabled={loading}
                        >
                            🔄 Refresh
                        </button>
                        <button
                            className="btn-delete-all"
                            onClick={this.handleButtonClickDel}
                            disabled={loading || transactions.length === 0}
                        >
                            ⚠️ Delete All
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`alert-banner alert-${messageType}`}>
                        {messageType === 'success' ? '✅ ' : '❌ '} {message}
                    </div>
                )}

                <div className="card add-card">
                    <h3>➕ Add New Transaction</h3>
                    <form className="add-form" onSubmit={this.handleButtonClick}>
                        <div className="form-group">
                            <label htmlFor="text_amt">Amount ($):</label>
                            <input
                                id="text_amt"
                                type="number"
                                step="0.01"
                                name="text_amt"
                                placeholder="e.g. 150.00"
                                value={text_amt}
                                onChange={this.handleTextChange}
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="text_desc">Description:</label>
                            <input
                                id="text_desc"
                                type="text"
                                name="text_desc"
                                placeholder="e.g. AWS EC2 Cloud Invoice"
                                value={text_desc}
                                onChange={this.handleTextChange}
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Processing...' : 'Add Transaction'}
                        </button>
                    </form>
                </div>

                <div className="card table-card">
                    <div className="table-header-info">
                        <h3>📋 Transaction History ({transactions.length} records)</h3>
                    </div>
                    <div className="table-responsive">
                        <table id='transactions'>
                            <thead>
                                <tr>
                                    <th style={{ width: '15%' }}>ID</th>
                                    <th style={{ width: '25%' }}>AMOUNT</th>
                                    <th style={{ width: '45%' }}>DESCRIPTION</th>
                                    <th style={{ width: '15%', textAlign: 'center' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderTableData()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default DatabaseDemo;