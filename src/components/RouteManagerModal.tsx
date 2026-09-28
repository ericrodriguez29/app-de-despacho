import React, { useState, useEffect } from 'react';
import {
  Gauge,
  X,
  Plus,
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Boxes,
  TrendingUp,
  MapPin,
  Play,
  Flag,
  Sparkles,
} from 'lucide-react';
import { RouteRecord } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';

interface RouteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RouteManagerModal: React.FC<RouteManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    routes,
    destinations,
    drivers,
    driverPerformances,
    updateRouteDeparture,
    updateRouteArrival,
    addRoute,
  } = useDispatch();

  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteZone, setNewRouteZone] = useState('Hierro Rafa STGO');
  const [newRouteDriver, setNewRouteDriver] = useState('Carlos');
  const [newRouteVehicle, setNewRouteVehicle] = useState('');
  const [newSchedDep, setNewSchedDep] = useState('08:00');
  const [newSchedArr, setNewSchedArr] = useState('14:00');
  const [newTotalUnits, setNewTotalUnits] = useState(50);
  const [newTargetStops, setNewTargetStops] = useState(4);

  useEffect(() => {
    if (destinations.length > 0 && !newRouteZone) {
      setNewRouteZone(destinations[0].name);
    }
    if (drivers.length > 0 && !newRouteDriver) {
      setNewRouteDriver(drivers[0]);
    }
  }, [destinations, drivers, newRouteZone, newRouteDriver]);

  if (!isOpen) return null;

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName || !newRouteDriver) return;

    addRoute({
      name: newRouteName.trim(),
      zone: newRouteZone,
      driver: newRouteDriver.trim(),
      vehicle: newRouteVehicle.trim() || 'Vehículo de Flota',
      scheduledDeparture: newSchedDep,
      scheduledArrival: newSchedArr,
      status: 'programada',
      targetStops: newTargetStops,
      totalUnits: newTotalUnits,
      notes: 'Ruta creada desde el panel de control.',
    });

    setShowAddRouteForm(false);
    setNewRouteName('');
    setNewRouteDriver('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Gauge className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white">
                Control de Horarios de Ruta & Eficiencia del Transportista
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registro de horas de salida y llegada para medir puntualidad, cumplimiento y eficiencia en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddRouteForm(!showAddRouteForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddRouteForm ? 'Ver Rutas' : 'Nueva Ruta'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Route Form (Collapsible) */}
        {showAddRouteForm && (
          <form
            onSubmit={handleCreateRoute}
            className="bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 text-xs font-semibold shrink-0 animate-fade-in"
          >
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Programar Nueva Ruta
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Nombre de la Ruta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ruta Cibao - STGO & Jarabacoa"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value)}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Destino / Zona Principal *</label>
                <select
                  value={newRouteZone}
                  onChange={(e) => setNewRouteZone(e.target.value)}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-bold"
                >
                  {destinations.map((d) => (
                    <option key={d.id} value={d.name}>
                      📍 {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Chofer Responsable *</label>
                <select
                  value={newRouteDriver}
                  onChange={(e) => setNewRouteDriver(e.target.value)}
                  className="w-full bg-slate-800 text-amber-300 font-bold p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                >
                  {drivers.map((d) => (
                    <option key={d} value={d}>
                      🚛 {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Vehículo / Placa</label>
                <input
                  type="text"
                  placeholder="Ej: Camión 05 (Placas ABC-77)"
                  value={newRouteVehicle}
                  onChange={(e) => setNewRouteVehicle(e.target.value)}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Hora de Salida *</label>
                <input
                  type="time"
                  required
                  value={newSchedDep}
                  onChange={(e) => setNewSchedDep(e.target.value)}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Hora de Llegada *</label>
                <input
                  type="time"
                  required
                  value={newSchedArr}
                  onChange={(e) => setNewSchedArr(e.target.value)}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Cantidad de Unidades</label>
                <input
                  type="number"
                  min="1"
                  value={newTotalUnits}
                  onChange={(e) => setNewTotalUnits(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nº Paradas Estimadas</label>
                <input
                  type="number"
                  min="1"
                  value={newTargetStops}
                  onChange={(e) => setNewTargetStops(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddRouteForm(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-md"
              >
                Guardar Ruta
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Container with Two Sections: Active Routes Timetable + Driver Scorecards */}
        <div className="space-y-6 overflow-y-auto pr-1 flex-grow">
          {/* SECTION 1: TIMETABLE OF ROUTES (Hora Salida & Hora Llegada) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Itinerario de Rutas: Horarios de Salida y Llegada ({routes.length})</span>
            </h3>

            <div className="space-y-3">
              {routes.map((route) => {
                const isDeparted = !!route.actualDeparture;
                const isArrived = !!route.actualArrival;

                return (
                  <div
                    key={route.id}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-md hover:border-sky-500/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-500/30">
                            {route.id}
                          </span>
                          <span className="text-xs font-bold text-slate-400">{route.zone}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isArrived
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isDeparted
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isArrived ? 'Completada' : isDeparted ? 'En Tránsito' : 'Programada'}
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-white mt-1">{route.name}</h4>
                        <p className="text-xs text-slate-400">
                          Transportista: <strong className="text-slate-200">{route.driver}</strong> &bull; {route.vehicle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 text-amber-300 font-bold">
                          📦 {route.totalUnits} Unidades
                        </span>
                        <span className="bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-700 text-slate-300 font-bold">
                          📍 {route.targetStops} Paradas
                        </span>
                      </div>
                    </div>

                    {/* Departure and Arrival Interactive Time Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* HORA DE SALIDA ALMACÉN */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5 text-sky-400" />
                            <span>Hora Salida Almacén</span>
                          </span>
                          <span className="text-slate-500 text-[11px]">Prog: {route.scheduledDeparture}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          {isDeparted ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black font-mono text-sky-400">
                                {route.actualDeparture}
                              </span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Salida Registrada
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateRouteDeparture(route.id)}
                              className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Registrar Salida de Almacén Ahora</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* HORA DE LLEGADA / FIN DE RUTA */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold flex items-center gap-1.5">
                            <Flag className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Hora Llegada / Fin de Ruta</span>
                          </span>
                          <span className="text-slate-500 text-[11px]">Prog: {route.scheduledArrival}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          {isArrived ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black font-mono text-emerald-400">
                                {route.actualArrival}
                              </span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Fin de Ruta Registrado
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateRouteArrival(route.id)}
                              disabled={!isDeparted}
                              className={`w-full py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                                isDeparted
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md active:scale-95'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Flag className="w-3.5 h-3.5" />
                              <span>Registrar Llegada a Almacén / Fin</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DRIVER EFFICIENCY SCORECARDS & RANKING */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Métricas de Rendimiento & Eficiencia por Transportista</span>
            </h3>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Transportista</th>
                      <th className="p-3.5">Salida (Prog / Real)</th>
                      <th className="p-3.5">Llegada (Prog / Real)</th>
                      <th className="p-3.5">Unidades Entregadas</th>
                      <th className="p-3.5">Descarga Promedio</th>
                      <th className="p-3.5 text-center">Score Eficiencia</th>
                      <th className="p-3.5">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {driverPerformances.map((perf, index) => {
                      let scoreColor = 'text-emerald-400';
                      if (perf.efficiencyScore < 70) scoreColor = 'text-amber-400';
                      if (perf.efficiencyScore < 50) scoreColor = 'text-rose-400';

                      return (
                        <tr key={perf.driverName} className="hover:bg-slate-900/50 transition">
                          <td className="p-3.5 font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-mono text-[10px] flex items-center justify-center font-black">
                              #{index + 1}
                            </span>
                            <div>
                              <span>{perf.driverName}</span>
                              <span className="block text-[10px] text-slate-500 font-normal">
                                {perf.vehicle}
                              </span>
                            </div>
                          </td>

                          {/* Salida */}
                          <td className="p-3.5 font-mono">
                            <span className="text-slate-400">{perf.scheduledDeparture}</span>
                            <span className="text-slate-600 mx-1">&rarr;</span>
                            <span className={perf.actualDeparture ? 'text-sky-400 font-bold' : 'text-slate-500'}>
                              {perf.actualDeparture || '--:--'}
                            </span>
                          </td>

                          {/* Llegada */}
                          <td className="p-3.5 font-mono">
                            <span className="text-slate-400">{perf.scheduledArrival}</span>
                            <span className="text-slate-600 mx-1">&rarr;</span>
                            <span className={perf.actualArrival ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                              {perf.actualArrival || '--:--'}
                            </span>
                          </td>

                          {/* Units */}
                          <td className="p-3.5">
                            <span className="font-bold text-amber-300">{perf.deliveredUnits}</span>
                            <span className="text-slate-500"> / {perf.totalUnits} uds</span>
                          </td>

                          {/* Unload average */}
                          <td className="p-3.5 text-slate-300 font-mono">
                            ~{perf.avgUnloadMinutes} min
                          </td>

                          {/* Efficiency Score */}
                          <td className="p-3.5 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                              <span className={`text-base font-black ${scoreColor}`}>
                                {perf.efficiencyScore}%
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                perf.status === 'En tiempo' || perf.status === 'Completado con éxito'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : perf.status === 'Retraso leve'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : perf.status === 'Retraso crítico'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {perf.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition"
          >
            Cerrar Panel de Eficiencia
          </button>
        </div>
      </div>
    </div>
  );
};
