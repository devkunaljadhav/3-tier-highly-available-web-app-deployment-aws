import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import architecture from '../../assets/3TierArch.png';
import './Home.css';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);


  const tiers = [
    {
      id: 'web',
      name: 'Tier 1: Web / Presentation',
      badge: 'Public / Web Subnet',
      badgeColor: 'badge-cyan',
      icon: '🌐',
      description: 'Customer-facing frontend layer hosted on Nginx and React.js, distributed across multiple Availability Zones behind an Internet-facing Application Load Balancer.',
      specs: [
        { label: 'Technology', value: 'React 18 + Nginx Reverse Proxy' },
        { label: 'Load Balancer', value: 'Internet-facing ALB (Port 80/443)' },
        { label: 'Security Group', value: 'Inbound HTTP/HTTPS from 0.0.0.0/0' },
        { label: 'High Availability', value: 'Multi-AZ Auto Scaling Group' },
      ],
    },
    {
      id: 'app',
      name: 'Tier 2: Application Logic',
      badge: 'Private App Subnet',
      badgeColor: 'badge-purple',
      icon: '⚙️',
      description: 'Decoupled RESTful backend API powered by Node.js & Express. Securely routed via an Internal Application Load Balancer with zero direct public access.',
      specs: [
        { label: 'Technology', value: 'Node.js + Express.js API' },
        { label: 'Load Balancer', value: 'Internal ALB (Port 80 / 4000)' },
        { label: 'Security Group', value: 'Strictly accepts traffic from Web Tier SG' },
        { label: 'Endpoints', value: '/health, /transaction (CRUD)' },
      ],
    },
    {
      id: 'db',
      name: 'Tier 3: Aurora Database',
      badge: 'Isolated DB Subnet',
      badgeColor: 'badge-amber',
      icon: '🗄️',
      description: 'Enterprise-grade Amazon Aurora MySQL cluster in dedicated database subnets. Features automatic multi-AZ synchronous replication and sub-second failover.',
      specs: [
        { label: 'Technology', value: 'Amazon Aurora MySQL (Multi-AZ)' },
        { label: 'Port / Protocol', value: 'MySQL Port 3306' },
        { label: 'Security Group', value: 'Strictly accepts traffic from App Tier SG' },
        { label: 'Storage & Backup', value: 'Continuous S3 automated snapshots' },
      ],
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge-container">
          <span className="hero-pill">
            <span className="pulse-dot"></span>
            AWS CLOUD ENTERPRISE ARCHITECTURE
          </span>
          <span className="hero-pill-secondary">3-TIER PRODUCTION BLUEPRINT</span>
        </div>

        <h1 className="hero-title">
          Scalable, Secure & Resilient <br />
          <span className="gradient-text">AWS 3-Tier Web Application</span>
        </h1>

        <p className="hero-subtitle">
          Engineered with complete subnet isolation, dual Application Load Balancers, 
          and Amazon Aurora Multi-AZ database clustering for zero single-point-of-failure.
        </p>

        <div className="hero-actions">
          <Link to="/db" className="btn-primary">
            <span className="btn-icon">⚡</span>
            Live Database Hub
          </Link>
          <button 
            className="btn-secondary"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="btn-icon">🔍</span>
            Inspect Architecture Diagram
          </button>
          <Link to="/health" className="btn-glass">
            <span className="btn-icon">🩺</span>
            Cloud Health Monitor
          </Link>
        </div>
      </section>

      {/* Architecture Visual Preview Banner */}
      <section className="arch-preview-card">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-tag">REFERENCE BLUEPRINT</div>
            <h2 className="card-title">End-to-End Infrastructure Flow</h2>
          </div>
          <div className="card-header-right">
            <button 
              className="zoom-btn"
              onClick={() => setIsModalOpen(true)}
              title="Click to zoom architecture diagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              Expand Diagram
            </button>
          </div>
        </div>

        {/* Pipeline Step Visualizer */}
        <div className="pipeline-flow">
          <div className="flow-step">
            <div className="flow-icon">🌍</div>
            <div className="flow-label">Route 53 & Users</div>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step">
            <div className="flow-icon">⚖️</div>
            <div className="flow-label">Internet ALB</div>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step highlight-cyan">
            <div className="flow-icon">💻</div>
            <div className="flow-label">Web Tier (React/Nginx)</div>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step">
            <div className="flow-icon">🛡️</div>
            <div className="flow-label">Internal ALB</div>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step highlight-purple">
            <div className="flow-icon">⚙️</div>
            <div className="flow-label">App Tier (Node.js)</div>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step highlight-amber">
            <div className="flow-icon">🗄️</div>
            <div className="flow-label">Aurora DB (Multi-AZ)</div>
          </div>
        </div>

        {/* Diagram Image Container */}
        <div className="diagram-wrapper" onClick={() => setIsModalOpen(true)}>
          <img 
            src={architecture} 
            alt="AWS 3-Tier Web Application Architecture Diagram" 
            className="diagram-img"
          />
          <div className="diagram-overlay">
            <span>Click to open high-resolution view</span>
          </div>
        </div>
      </section>

      {/* Tier Deep-Dive Cards */}
      <section className="tiers-section">
        <div className="section-title-wrap">
          <h2 className="section-title">Architectural Tier Deep Dive</h2>
          <p className="section-desc">Explore security boundaries, traffic routing, and tech stack details for each tier.</p>
        </div>

        <div className="tiers-grid">
          {tiers.map((tier) => (
            <div key={tier.id} className="tier-card">
              <div className="tier-card-header">
                <div className="tier-icon-box">{tier.icon}</div>
                <span className={`tier-badge ${tier.badgeColor}`}>{tier.badge}</span>
              </div>

              <h3 className="tier-name">{tier.name}</h3>
              <p className="tier-description">{tier.description}</p>

              <div className="tier-specs">
                {tier.specs.map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud Best Practices Highlights */}
      <section className="best-practices-section">
        <div className="section-title-wrap">
          <h2 className="section-title">Cloud Architecture Principles</h2>
          <p className="section-desc">Key AWS Well-Architected Framework pillars implemented in this stack.</p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon">🔒</div>
            <h4>Zero Trust Security</h4>
            <p>App and DB tiers reside in private subnets with strict security group chaining preventing unauthorized egress.</p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon">🔄</div>
            <h4>High Availability</h4>
            <p>Cross-AZ deployment with automatic load balancer health checks and Multi-AZ Aurora failover.</p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon">📈</div>
            <h4>Elastic Scalability</h4>
            <p>Stateless web and app layers allow horizontal auto-scaling based on CPU and request load.</p>
          </div>
          <div className="pillar-card">
            <div className="pillar-icon">📊</div>
            <h4>Cloud Operations</h4>
            <p>Integrated `/health` probes, Nginx reverse proxy logs, and unified database connection management.</p>
          </div>
        </div>
      </section>

      {/* Lightbox / Zoom Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>AWS 3-Tier Architecture High-Resolution Blueprint</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <img 
                src={architecture} 
                alt="Detailed 3-Tier Architecture Diagram" 
                className="modal-diagram-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;