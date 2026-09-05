import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './global';
import { theme } from './theme';
import { Navbar, Home, DatabaseDemo, SystemHealth, ToastProvider } from './components';
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

function App() {
  const [apiHealthStatus, setApiHealthStatus] = useState('checking');

  useEffect(() => {
    let isMounted = true;

    const pingHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (isMounted) {
          if (res.ok) {
            setApiHealthStatus('healthy');
          } else {
            setApiHealthStatus('standby');
          }
        }
      } catch (err) {
        if (isMounted) {
          setApiHealthStatus('standby');
        }
      }
    };

    pingHealth();
    const interval = setInterval(pingHealth, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        <GlobalStyles />
        <Router>
          <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar apiHealthStatus={apiHealthStatus} />
            
            <main style={{ flex: 1 }}>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route path="/db">
                  <DatabaseDemo />
                </Route>
                <Route path="/health">
                  <SystemHealth />
                </Route>
                <Redirect to="/" />
              </Switch>
            </main>

            {/* Enterprise Cloud Footer */}
            <footer style={{
              background: 'rgba(8, 12, 20, 0.85)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1.75rem 1.5rem',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '0.85rem'
            }}>
              <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: '700' }}>AWS 3-Tier Enterprise Stack</span>
                  <span>•</span>
                  <span>Multi-AZ Subnet Isolation</span>
                </div>
                <div>
                  <span>Powered by React 18 • Node.js Express • Amazon Aurora MySQL</span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

