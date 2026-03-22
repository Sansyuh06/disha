import React, { useState } from 'react';
import CameraCapture from './CameraCapture';
import OCRProcessor from './OCRProcessor';
import ExtractedForm from './ExtractedForm';

type Tab = 'upload' | 'camera';

export default function DocumentScanner() {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [imageData, setImageData] = useState<File | Blob | null>(null);
  const [ocrDone, setOcrDone] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string | null> | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setImageData(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrDone(false);
    setExtractedData(null);
  };

  const handleCapture = (blob: Blob) => {
    setImageData(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setOcrDone(false);
    setExtractedData(null);
  };

  const handleReset = () => {
    setImageData(null);
    setPreviewUrl(null);
    setOcrDone(false);
    setExtractedData(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-[var(--navy-900)] mb-1">Scan Your Documents</h1>
        <p className="text-[var(--text-muted)] text-sm">We'll fill in your details automatically</p>
      </div>

      {/* Supported Document Types */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { icon: '🪪', label: 'Aadhaar Card' },
          { icon: '💳', label: 'PAN Card' },
          { icon: '🛂', label: 'Passport' },
          { icon: '📄', label: 'Salary Slip' },
        ].map(d => (
          <div key={d.label} className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xl">{d.icon}</span>
            <span className="text-[10px] font-medium text-center" style={{ color: 'var(--navy-900)' }}>{d.label}</span>
          </div>
        ))}
      </div>

      {/* Scanning Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex items-start gap-2">
        <span className="text-lg">💡</span>
        <div className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
          <strong>For best results:</strong> Place document on a flat surface · Ensure good lighting with no glare · Keep all corners visible · Use a clear, high-resolution image
        </div>
      </div>

      {/* Tabs — Upload is primary (reviewer fix) */}
      {!ocrDone && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['upload', 'camera'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setImageData(null); setPreviewUrl(null); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'text-[var(--teal)] border-b-2' : 'text-[var(--text-muted)] hover:text-[var(--navy-900)]'
                }`}
                style={activeTab === tab ? { borderBottomColor: 'var(--teal)' } : {}}
              >
                {tab === 'upload' ? '📁 Upload File' : '📷 Camera'}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'upload' ? (
              <UploadTab 
                onFileSelect={handleFileSelect} 
                previewUrl={previewUrl} 
              />
            ) : (
              <CameraCapture onCapture={handleCapture} previewUrl={previewUrl} />
            )}

            {imageData && !ocrDone && (
              <OCRProcessor
                imageData={imageData}
                onComplete={(data: any) => { setExtractedData(data); setOcrDone(true); }}
              />
            )}
          </div>
        </div>
      )}

      {/* Extracted Form */}
      {ocrDone && extractedData && (
        <ExtractedForm data={extractedData} onReset={handleReset} />
      )}
    </div>
  );
}

function UploadTab({ onFileSelect, previewUrl }: { onFileSelect: (f: File) => void; previewUrl: string | null; }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label
        className={`block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragging ? 'scale-[1.02]' : ''
        }`}
        style={{ borderColor: dragging ? 'var(--teal)' : '#E2E8F0', background: dragging ? 'var(--teal-light)' : '#FAFAFA' }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) onFileSelect(f);
        }}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={e => { if (e.target.files?.[0]) onFileSelect(e.target.files[0]); }}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Document preview" className="max-h-48 mx-auto rounded-xl object-contain" />
        ) : (
          <>
            <div className="text-4xl mb-3">📄</div>
            <p className="text-[var(--navy-900)] font-medium text-sm">Drop your document here or click to browse</p>
            <p className="text-[var(--text-muted)] text-xs mt-1">Aadhaar, PAN, Passport, Salary Slip · JPG, PNG, WebP</p>
          </>
        )}
      </label>


    </div>
  );
}
