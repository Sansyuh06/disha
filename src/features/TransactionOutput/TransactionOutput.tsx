// src/features/TransactionOutput/TransactionOutput.tsx
// Generates realistic transaction outputs with reference numbers and downloadable PDFs.

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useCustomer } from '../../contexts/CustomerContext';
import { motion, AnimatePresence } from 'framer-motion';

type TxType = 'fd_closure' | 'kyc_update' | 'complaint' | 'account_opening';

function generateRefNo(prefix: string): string {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${ts}${rand}`;
}

interface TxConfig {
  label: string;
  prefix: string;
  icon: string;
  fields: Array<{ label: string; key: string; placeholder: string }>;
  pdfTitle: string;
  successMsg: string;
}

const TX_CONFIGS: Record<TxType, TxConfig> = {
  fd_closure: {
    label: 'FD Closure Request', prefix: 'FDCL', icon: '📄',
    fields: [
      { label: 'FD Account Number', key: 'fdAccount', placeholder: 'e.g. FD000123456' },
      { label: 'Reason for Closure', key: 'reason', placeholder: 'e.g. Premature closure - personal need' },
      { label: 'Payout Mode', key: 'payout', placeholder: 'e.g. Credit to savings account' },
    ],
    pdfTitle: 'Fixed Deposit Closure Request',
    successMsg: 'Your FD closure request has been submitted. The amount will be credited within 2 working days.',
  },
  kyc_update: {
    label: 'KYC Update Request', prefix: 'KYCU', icon: '🪪',
    fields: [
      { label: 'Account Number', key: 'account', placeholder: 'e.g. 1234567890' },
      { label: 'Document Submitted', key: 'doc', placeholder: 'e.g. Aadhaar Card' },
      { label: 'Mobile Number', key: 'mobile', placeholder: 'e.g. 9876543210' },
    ],
    pdfTitle: 'KYC Update Request',
    successMsg: 'KYC update submitted successfully. Verification will be completed within 3 working days.',
  },
  complaint: {
    label: 'Complaint / Grievance', prefix: 'CMP', icon: '📢',
    fields: [
      { label: 'Account Number', key: 'account', placeholder: 'e.g. 1234567890' },
      { label: 'Complaint Category', key: 'category', placeholder: 'e.g. Unauthorised transaction' },
      { label: 'Description', key: 'description', placeholder: 'Describe your issue in detail' },
    ],
    pdfTitle: 'Customer Complaint Registration',
    successMsg: 'Your complaint has been registered. You will receive a resolution within 7 working days.',
  },
  account_opening: {
    label: 'Account Opening Request', prefix: 'ACOP', icon: '🏦',
    fields: [
      { label: 'Account Type', key: 'type', placeholder: 'e.g. Savings - Basic' },
      { label: 'Initial Deposit (₹)', key: 'deposit', placeholder: 'e.g. 1000' },
      { label: 'Nomination Name', key: 'nominee', placeholder: 'Full name of nominee' },
    ],
    pdfTitle: 'New Account Opening Request',
    successMsg: 'Your account opening request has been submitted. Account details will be sent within 2 working days.',
  },
};

export default function TransactionOutput() {
  const [selectedTx, setSelectedTx] = useState<TxType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState('');
  const { state } = useCustomer();

  const handleSubmit = () => {
    if (!selectedTx) return;
    const ref = generateRefNo(TX_CONFIGS[selectedTx].prefix);
    setRefNo(ref);
    setSubmitted(true);
  };

  const downloadPDF = () => {
    if (!selectedTx) return;
    const cfg = TX_CONFIGS[selectedTx];
    const doc = new jsPDF();
    const now = new Date();

    // Header
    doc.setFillColor(13, 27, 62);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('DISHA — Union Bank of India', 14, 12);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(cfg.pdfTitle, 14, 22);

    // Reference box
    doc.setFillColor(224, 247, 243);
    doc.rect(14, 35, 182, 20, 'F');
    doc.setTextColor(10, 155, 132);
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(`Reference Number: ${refNo}`, 20, 46);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${now.toLocaleString('en-IN')}`, 20, 52);

    // Customer info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Customer Details', 14, 68);
    autoTable(doc, {
      startY: 72,
      body: [
        ['Name', state.scannedData?.full_name ?? 'Walk-in Customer'],
        ['Account', state.scannedData?.id_number ?? 'Pending verification'],
        ['Session', state.token || 'Walk-in'],
      ],
      styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    // Request details
    const afterCust = (doc as any).lastAutoTable?.finalY + 8 || 110;
    doc.setFont('helvetica', 'bold');
    doc.text('Request Details', 14, afterCust);
    autoTable(doc, {
      startY: afterCust + 4,
      head: [['Field', 'Value']],
      body: cfg.fields.map(f => [f.label, formData[f.key] || '—']),
      headStyles: { fillColor: [13, 27, 62] },
      styles: { fontSize: 9 },
    });

    // Footer
    const ph = doc.internal.pageSize.height;
    doc.setFillColor(224, 247, 243);
    doc.rect(0, ph - 18, 210, 18, 'F');
    doc.setTextColor(10, 155, 132);
    doc.setFontSize(8);
    doc.text(`This is a computer-generated document. Ref: ${refNo} | DISHA — iDEA Hackathon 2.0`, 14, ph - 7);

    doc.save(`DISHA_${TX_CONFIGS[selectedTx].prefix}_${refNo}.pdf`);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: '26px', fontWeight: 700, color: '#0D1B3E', marginBottom: '4px' }}>Transaction Output</h1>
        <p style={{ fontSize: '13px', color: '#6B7A99' }}>Generate official request documents with reference numbers</p>
      </div>

      {!submitted ? (
        <>
          {!selectedTx ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {(Object.entries(TX_CONFIGS) as [TxType, TxConfig][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedTx(key); setFormData({}); }}
                  style={{ background: 'white', border: '1.5px solid #DDE4F5', borderRadius: '14px', padding: '20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0ABFA3'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(10,191,163,0.15)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#DDE4F5'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{cfg.icon}</div>
                  <p style={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, fontSize: '14px', color: '#0D1B3E' }}>{cfg.label}</p>
                </button>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ background: 'white', border: '1px solid #DDE4F5', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(13,27,62,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '28px' }}>{TX_CONFIGS[selectedTx].icon}</span>
                  <div>
                    <h3 style={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, color: '#0D1B3E', marginBottom: '2px' }}>{TX_CONFIGS[selectedTx].label}</h3>
                    <p style={{ fontSize: '11px', color: '#6B7A99' }}>Fill in the details below</p>
                  </div>
                  <button onClick={() => setSelectedTx(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9FADC8', fontSize: '20px' }}>×</button>
                </div>

                {state.scannedData?.full_name && (
                  <div style={{ padding: '10px 14px', background: '#E0F7F3', borderRadius: '10px', marginBottom: '16px', fontSize: '12px', color: '#089B84' }}>
                    ✓ Pre-filled from scanned document: {state.scannedData.full_name}
                  </div>
                )}

                {TX_CONFIGS[selectedTx].fields.map(field => (
                  <div key={field.key} style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#3D4F7C', marginBottom: '6px' }}>{field.label}</label>
                    <input
                      value={formData[field.key] ?? ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: '100%', border: '1.5px solid #DDE4F5', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
                      onFocus={e => (e.target.style.borderColor = '#1B3A8E')}
                      onBlur={e => (e.target.style.borderColor = '#DDE4F5')}
                    />
                  </div>
                ))}

                <button
                  onClick={handleSubmit}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #0D1B3E, #1B3A8E)', color: 'white', border: 'none', fontSize: '15px', fontWeight: 700, fontFamily: '"Plus Jakarta Sans"', cursor: 'pointer', marginTop: '8px' }}
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div style={{ background: 'white', border: '1px solid #DDE4F5', borderRadius: '16px', padding: '32px 24px', textAlign: 'center', boxShadow: '0 4px 24px rgba(13,27,62,0.1)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="32" height="32" fill="none" stroke="#16A34A" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: '22px', fontWeight: 800, color: '#0D1B3E', marginBottom: '8px' }}>Request Submitted!</h2>
              <p style={{ fontSize: '13px', color: '#6B7A99', marginBottom: '20px', lineHeight: 1.6 }}>{TX_CONFIGS[selectedTx!].successMsg}</p>

              <div style={{ background: '#EFF4FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#1B3A8E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Reference Number</p>
                <p style={{ fontFamily: '"Plus Jakarta Sans"', fontSize: '22px', fontWeight: 800, color: '#0D1B3E', letterSpacing: '0.04em' }}>{refNo}</p>
                <p style={{ fontSize: '11px', color: '#6B7A99', marginTop: '4px' }}>Save this for your records</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={downloadPDF} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#0D1B3E', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download PDF
                </button>
                <button onClick={() => { setSubmitted(false); setSelectedTx(null); setFormData({}); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#F2F5FC', color: '#0D1B3E', border: '1px solid #DDE4F5', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>
                  New Request
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
