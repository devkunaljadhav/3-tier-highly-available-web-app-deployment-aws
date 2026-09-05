import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::after, *::before {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    background: #080c14;
    background-image: 
      radial-gradient(at 0% 0%, rgba(14, 165, 233, 0.12) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(255, 153, 0, 0.08) 0px, transparent 50%),
      radial-gradient(at 50% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%);
    background-attachment: fixed;
    color: #f8fafc;
    min-height: 100vh;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
    overflow-x: hidden;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #0b1120;
  }
  ::-webkit-scrollbar-thumb {
    background: #1e293b;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #334155;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #f8fafc;
  }

  code, pre {
    font-family: 'JetBrains Mono', monospace;
  }

  button, input, select, textarea {
    font-family: inherit;
  }

  a {
    color: #38bdf8;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  a:hover {
    color: #7dd3fc;
  }

  /* Glassmorphism card helpers */
  .glass-card {
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .glow-border {
    position: relative;
  }
  .glow-border::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.4), rgba(255, 153, 0, 0.2));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @keyframes pulseGlow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;