import React, { useRef, useState } from 'react';

interface Props {
  onCapture: (blob: Blob) => void;
  previewUrl: string | null;
}

export default function CameraCapture({ onCapture, previewUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [denied, setDenied] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err: any) {
      if (err.name === 'NotAllowedError') setDenied(true);
    }
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        onCapture(blob);
        stream?.getTracks().forEach(t => t.stop());
        setStream(null);
      }
    }, 'image/jpeg', 0.9);
  };

  if (denied) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        📷 Camera access denied. Please use the Upload tab instead.
      </div>
    );
  }

  if (previewUrl && !stream) {
    return (
      <img src={previewUrl} alt="Captured document" className="w-full max-h-64 object-contain rounded-xl" />
    );
  }

  return (
    <div className="space-y-4">
      {stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-64 object-cover rounded-2xl border-2"
            style={{ borderColor: 'var(--brand-teal)' }}
          />
          <button
            onClick={capture}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: 'var(--brand-teal)' }}
          >
            📸 Capture Document
          </button>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📷</div>
          <p className="text-brand-muted text-sm mb-4">Camera will open to capture your document</p>
          <button
            onClick={startCamera}
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ backgroundColor: 'var(--brand-teal)' }}
          >
            Open Camera
          </button>
        </div>
      )}
    </div>
  );
}
