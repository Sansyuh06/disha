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
        <h1 className="font-heading text-3xl font-semibold text-brand-dark mb-1">Scan Your Documents</h1>
        <p className="text-brand-muted text-sm">We'll fill in your details automatically</p>
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
                  activeTab === tab ? 'text-brand-teal border-b-2' : 'text-brand-muted hover:text-brand-dark'
                }`}
                style={activeTab === tab ? { borderBottomColor: 'var(--brand-teal)' } : {}}
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
        style={{ borderColor: dragging ? 'var(--brand-teal)' : '#E2E8F0', background: dragging ? 'var(--brand-teal-light)' : '#FAFAFA' }}
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
            <p className="text-brand-dark font-medium text-sm">Drop your document here or click to browse</p>
            <p className="text-brand-muted text-xs mt-1">Aadhaar, PAN, Passport, Salary Slip · JPG, PNG, WebP</p>
          </>
        )}
      </label>


    </div>
  );
}
