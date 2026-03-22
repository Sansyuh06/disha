import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { AccessibilityProvider } from './contexts/AccessibilityContext.tsx'
import { CustomerProvider } from './contexts/CustomerContext.tsx'
import { QueueProvider } from './contexts/QueueContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import { checkVitaStatus } from './utils/vita'
import './index.css'

// Non-blocking warmup
checkVitaStatus();

function Root() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('kiosk') === 'true') {
      const enterFs = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      };
      document.body.addEventListener('click', enterFs, { once: true });
      document.body.addEventListener('touchstart', enterFs, { once: true });
    }
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <LanguageProvider>
          <AccessibilityProvider>
            <CustomerProvider>
              <QueueProvider>
                <App />
              </QueueProvider>
            </CustomerProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);
