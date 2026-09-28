import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed in standalone PWA mode, show subtle active badge or hide
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">PWA Instalada</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold shadow-lg shadow-sky-500/25 active:scale-95 transition ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs'
          }`}
          title="Instalar App en tu dispositivo para uso offline"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>{compact ? 'Instalar' : 'Instalar App'}</span>
        </button>

        {installSuccess && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡App instalada correctamente en tu dispositivo!</span>
          </div>
        )}
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 font-bold transition active:scale-95 ${
            compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                  <span>Instalar en iPhone / iPad</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0">1</span>
                  <p>Toca el botón <strong className="text-white">Compartir</strong> (icono de cuadrado con flecha hacia arriba) en la barra de Safari.</p>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0">2</span>
                  <p>Desplázate hacia abajo y selecciona <strong className="text-white">"Agregar al inicio"</strong> (+).</p>
                </div>

                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black flex items-center justify-center shrink-0">3</span>
                  <p>Presiona <strong className="text-white">"Agregar"</strong> en la esquina superior derecha.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-2 w-full rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-sky-500/20"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => {
        alert('Para instalar: Presiona el menú del navegador (tres puntos ⋮ o icono de instalación en la barra de direcciones) y selecciona "Instalar aplicación".');
      }}
      className={`flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 font-semibold transition ${
        compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs'
      }`}
      title="Instalar como aplicación en tu pantalla principal"
    >
      <Download className="w-3.5 h-3.5 text-sky-400" />
      <span>{compact ? 'PWA' : 'Instalar App'}</span>
    </button>
  );
};
