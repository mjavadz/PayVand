import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WalletProvider } from './context/WalletContext';
import { injectCSPMetaTag } from './utils/security';
import './index.css';

// Inject Content Security Policy meta tag on client startup
injectCSPMetaTag();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>
);
