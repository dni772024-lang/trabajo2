
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerModalProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title: string;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose, title }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        scannerRef.current?.clear();
        onClose();
      },
      (error) => {
        // Just ignore errors
      }
    );

    return () => {
      scannerRef.current?.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">
          <div id="reader" className="rounded-2xl overflow-hidden border-2 border-slate-100"></div>
          <p className="text-center text-xs text-slate-400 mt-6 font-medium">
            Alinee el código QR o código de barras dentro del recuadro para escanearlo automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
