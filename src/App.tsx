import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { warmUpTesseract } from './utils/tesseract';
import Home from './pages/Home';
import CustomerApp from './pages/CustomerApp';
import BankerApp from './pages/BankerApp';
import JourneyPlanner from './features/JourneyPlanner/JourneyPlanner';
import DocumentScanner from './features/DocumentScanner/DocumentScanner';
import LoanAdvisor from './features/LoanAdvisor/LoanAdvisor';
import VoiceAssistant from './features/VoiceAssistant/VoiceAssistant';
import FirstSalaryCoach from './features/FirstSalaryCoach/FirstSalaryCoach';
import BereavementCompanion from './features/BereavementMode/BereavementCompanion';
import BankerDashboard from './features/BankerView/BankerDashboard';
import PreVisitAssistant from './features/PreVisit/PreVisitAssistant';
import TransactionOutput from './features/TransactionOutput/TransactionOutput';
import ContactCenter from './features/IVRBot/ContactCenter';

import FeatureErrorBoundary from './components/FeatureErrorBoundary';

export default function App() {
  // REVIEWER FIX: warm up Tesseract on mount (background, no UI)
  useEffect(() => {
    warmUpTesseract();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={
          <FeatureErrorBoundary>
            <Home />
          </FeatureErrorBoundary>
        } />

        <Route path="/customer" element={<CustomerApp />}>
          <Route index element={<Navigate to="/customer/journey" replace />} />
          <Route path="journey" element={
            <FeatureErrorBoundary>
              <JourneyPlanner />
            </FeatureErrorBoundary>
          } />
          <Route path="scan" element={
            <FeatureErrorBoundary>
              <DocumentScanner />
            </FeatureErrorBoundary>
          } />
          <Route path="loan" element={
            <FeatureErrorBoundary>
              <LoanAdvisor />
            </FeatureErrorBoundary>
          } />
          <Route path="voice" element={
            <FeatureErrorBoundary>
              <VoiceAssistant />
            </FeatureErrorBoundary>
          } />
          <Route path="salary" element={
            <FeatureErrorBoundary>
              <FirstSalaryCoach />
            </FeatureErrorBoundary>
          } />
          <Route path="bereavement" element={
            <FeatureErrorBoundary>
              <BereavementCompanion />
            </FeatureErrorBoundary>
          } />
          <Route path="previsit" element={
            <FeatureErrorBoundary>
              <PreVisitAssistant />
            </FeatureErrorBoundary>
          } />
          <Route path="transaction" element={
            <FeatureErrorBoundary>
              <TransactionOutput />
            </FeatureErrorBoundary>
          } />
        </Route>

        <Route path="/banker" element={
          <FeatureErrorBoundary>
            <BankerApp />
          </FeatureErrorBoundary>
        }>
          <Route index element={<BankerDashboard />} />
        </Route>

        <Route path="/ivr" element={
          <FeatureErrorBoundary>
            <ContactCenter />
          </FeatureErrorBoundary>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>


    </>
  );
}
