import React from 'react';
import {
  Boxes,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { formatOvertimeDuration } from '../data/initialData';

interface KPIBannerProps {
  onOpenOvertime?: () => void;
}

export const KPIBanner: React.FC<KPIBannerProps> = ({ onOpenOvertime }) => {
  const { kpis, routes } = useDispatch();

  const activeRoutesCount = routes.filter((r) => r.status === 'en_ruta').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* 1. Por Despachar (Cantidad de Unidades) */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Por Despachar</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-amber-400">
              {kpis.totalUnitsPending}
            </span>
            <span className="text-xs font-bold text-slate-400">unidades</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {kpis.pendingCount} pedidos en almacén
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
          <Boxes className="w-6 h-6" />
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. En Ruta (Cantidad de Unidades) */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-sky-500/40 transition">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>En Tránsito / Ruta</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-sky-400">
              {kpis.totalUnitsInTransit}
            </span>
            <span className="text-xs font-bold text-slate-400">unidades</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {kpis.inTransitCount + kpis.inUnloadCount} pedidos &bull; {activeRoutesCount} rutas activas
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
          <Truck className="w-6 h-6 animate-pulse" />
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 3. Entregados Conformes */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Entregados</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-emerald-400">
              {kpis.totalUnitsDelivered}
            </span>
            <span className="text-xs font-bold text-slate-400">unidades</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {kpis.deliveredCount} entregas completadas ({kpis.efficiencyRate}%)
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 4. Medición de Horas Extras (Chofer y Ayudante) */}
      <div
        onClick={onOpenOvertime}
        className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition cursor-pointer"
        title="Clic para abrir el Control de Horas Extras de Chofer y Ayudante"
      >
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <span>Horas Extras (Chofer/Ayud.)</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-xl md:text-2xl font-black text-amber-400 font-mono">
              {formatOvertimeDuration(kpis.totalDriverOvertimeMinutes)}
            </span>
            <span className="text-[10px] font-bold text-slate-400">Chofer</span>
          </div>
          <p className="text-[11px] text-indigo-300 font-bold flex items-center gap-1">
            <span>👷 Ayudante: {formatOvertimeDuration(kpis.totalHelperOvertimeMinutes)}</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
          <Clock className="w-6 h-6" />
        </div>
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
      </div>
    </div>
  );
};
