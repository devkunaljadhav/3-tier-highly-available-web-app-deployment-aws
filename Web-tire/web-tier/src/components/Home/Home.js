import React, { Component } from 'react';
import architecture from '../../assets/3TierArch.png';

class Home extends Component {
  render() {
    return (
      <div style={{ textAlign: 'center', padding: '20px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '10px', fontWeight: '700', color: '#ffffff' }}>
          AWS 3-Tier Enterprise Architecture
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', marginBottom: '25px' }}>
          Production-Ready Scalable Deployment on Amazon Web Services (Web Tier, App Tier, Database Tier)
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          marginBottom: '30px'
        }}>
          <img
            src={architecture}
            alt="3-Tier Web Application Architecture Diagram"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left' }}>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>🌐 Presentation Tier</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8' }}>
              React.js single-page application served via Nginx Reverse Proxy with External Application Load Balancer in Public Subnets.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#34d399' }}>⚙️ Application Tier</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8' }}>
              Node.js Express REST API running under PM2 Process Manager, load-balanced across Private Subnets via Internal ALB.
            </p>
          </div>

          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fbbf24' }}>🗄️ Database Tier</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#94a3b8' }}>
              Amazon RDS MySQL Multi-AZ deployed in isolated Private DB Subnets, accessible only from the Application Tier security group.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;