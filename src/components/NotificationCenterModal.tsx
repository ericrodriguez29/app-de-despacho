import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
  CheckCheck,
  BellRing,
  Volume2,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    clearAllNotifications,
    triggerManualPushTest,
    pushPermission,
    requestPushPermission,
  } = useDispatch();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Centro de Notificaciones Push</h3>
              <p className="text-xs text-slate-400">Alertas en tiempo real de salidas, llegadas y descargas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Status Banner & Test Button */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <BellRing className={`w-4 h-4 ${pushPermission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div>
              <span className="font-bold text-white block">
                {pushPermission === 'granted' ? 'Notificaciones Push Activas' : 'Notificaciones en Navegador'}
              </span>
              <span className="text-[11px] text-slate-400">
                {pushPermission === 'granted'
                  ? 'Recibiendo avisos en pantalla y sonido'
                  : 'Requiere permiso para push en segundo plano'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pushPermission !== 'granted' && (
              <button
                onClick={requestPushPermission}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[11px] transition shadow-md"
              >
                Activar
              </button>
            )}
            <button
              onClick={triggerManualPushTest}
              className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/30 rounded-xl font-bold text-[11px] transition flex items-center gap-1 active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Probar Alerta</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Mark all read & Clear */}
        <div className="flex justify-between items-center text-xs text-slate-400 px-1 shrink-0">
          <span>{notifications.length} notificaciones ({unreadNotifsCount} sin leer)</span>
          <div className="flex gap-2">
            {unreadNotifsCount > 0 && (
              <button
                onClick={markNotificationsAsRead}
                className="hover:text-sky-400 flex items-center gap-1 font-semibold"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar leídas</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="hover:text-rose-400 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scroll List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-grow">
          {notifications.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs">Bandeja de notificaciones vacía</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition space-y-1 ${
                  n.read
                    ? 'bg-slate-800/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-800/90 border-slate-700 text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                    {n.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
                    <h4 className="font-black text-xs text-white">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 pl-6 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
