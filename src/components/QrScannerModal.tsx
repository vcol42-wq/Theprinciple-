import React, { useEffect, useRef } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader-container',
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
          },
          false
        );

        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            scanner.clear();
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // non-fatal frame decode errors
          }
        );
      } catch (err) {
        console.error('QR Scanner init failed:', err);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-800 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">مسح رمز الاستجابة (QR Code)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="p-4 flex flex-col items-center">
          <div
            id="qr-reader-container"
            className="w-full rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-black min-h-[280px]"
          />
          <p className="text-xs text-slate-400 mt-3 text-center">
            وجّه كاميرا هاتفك نحو باركود الإدارة أو بطاقة المعلم
          </p>
        </div>
      </div>
    </div>
  );
};
