import React from 'react';
import {
  Truck,
  Bell,
  Plus,
  Zap,
  Gauge,
  Wifi,
  WifiOff,
  BellRing,
  QrCode,
  Settings2,
  Sparkles,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenNewOrder: () => void;
  onOpenRoutesManager: () => void;
  onOpenNotifications: () => void;
  onOpenScanner: () => void;
  onOpenCatalogSettings: () => void;
  onOpenClearZero: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewOrder,
  onOpenRoutesManager,
  onOpenNotifications,
  onOpenScanner,
  onOpenCatalogSettings,
  onOpenClearZero,
}) => {
  const {
    isOnline,
    unreadNotifsCount,
    pushPermission,
    requestPushPermission,
    quickDriverMode,
    setQuickDriverMode,
  } = useDispatch();

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Left Section */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 border border-sky-400/20">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  DISPATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">LOGISTICS PRO</span>
                </h1>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-wider">
                  PWA OFFLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Conteo de Unidades &bull; Techos y Aceros &bull; Control de Rutas
              </p>
            </div>
          </div>

          {/* Mobile Fast Action Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenCatalogSettings}
              className="p-2 bg-slate-800 text-sky-400 border border-slate-700 rounded-xl text-xs"
              title="Destinos & Catálogo"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenClearZero}
              className="p-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs"
              title="Poner todo en CERO para comenzar operación real"
            >
              <Sparkles className="w-4 h-4 text-rose-400" />
            </button>

            <button
              onClick={() => setQuickDriverMode(!quickDriverMode)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center border transition ${
                quickDriverMode
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-amber-400 border-slate-700'
              }`}
              title="Modo Descarga Rápida"
            >
              <Zap className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenNewOrder}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold p-2 rounded-xl text-xs flex items-center justify-center shadow-md shadow-sky-500/20 active:scale-95"
              title="Nuevo Pedido"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Tools & Navigation Buttons */}
        <div className="flex items-center flex-wrap justify-end gap-2 w-full md:w-auto">
          {/* Online / Offline Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
            }`}
            title={isOnline ? 'Conexión a Internet activa' : 'Sin conexión - Guardando localmente'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Catalog & Destinations Settings Button */}
          <button
            onClick={onOpenCatalogSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-700 hover:border-sky-500/40 rounded-xl text-xs font-bold transition shadow-sm"
            title="Editar Destinos (Jarabacoa, SFM, STGO...) y Productos (Aluzinc, Calibres...)"
          >
            <Settings2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Destinos & Catálogo</span>
            <span className="sm:hidden">Catálogo</span>
          </button>

          {/* Start in Zero (Poner todo en cero) Button */}
          <button
            onClick={onOpenClearZero}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 border border-rose-500/30 hover:border-rose-400/60 rounded-xl text-xs font-bold transition shadow-sm"
            title="Poner todo en cero para iniciar la jornada de trabajo real"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Poner en Cero</span>
            <span className="sm:hidden">En Cero</span>
          </button>

          {/* Quick Mode Switcher */}
          <button
            onClick={() => setQuickDriverMode(!quickDriverMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              quickDriverMode
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/40'
                : 'bg-slate-800/90 hover:bg-slate-800 text-amber-400 border-slate-700 hover:border-amber-500/40'
            }`}
            title="Cambiar a interfaz ultra rápida para choferes en rampa de descarga"
          >
            <Zap className={`w-3.5 h-3.5 ${quickDriverMode ? 'fill-current animate-bounce' : ''}`} />
            <span className="font-extrabold">{quickDriverMode ? 'Modo Chofer (Activo)' : 'Modo Chofer'}</span>
          </button>

          {/* Route Efficiency & Salida/Llegada Timetable */}
          <button
            onClick={onOpenRoutesManager}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-700 hover:border-sky-500/40 rounded-xl text-xs font-bold transition shadow-sm"
            title="Ver Horarios de Salida/Llegada y Eficiencia de Transportistas"
          >
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Eficiencia & Rutas</span>
            <span className="sm:hidden">Rutas</span>
          </button>

          {/* Barcode Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition"
            title="Escanear Código de Despacho"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Escáner</span>
          </button>

          {/* Push Notification Button */}
          {pushPermission !== 'granted' ? (
            <button
              onClick={requestPushPermission}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition animate-pulse"
              title="Activar Notificaciones Push en este dispositivo"
            >
              <BellRing className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Push</span>
            </button>
          ) : (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs transition"
              title="Notificaciones en tiempo real"
            >
              <Bell className="w-4 h-4 text-sky-400" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-md">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* New Order Button */}
          <button
            onClick={onOpenNewOrder}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-sky-500/25 active:scale-95 border border-sky-400/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Pedido</span>
          </button>
        </div>
      </div>
    </header>
  );
};
