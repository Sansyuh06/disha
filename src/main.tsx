import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext.tsx'
import { AccessibilityProvider } from './contexts/AccessibilityContext.tsx'
import { CustomerProvider } from './contexts/CustomerContext.tsx'
import { QueueProvider } from './contexts/QueueContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
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
  </React.StrictMode>,
)
