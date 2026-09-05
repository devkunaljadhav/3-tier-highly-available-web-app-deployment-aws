import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '../Toast/Toast';
import './DatabaseDemo.css';

// Sample fallback records for seamless demonstration when local backend or Aurora is not connected
const INITIAL_DEMO_DATA = [
  { id: 1, amount: 2450.00, description: "AWS EC2 c5.4xlarge Multi-AZ Cluster" },
  { id: 2, amount: 840.50, description: "Amazon Aurora MySQL db.r5.xlarge Instance" },
  { id: 3, amount: 120.00, description: "Application Load Balancer Ingress Traffic" },
  { id: 4, amount: 65.20, description: "AWS Route 53 DNS & Health Checks" },
  { id: 5, amount: 310.80, description: "Amazon S3 Glacier Deep Archive Backup" },
];

const DatabaseDemo = () => {
  const { addToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Form inputs
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Modals & Mode
  const [showClearModal, setShowClearModal] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [latency, setLatency] = useState(null);

  // Fetch retry implementation
  const fetchRetry = useCallback(async (url, n, options = {}) => {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (n === 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 800));
      return await fetchRetry(url, n - 1, options);
    }
  }, []);

  // Fetch Transactions from API
  const populateData = useCallback(async (showToastNotice = false) => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const res = await fetchRetry('/api/transaction', 2);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      
      const pingMs = Math.round(performance.now() - startTime);
      setLatency(pingMs);

      if (data && Array.isArray(data.result)) {
        setTransactions(data.result);
        setIsDemoMode(false);
        if (showToastNotice) addToast('Database synchronized successfully', 'success');
      } else {
        throw new Error('Unexpected data format');
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable, switching to interactive demo mode:', err.message);
      // Fallback to local demo data if backend is offline
      setTransactions((prev) => (prev.length > 0 ? prev : INITIAL_DEMO_DATA));
      setIsDemoMode(true);
      setLatency(12);
      if (showToastNotice) {
        addToast('Running in Demo Mode (App Tier offline)', 'info');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchRetry, addToast]);

  useEffect(() => {
    populateData();
  }, [populateData]);

  // Handle Add Transaction
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      addToast('Please enter a valid positive amount', 'warning');
      return;
    }
    if (!description.trim()) {
      addToast('Please provide a transaction description', 'warning');
      return;
    }

    setSubmitting(true);
    const numericAmount = parseFloat(amount);
    const cleanDesc = description.trim();

    try {
      if (isDemoMode) {
        // Handle in-memory demo mode
        const newId = transactions.length > 0 ? Math.max(...transactions.map(t => Number(t.id) || 0)) + 1 : 1;
        const newRecord = { id: newId, amount: numericAmount, description: cleanDesc };
        setTransactions(prev => [newRecord, ...prev]);
        addToast(`Transaction #${newId} recorded successfully!`, 'success');
      } else {
        const res = await fetch('/api/transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numericAmount, desc: cleanDesc }),
        });
        if (!res.ok) throw new Error('Failed to record transaction');
        addToast('Transaction recorded in Amazon Aurora DB!', 'success');
        await populateData();
      }

      setAmount('');
      setDescription('');
    } catch (err) {
      addToast(`Error adding transaction: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Individual Record
  const handleDeleteItem = async (id) => {
    try {
      if (isDemoMode) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        addToast(`Transaction #${id} deleted`, 'info');
      } else {
        const res = await fetch('/api/transaction/id', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('Failed to delete item');
        addToast(`Transaction #${id} deleted from database`, 'info');
        await populateData();
      }
    } catch (err) {
      addToast(`Error deleting transaction: ${err.message}`, 'error');
    }
  };

  // Delete All Records
  const handleClearAll = async () => {
    setShowClearModal(false);
    try {
      if (isDemoMode) {
        setTransactions([]);
        addToast('All transactions cleared (Demo Mode)', 'info');
      } else {
        const res = await fetch('/api/transaction', { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to clear transactions');
        addToast('All records wiped from Amazon Aurora DB', 'info');
        await populateData();
      }
    } catch (err) {
      addToast(`Error clearing database: ${err.message}`, 'error');
    }
  };

  // Quick Preset Amount
  const applyPreset = (presetAmt, presetDesc) => {
    setAmount(presetAmt.toString());
    if (presetDesc) setDescription(presetDesc);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const count = transactions.length;
    const total = transactions.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
    const avg = count > 0 ? total / count : 0;
    return { count, total, avg };
  }, [transactions]);

  // Filter & Sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const desc = (t.description || '').toLowerCase();
        const id = (t.id || '').toString();
        const query = searchQuery.toLowerCase();
        return desc.includes(query) || id.includes(query);
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (Number(b.id) || 0) - (Number(a.id) || 0);
        if (sortBy === 'oldest') return (Number(a.id) || 0) - (Number(b.id) || 0);
        if (sortBy === 'highest') return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
        if (sortBy === 'lowest') return (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0);
        return 0;
      });
  }, [transactions, searchQuery, sortBy]);

  return (
    <div className="database-page-container">
      {/* Header Banner */}
      <div className="db-header-row">
        <div>
          <div className="db-badge">
            <span className="dot-pulsing"></span>
            PERSISTENCE TIER • AMAZON AURORA MYSQL
          </div>
          <h1 className="db-title">Aurora Transaction Management Hub</h1>
          <p className="db-subtitle">
            Synchronous Multi-AZ transactional ledger managed through decoupled REST APIs.
          </p>
        </div>

        <div className="db-header-actions">
          <button 
            className="db-btn-refresh" 
            onClick={() => populateData(true)}
            disabled={loading}
            title="Refresh database records"
          >
            <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
            Refresh
          </button>
          
          {transactions.length > 0 && (
            <button 
              className="db-btn-danger" 
              onClick={() => setShowClearModal(true)}
            >
              🗑️ Clear Ledger
            </button>
          )}
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="demo-mode-alert">
          <div className="alert-left">
            <span className="alert-icon">💡</span>
            <div>
              <strong>Interactive Demo Mode Active</strong>
              <p>The frontend is simulating live transactions in-memory. Once deployed behind your App Tier & Aurora cluster, requests route automatically.</p>
            </div>
          </div>
          <button 
            className="btn-seed"
            onClick={() => setTransactions(INITIAL_DEMO_DATA)}
          >
            Load Sample Data
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box cyan">💵</div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL VOLUME</span>
            <span className="kpi-value">
              ${stats.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="kpi-subtext">Sum of all active ledger entries</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box purple">📝</div>
          <div className="kpi-info">
            <span className="kpi-label">TRANSACTION COUNT</span>
            <span className="kpi-value">{stats.count}</span>
            <span className="kpi-subtext">Committed database rows</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box amber">📊</div>
          <div className="kpi-info">
            <span className="kpi-label">AVERAGE TICKET</span>
            <span className="kpi-value">
              ${stats.avg.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="kpi-subtext">Per-transaction volume mean</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box emerald">⚡</div>
          <div className="kpi-info">
            <span className="kpi-label">TIER LATENCY</span>
            <span className="kpi-value">{latency !== null ? `${latency} ms` : 'Testing...'}</span>
            <span className="kpi-subtext">Roundtrip HTTP + DB handshake</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Quick Add Card + Transactions Table */}
      <div className="db-layout-grid">
        {/* Left Column: Quick Add Form */}
        <div className="card-form-wrapper">
          <div className="form-card">
            <div className="form-card-header">
              <span className="form-tag">NEW RECORD</span>
              <h3 className="form-card-title">Add Transaction</h3>
              <p className="form-card-desc">Dispatches HTTP POST to App Tier <code>/api/transaction</code></p>
            </div>

            <form onSubmit={handleAddTransaction} className="transaction-form">
              <div className="form-group">
                <label htmlFor="amount">Transaction Amount (USD)</label>
                <div className="input-currency-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="preset-buttons">
                <button type="button" onClick={() => applyPreset(150.00, 'AWS EC2 Compute Instance')}>+$150</button>
                <button type="button" onClick={() => applyPreset(500.00, 'Amazon Aurora DB IOPS Provision')}>+$500</button>
                <button type="button" onClick={() => applyPreset(75.50, 'S3 Standard Storage')}>+$75.50</button>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description / Memo</label>
                <input
                  id="description"
                  type="text"
                  placeholder="e.g. AWS CloudFront Ingress Egress"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit-tx" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Writing to Aurora...
                  </>
                ) : (
                  <>
                    <span>➕ Commit Transaction</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transactions Ledger */}
        <div className="ledger-wrapper">
          <div className="ledger-card">
            {/* Filter and Search Bar */}
            <div className="ledger-toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by ID or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>

              <div className="filter-group">
                <label>Sort:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount</option>
                  <option value="lowest">Lowest Amount</option>
                </select>
              </div>
            </div>

            {/* Table or Empty State */}
            {loading && transactions.length === 0 ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Connecting to AWS Aurora Database cluster...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>No Transactions Found</h4>
                <p>
                  {searchQuery 
                    ? `No records matching "${searchQuery}"`
                    : 'The transaction ledger is currently empty. Add your first record above!'}
                </p>
                {searchQuery && (
                  <button className="btn-secondary-sm" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px' }}>ID</th>
                      <th>DESCRIPTION</th>
                      <th style={{ textAlign: 'right', width: '160px' }}>AMOUNT</th>
                      <th style={{ textAlign: 'center', width: '80px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="table-row">
                        <td>
                          <span className="id-badge">#{tx.id}</span>
                        </td>
                        <td>
                          <div className="desc-cell">
                            <span className="tx-dot"></span>
                            <span className="tx-desc-text">{tx.description}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="amount-badge">
                            ${parseFloat(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-delete-row"
                            onClick={() => handleDeleteItem(tx.id)}
                            title={`Delete transaction #${tx.id}`}
                            aria-label={`Delete transaction #${tx.id}`}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing All */}
      {showClearModal && (
        <div className="modal-backdrop" onClick={() => setShowClearModal(false)}>
          <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Database Wipe</h3>
              <button className="modal-close-btn" onClick={() => setShowClearModal(false)}>✕</button>
            </div>
            <div className="modal-body-confirm">
              <div className="danger-icon-large">⚠️</div>
              <p>
                Are you sure you want to delete all <strong>{transactions.length}</strong> transactions from the AWS Aurora Database ledger?
              </p>
              <p className="danger-subtext">This will issue an HTTP DELETE to the App Tier and purge all rows.</p>
              
              <div className="modal-confirm-actions">
                <button className="btn-cancel" onClick={() => setShowClearModal(false)}>
                  Cancel
                </button>
                <button className="btn-confirm-delete" onClick={handleClearAll}>
                  Yes, Wipe Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDemo;