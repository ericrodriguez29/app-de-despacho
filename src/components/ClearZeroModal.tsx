import React, { useState } from 'react';
import { Sparkles, Trash2, CheckCircle, RotateCcw, AlertTriangle, X, ShieldCheck } from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';

interface ClearZeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewOrder: () => void;
}

export const ClearZeroModal: React.FC<ClearZeroModalProps> = ({
  isOpen,
  onClose,
  onOpenNewOrder,
}) => {
  const { clearAllToZero, resetAllData, orders, routes } = useDispatch();
  const [confirmed, setConfirmed] = useState(false);
  const [resetRoutesToZero, setResetRoutesToZero] = useState(true);

  if (!isOpen) return null;

  const handleClearToZero = () => {
    clearAllToZero({ resetRoutes: resetRoutesToZero });
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  const handleRestoreDemo = () => {
    resetAllData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-black text-white">¡Sistema en CERO listo!</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Todos los pedidos de prueba fueron eliminados. Ahora puedes registrar tus despachos reales.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 border border-rose-400/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">
                  Poner Todo en Cero (Modo Real)
                </h2>
                <p className="text-xs text-slate-400">
                  Prepara el sistema para iniciar tu operación y despachos reales
                </p>
              </div>
            </div>

            {/* Current State summary */}
            <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span>Órdenes actuales registradas:</span>
                <span className="font-mono font-bold text-amber-400">{orders.length} pedidos</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Rutas activas en sistema:</span>
                <span className="font-mono font-bold text-sky-400">{routes.length} rutas</span>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-sky-950/30 border border-sky-500/30 rounded-2xl p-4 text-xs space-y-2 text-sky-200">
              <div className="flex items-center gap-2 font-bold text-sky-400">
                <ShieldCheck className="w-4 h-4" />
                <span>¿Qué pasará al poner todo en cero?</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>
                  <strong className="text-white">Se vaciarán todas las órdenes:</strong> El tablero quedará limpio y los contadores (Pendientes, En Ruta, En Descarga, Entregados) quedarán en <span className="font-bold text-emerald-400">0 unidades</span>.
                </li>
                <li>
                  <strong className="text-white">Tus configuraciones se conservan:</strong> Los destinos (Jarabacoa, Rafa, etc.), productos (Aluzinc, Caballetes, etc.), calibres y choferes (Carlos, Danilo, Nelson) <span className="text-emerald-400 font-semibold">NO se borran</span>.
                </li>
              </ul>
            </div>

            {/* Route Reset Option */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={resetRoutesToZero}
                onChange={(e) => setResetRoutesToZero(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-600 text-sky-500 focus:ring-sky-500"
              />
              <span className="text-slate-300">
                Reiniciar también contadores de paradas y unidades de las rutas a 0 (Recomendado para comenzar el día).
              </span>
            </label>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleClearToZero}
                className="w-full py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-rose-600/30 active:scale-98 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, poner todo en CERO para comenzar</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleRestoreDemo}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-700"
                  title="Cargar órdenes de ejemplo de nuevo"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cargar Datos Demo</span>
                </button>

                <button
                  onClick={onClose}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
