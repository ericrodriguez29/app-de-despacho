import React, { useState, useEffect } from 'react';
import {
  Gauge,
  X,
  Plus,
  Clock,
  Calendar,
  User,
  Users,
  TrendingUp,
  Play,
  Flag,
  Trash2,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import {
  formatDispatchDate,
  formatOvertimeDuration,
  calculateOvertimeMinutes,
} from '../data/initialData';

interface RouteManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'routes' | 'overtime';
}

export const RouteManagerModal: React.FC<RouteManagerModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'routes',
}) => {
  const {
    routes,
    destinations,
    drivers,
    helpers,
    driverPerformances,
    overtimeLogs,
    regularShiftEndTime,
    setRegularShiftEndTime,
    updateRouteDeparture,
    updateRouteArrival,
    updateRouteOvertime,
    addRoute,
    addOvertimeLog,
    deleteOvertimeLog,
  } = useDispatch();

  const todayStr = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<'routes' | 'overtime'>(initialTab);
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);

  // New Route Form State
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteZone, setNewRouteZone] = useState('Hierro Rafa STGO');
  const [newRouteDriver, setNewRouteDriver] = useState('Carlos');
  const [newRouteHelper, setNewRouteHelper] = useState('José');
  const [newRouteDate, setNewRouteDate] = useState(todayStr);
  const [newRouteVehicle, setNewRouteVehicle] = useState('');
  const [newSchedDep, setNewSchedDep] = useState('08:00');
  const [newSchedArr, setNewSchedArr] = useState('17:00');
  const [newTotalUnits, setNewTotalUnits] = useState(50);
  const [newTargetStops, setNewTargetStops] = useState(4);

  // Overtime Calculator / Log Form State
  const [otDate, setOtDate] = useState(todayStr);
  const [otZone, setOtZone] = useState('Hierro Rafa STGO');
  const [otDriver, setOtDriver] = useState('Carlos');
  const [otHelper, setOtHelper] = useState('José');
  const [otDepTime, setOtDepTime] = useState('08:00');
  const [otArrTime, setOtArrTime] = useState('18:30');
  const [otDriverMins, setOtDriverMins] = useState(90);
  const [otHelperMins, setOtHelperMins] = useState(90);
  const [otNotes, setOtNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (destinations.length > 0) {
      if (!newRouteZone) setNewRouteZone(destinations[0].name);
      if (!otZone) setOtZone(destinations[0].name);
    }
    if (drivers.length > 0) {
      if (!newRouteDriver) setNewRouteDriver(drivers[0]);
      if (!otDriver) setOtDriver(drivers[0]);
    }
    if (helpers.length > 0) {
      if (!newRouteHelper) setNewRouteHelper(helpers[0]);
      if (!otHelper) setOtHelper(helpers[0]);
    }
  }, [destinations, drivers, helpers, newRouteZone, newRouteDriver, newRouteHelper, otZone, otDriver, otHelper]);

  if (!isOpen) return null;

  const handleOtArrivalTimeChange = (arrVal: string) => {
    setOtArrTime(arrVal);
    const autoMins = calculateOvertimeMinutes(arrVal, regularShiftEndTime);
    setOtDriverMins(autoMins);
    setOtHelperMins(otHelper && otHelper !== 'Sin Ayudante' ? autoMins : 0);
  };

  const handleShiftEndChange = (newShiftEnd: string) => {
    setRegularShiftEndTime(newShiftEnd);
    const autoMins = calculateOvertimeMinutes(otArrTime, newShiftEnd);
    setOtDriverMins(autoMins);
    setOtHelperMins(otHelper && otHelper !== 'Sin Ayudante' ? autoMins : 0);
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteName || !newRouteDriver) return;

    addRoute({
      name: newRouteName.trim(),
      zone: newRouteZone,
      driver: newRouteDriver.trim(),
      helper: newRouteHelper,
      dispatchDate: newRouteDate,
      vehicle: newRouteVehicle.trim() || 'Vehículo de Flota',
      scheduledDeparture: newSchedDep,
      scheduledArrival: newSchedArr,
      shiftEndTime: regularShiftEndTime,
      driverOvertimeMinutes: 0,
      helperOvertimeMinutes: 0,
      status: 'programada',
      targetStops: newTargetStops,
      totalUnits: newTotalUnits,
      notes: 'Ruta creada desde el panel de control.',
    });

    setShowAddRouteForm(false);
    setNewRouteName('');
  };

  const handleAddOvertimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOvertimeLog({
      date: otDate,
      zone: otZone,
      driver: otDriver,
      helper: otHelper,
      departureTime: otDepTime,
      arrivalTime: otArrTime,
      regularEndTime: regularShiftEndTime,
      driverOvertimeMinutes: otDriverMins,
      helperOvertimeMinutes: otHelperMins,
      notes:
        otNotes.trim() ||
        `Jornada ${otDepTime} a ${otArrTime} (Fin turno normal: ${regularShiftEndTime}).`,
    });
    setOtNotes('');
  };

  // Totals by Driver and by Helper
  const driverTotals = drivers.map((d) => {
    const totalMins = overtimeLogs
      .filter((l) => l.driver === d)
      .reduce((acc, l) => acc + (l.driverOvertimeMinutes || 0), 0);
    return { name: d, totalMins };
  });

  const activeHelpers = helpers.filter((h) => h !== 'Sin Ayudante');
  const helperTotals = activeHelpers.map((h) => {
    const totalMins = overtimeLogs
      .filter((l) => l.helper === h)
      .reduce((acc, l) => acc + (l.helperOvertimeMinutes || 0), 0);
    return { name: h, totalMins };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[93vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Gauge className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Horarios (Salida / Llegada) & Medición de Horas Extras (Chofer y Ayudante)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Controla la hora de salida, hora de llegada, fecha de despacho y mide las horas extras de cada Chofer y Ayudante.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab === 'routes' && (
              <button
                onClick={() => setShowAddRouteForm(!showAddRouteForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddRouteForm ? 'Ver Rutas' : 'Nueva Ruta'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === 'routes'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Rutas: Hora de Salida y Llegada ({routes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('overtime')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === 'overtime'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Horas Extras: Chofer y Ayudante ({overtimeLogs.length})</span>
            </button>
          </div>

          {/* Shift End Time Configurator */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-bold">Hora Fin Turno Normal:</span>
            <input
              type="time"
              value={regularShiftEndTime}
              onChange={(e) => handleShiftEndChange(e.target.value)}
              className="bg-slate-900 text-amber-300 font-mono font-black px-2 py-0.5 rounded-lg border border-amber-500/30 focus:outline-none focus:border-amber-400"
              title="Las horas después de esta hora se calculan como Hora Extra"
            />
          </div>
        </div>

        {/* TAB 1: ROUTES & DEPARTURE/ARRIVAL */}
        {activeTab === 'routes' && (
          <div className="space-y-6 overflow-y-auto pr-1 flex-grow">
            {/* Add Route Form (Collapsible) */}
            {showAddRouteForm && (
              <form
                onSubmit={handleCreateRoute}
                className="bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3 text-xs font-semibold shrink-0 animate-fade-in"
              >
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Programar Nueva Ruta de Despacho
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Nombre de la Ruta *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Ruta Cibao - STGO"
                      value={newRouteName}
                      onChange={(e) => setNewRouteName(e.target.value)}
                      className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Destino Principal *</label>
                    <select
                      value={newRouteZone}
                      onChange={(e) => setNewRouteZone(e.target.value)}
                      className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700 font-bold"
                    >
                      {destinations.map((d) => (
                        <option key={d.id} value={d.name}>
                          📍 {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Fecha de Despacho *</label>
                    <input
                      type="date"
                      required
                      value={newRouteDate}
                      onChange={(e) => setNewRouteDate(e.target.value)}
                      className="w-full bg-slate-800 text-emerald-300 font-bold p-2 rounded-xl border border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Vehículo / Placa</label>
                    <input
                      type="text"
                      placeholder="Ej: Camión Isuzu 01"
                      value={newRouteVehicle}
                      onChange={(e) => setNewRouteVehicle(e.target.value)}
                      className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1">Chofer Responsable *</label>
                    <select
                      value={newRouteDriver}
                      onChange={(e) => setNewRouteDriver(e.target.value)}
                      className="w-full bg-slate-800 text-amber-300 font-bold p-2 rounded-xl border border-slate-700"
                    >
                      {drivers.map((d) => (
                        <option key={d} value={d}>
                          🚛 {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Ayudante Asignado</label>
                    <select
                      value={newRouteHelper}
                      onChange={(e) => setNewRouteHelper(e.target.value)}
                      className="w-full bg-slate-800 text-indigo-300 font-bold p-2 rounded-xl border border-slate-700"
                    >
                      {helpers.map((h) => (
                        <option key={h} value={h}>
                          👷 {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Hora de Salida *</label>
                    <input
                      type="time"
                      required
                      value={newSchedDep}
                      onChange={(e) => setNewSchedDep(e.target.value)}
                      className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Hora de Llegada *</label>
                    <input
                      type="time"
                      required
                      value={newSchedArr}
                      onChange={(e) => setNewSchedArr(e.target.value)}
                      className="w-full bg-slate-800 text-white p-2 rounded-xl border border-slate-700"
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

            {/* SECTION 1: TIMETABLE OF ROUTES (Hora Salida, Hora Llegada & Horas Extras) */}
            <div className="space-y-3">
              {routes.map((route) => {
                const isDeparted = !!route.actualDeparture;
                const isArrived = !!route.actualArrival;
                const drvOt = route.driverOvertimeMinutes || 0;
                const hlpOt = route.helperOvertimeMinutes || 0;

                return (
                  <div
                    key={route.id}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-md hover:border-sky-500/40 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-500/30">
                            {route.id}
                          </span>
                          <span className="text-xs font-bold text-slate-300">{route.zone}</span>
                          {route.dispatchDate && (
                            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDispatchDate(route.dispatchDate)}</span>
                            </span>
                          )}
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
                          Chofer: <strong className="text-amber-300">🚛 {route.driver}</strong>
                          {route.helper && route.helper !== 'Sin Ayudante' && (
                            <>
                              {' '}
                              &bull; Ayudante:{' '}
                              <strong className="text-indigo-300">👷 {route.helper}</strong>
                            </>
                          )}{' '}
                          &bull; {route.vehicle}
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

                    {/* Hora de Salida, Hora de Llegada & Horas Extras Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* HORA DE SALIDA */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-bold flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5 text-sky-400" />
                            <span>Hora de Salida</span>
                          </span>
                          <input
                            type="time"
                            value={route.actualDeparture || route.scheduledDeparture}
                            onChange={(e) => updateRouteDeparture(route.id, e.target.value)}
                            className="bg-slate-900 text-sky-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-700 text-xs"
                            title="Editar Hora de Salida"
                          />
                        </div>

                        {isDeparted ? (
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black font-mono text-sky-400">
                              {route.actualDeparture}
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Salida Registrada
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateRouteDeparture(route.id)}
                            className="w-full py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Registrar Salida Ahora</span>
                          </button>
                        )}
                      </div>

                      {/* HORA DE LLEGADA */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-bold flex items-center gap-1.5">
                            <Flag className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Hora de Llegada</span>
                          </span>
                          <input
                            type="time"
                            value={route.actualArrival || route.scheduledArrival}
                            onChange={(e) => updateRouteArrival(route.id, e.target.value)}
                            className="bg-slate-900 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-slate-700 text-xs"
                            title="Editar Hora de Llegada (Calcula Hora Extra automáticamente)"
                          />
                        </div>

                        {isArrived ? (
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black font-mono text-emerald-400">
                              {route.actualArrival}
                            </span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Llegada Registrada
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateRouteArrival(route.id)}
                            className="w-full py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Registrar Llegada Ahora</span>
                          </button>
                        )}
                      </div>

                      {/* HORAS EXTRAS CHOFER Y AYUDANTE EN ESTA RUTA */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Hora Extra en Ruta</span>
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Turno: {regularShiftEndTime}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 block">Chofer:</span>
                              <span className="font-mono font-black text-amber-400 text-xs">
                                {formatOvertimeDuration(drvOt)}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRouteOvertime(route.id, drvOt - 15, hlpOt)
                                }
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateRouteOvertime(route.id, drvOt + 15, hlpOt)
                                }
                                className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-[9px] text-slate-400 block">Ayudante:</span>
                              <span className="font-mono font-black text-indigo-400 text-xs">
                                {formatOvertimeDuration(hlpOt)}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRouteOvertime(route.id, drvOt, hlpOt - 15)
                                }
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateRouteOvertime(route.id, drvOt, hlpOt + 15)
                                }
                                className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SECTION 2: DRIVER & HELPER EFFICIENCY SCORECARDS */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Resumen de Eficiencia y Horas Extras por Chofer y Ayudante</span>
              </h3>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Chofer & Ayudante</th>
                        <th className="p-3">Hora Salida</th>
                        <th className="p-3">Hora Llegada</th>
                        <th className="p-3">H. Extra Chofer</th>
                        <th className="p-3">H. Extra Ayudante</th>
                        <th className="p-3">Unidades</th>
                        <th className="p-3 text-center">Eficiencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {driverPerformances.map((perf) => (
                        <tr key={perf.driverName} className="hover:bg-slate-900/50 transition">
                          <td className="p-3 font-bold text-white">
                            <div>
                              <span className="text-amber-300">🚛 {perf.driverName}</span>
                              {perf.helperName && perf.helperName !== 'Sin Ayudante' && (
                                <span className="ml-2 text-[11px] text-indigo-300">
                                  👷 {perf.helperName}
                                </span>
                              )}
                              <span className="block text-[10px] text-slate-500 font-normal">
                                {perf.vehicle}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-sky-400 font-bold">
                            {perf.actualDeparture || perf.scheduledDeparture}
                          </td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">
                            {perf.actualArrival || '--:--'}
                          </td>
                          <td className="p-3 font-mono">
                            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-black">
                              {formatOvertimeDuration(perf.driverOvertimeMinutes)}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg font-black">
                              {formatOvertimeDuration(perf.helperOvertimeMinutes)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-amber-300">{perf.deliveredUnits}</span>
                            <span className="text-slate-500"> / {perf.totalUnits} uds</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-sm font-black text-emerald-400">
                              {perf.efficiencyScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEDICATED OVERTIME TRACKER FOR DRIVER & HELPER */}
        {activeTab === 'overtime' && (
          <div className="space-y-5 overflow-y-auto pr-1 flex-grow text-xs">
            {/* Summary Cards for Drivers & Helpers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Acumulado Choferes */}
              <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Total Horas Extras Acumuladas por Chofer</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {driverTotals.map((d) => (
                    <div
                      key={d.name}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between"
                    >
                      <span className="text-slate-300 font-bold">🚛 {d.name}</span>
                      <span className="text-lg font-black text-amber-400 font-mono mt-1">
                        {formatOvertimeDuration(d.totalMins)}
                      </span>
                      <span className="text-[10px] text-slate-500">{d.totalMins} min totales</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acumulado Ayudantes */}
              <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Total Horas Extras Acumuladas por Ayudante</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {helperTotals.map((h) => (
                    <div
                      key={h.name}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between"
                    >
                      <span className="text-slate-300 font-bold">👷 {h.name}</span>
                      <span className="text-lg font-black text-indigo-400 font-mono mt-1">
                        {formatOvertimeDuration(h.totalMins)}
                      </span>
                      <span className="text-[10px] text-slate-500">{h.totalMins} min totales</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form to Measure & Add New Overtime Entry */}
            <form
              onSubmit={handleAddOvertimeSubmit}
              className="bg-slate-950/90 border-2 border-amber-500/30 rounded-2xl p-4 space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Calculadora y Registro de Hora Extra (Chofer y Ayudante)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Al ingresar la <strong className="text-white">Hora de Llegada</strong> se calcula automáticamente respecto a las{' '}
                  <strong className="text-amber-300 font-mono">{regularShiftEndTime}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Fecha del Despacho *</label>
                  <input
                    type="date"
                    required
                    value={otDate}
                    onChange={(e) => setOtDate(e.target.value)}
                    className="w-full bg-slate-900 text-emerald-300 font-bold p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Destino / Ruta *</label>
                  <select
                    value={otZone}
                    onChange={(e) => setOtZone(e.target.value)}
                    className="w-full bg-slate-900 text-white font-bold p-2 rounded-xl border border-slate-700"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.name}>
                        📍 {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Chofer *</label>
                  <select
                    value={otDriver}
                    onChange={(e) => setOtDriver(e.target.value)}
                    className="w-full bg-slate-900 text-amber-300 font-bold p-2 rounded-xl border border-slate-700"
                  >
                    {drivers.map((d) => (
                      <option key={d} value={d}>
                        🚛 {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Ayudante *</label>
                  <select
                    value={otHelper}
                    onChange={(e) => setOtHelper(e.target.value)}
                    className="w-full bg-slate-900 text-indigo-300 font-bold p-2 rounded-xl border border-slate-700"
                  >
                    {helpers.map((h) => (
                      <option key={h} value={h}>
                        👷 {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Hora de Salida</label>
                  <input
                    type="time"
                    value={otDepTime}
                    onChange={(e) => setOtDepTime(e.target.value)}
                    className="w-full bg-slate-900 text-sky-300 font-mono font-bold p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Hora de Llegada</label>
                  <input
                    type="time"
                    value={otArrTime}
                    onChange={(e) => handleOtArrivalTimeChange(e.target.value)}
                    className="w-full bg-slate-900 text-emerald-300 font-mono font-bold p-2 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-amber-300 mb-1">
                    H. Extra Chofer ({formatOvertimeDuration(otDriverMins)})
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOtDriverMins(Math.max(0, otDriverMins - 15))}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    >
                      -15m
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={otDriverMins}
                      onChange={(e) => setOtDriverMins(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-slate-900 text-center font-mono font-black text-amber-400 py-1.5 rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setOtDriverMins(otDriverMins + 15)}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    >
                      +15m
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-indigo-300 mb-1">
                    H. Extra Ayudante ({formatOvertimeDuration(otHelperMins)})
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOtHelperMins(Math.max(0, otHelperMins - 15))}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    >
                      -15m
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={otHelperMins}
                      onChange={(e) => setOtHelperMins(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-slate-900 text-center font-mono font-black text-indigo-400 py-1.5 rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setOtHelperMins(otHelperMins + 15)}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    >
                      +15m
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  placeholder="Motivo u observación de la hora extra (Ej: Descarga tardía en Santiago, tráfico...)"
                  value={otNotes}
                  onChange={(e) => setOtNotes(e.target.value)}
                  className="flex-grow bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl transition shadow-md flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Hora Extra</span>
                </button>
              </div>
            </form>

            {/* Overtime History Table */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="font-black text-slate-300 uppercase tracking-wider text-[11px]">
                  Historial de Horas Extras Registradas ({overtimeLogs.length})
                </span>
              </div>

              {overtimeLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No hay registros de horas extras todavía.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px]">
                      <tr>
                        <th className="p-3">Fecha Despacho</th>
                        <th className="p-3">Destino</th>
                        <th className="p-3">Chofer</th>
                        <th className="p-3">Ayudante</th>
                        <th className="p-3">Salida &rarr; Llegada</th>
                        <th className="p-3">Extra Chofer</th>
                        <th className="p-3">Extra Ayudante</th>
                        <th className="p-3">Notas</th>
                        <th className="p-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {overtimeLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-3 font-mono font-bold text-emerald-300">
                            {formatDispatchDate(log.date)}
                          </td>
                          <td className="p-3 font-bold text-white">{log.zone}</td>
                          <td className="p-3 font-bold text-amber-300">🚛 {log.driver}</td>
                          <td className="p-3 font-bold text-indigo-300">👷 {log.helper}</td>
                          <td className="p-3 font-mono text-slate-300">
                            {log.departureTime} &rarr;{' '}
                            <strong className="text-emerald-400">{log.arrivalTime}</strong>
                          </td>
                          <td className="p-3 font-mono">
                            <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-black">
                              {formatOvertimeDuration(log.driverOvertimeMinutes)}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-black">
                              {formatOvertimeDuration(log.helperOvertimeMinutes)}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 max-w-[180px] truncate" title={log.notes}>
                            {log.notes || '--'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteOvertimeLog(log.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                              title="Eliminar registro de hora extra"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
