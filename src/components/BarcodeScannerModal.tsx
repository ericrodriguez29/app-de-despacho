import React, { useState, useEffect } from 'react';
import {
  QrCode,
  X,
  Camera,
  Boxes,
  CheckCircle2,
  Search,
  Scan,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
}) => {
  const { orders } = useDispatch();
  const [scannedCode, setScannedCode] = useState('');
  const [isScanningActive, setIsScanningActive] = useState(true);

  if (!isOpen) return null;

  const handleScanSimulation = (order: Order) => {
    setScannedCode(order.id);
    setTimeout(() => {
      onSelectOrder(order);
      onClose();
    }, 400);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === scannedCode.trim().toLowerCase() ||
        o.client.toLowerCase().includes(scannedCode.trim().toLowerCase())
    );
    if (found) {
      onSelectOrder(found);
      onClose();
    } else {
      alert(`No se encontró ningún pedido con el código "${scannedCode}".`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Escáner Óptico de Bultos & Guías</h3>
              <p className="text-xs text-slate-400">Lectura rápida para rampa de descarga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulated Camera Viewfinder */}
        <div className="relative bg-slate-950 rounded-2xl border-2 border-indigo-500/40 p-6 flex flex-col items-center justify-center min-h-[190px] overflow-hidden">
          {/* Laser Scanner Line Animation */}
          <div className="absolute inset-x-8 top-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-bounce" />

          <div className="w-36 h-36 border-2 border-dashed border-indigo-400/60 rounded-2xl flex flex-col items-center justify-center p-3 relative">
            <QrCode className="w-16 h-16 text-indigo-400/60 mb-1" />
            <span className="text-[10px] text-indigo-300 font-mono text-center">
              Apunte al código de barras / QR
            </span>
          </div>

          <span className="mt-3 text-xs text-slate-400 font-medium">
            Lector activo &bull; Detectando código...
          </span>
        </div>

        {/* Manual Barcode Input */}
        <form onSubmit={handleManualSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="O ingrese código manual (Ej: DSP-1001)"
            value={scannedCode}
            onChange={(e) => setScannedCode(e.target.value)}
            className="flex-grow bg-slate-800 text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition"
          >
            Buscar
          </button>
        </form>

        {/* Quick Simulated Barcode Tags for 1-Tap Unloading */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tocar para Escaneo Rápido Inmediato:
          </span>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {orders.slice(0, 6).map((order) => (
              <button
                key={order.id}
                onClick={() => handleScanSimulation(order)}
                className="flex items-center justify-between p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-left transition active:scale-95 text-xs group"
              >
                <div>
                  <span className="font-mono text-[11px] font-bold text-sky-400 group-hover:text-sky-300">
                    {order.id}
                  </span>
                  <p className="text-[11px] text-white font-bold truncate max-w-[120px]">
                    {order.client}
                  </p>
                </div>
                <span className="text-[10px] text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
                  {order.unitsCount} u
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
