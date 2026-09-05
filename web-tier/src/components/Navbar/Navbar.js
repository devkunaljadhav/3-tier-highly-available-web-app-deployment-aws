import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ apiHealthStatus }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand Logo */}
        <NavLink to="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <svg
              className="brand-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              <path d="M12 12v6" />
              <path d="m15 15-3-3-3 3" />
            </svg>
          </div>
          <div className="brand-text-block">
            <div className="brand-title">
              AWS <span className="highlight-orange">3-TIER</span> HUB
            </div>
            <div className="brand-badge">ENTERPRISE CLOUD</div>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            exact
            to="/"
            className="nav-link"
            activeClassName="active"
          >
            <span className="nav-icon">🏗️</span>
            Architecture Studio
          </NavLink>

          <NavLink
            to="/db"
            className="nav-link"
            activeClassName="active"
          >
            <span className="nav-icon">⚡</span>
            Aurora Transactions
          </NavLink>

          <NavLink
            to="/health"
            className="nav-link"
            activeClassName="active"
          >
            <span className="nav-icon">🩺</span>
            System Health
          </NavLink>
        </nav>

        {/* Status indicator & Actions */}
        <div className="navbar-right">
          <div className={`status-pill ${apiHealthStatus === 'healthy' ? 'online' : apiHealthStatus === 'checking' ? 'checking' : 'standby'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {apiHealthStatus === 'healthy' ? 'App Tier Connected' : apiHealthStatus === 'checking' ? 'Connecting...' : 'App Tier Standby'}
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
