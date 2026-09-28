import React from 'react';
import { Search, Filter, User, AlertCircle, RotateCcw, Calendar } from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { formatDispatchDate } from '../data/initialData';

export const FilterBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedZone,
    setSelectedZone,
    selectedPriority,
    setSelectedPriority,
    selectedDriver,
    setSelectedDriver,
    selectedDispatchDate,
    setSelectedDispatchDate,
    orders,
    destinations,
  } = useDispatch();

  // Extract unique drivers, dates and combine destinations
  const uniqueDrivers = Array.from(new Set(orders.map((o) => o.driver).filter(Boolean)));
  const uniqueDates = Array.from(
    new Set(orders.map((o) => o.dispatchDate).filter(Boolean))
  ).sort();
  const allDestNames = Array.from(
    new Set([...destinations.map((d) => d.name), ...orders.map((o) => o.zone)].filter(Boolean))
  );

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedZone !== 'ALL' ||
    selectedPriority !== 'ALL' ||
    selectedDriver !== 'ALL' ||
    selectedDispatchDate !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedZone('ALL');
    setSelectedPriority('ALL');
    setSelectedDriver('ALL');
    setSelectedDispatchDate('ALL');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-3xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-md">
      {/* Search Input */}
      <div className="relative flex-grow max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por cliente, destino, color de Aluzinc, fecha, chofer..."
          className="w-full bg-slate-800/90 text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-2xl text-xs font-medium border border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            &times;
          </button>
        )}
      </div>

      {/* Dropdown Filters */}
      <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
        {/* Dispatch Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-800/70 border border-emerald-500/30 rounded-2xl px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={selectedDispatchDate}
            onChange={(e) => setSelectedDispatchDate(e.target.value)}
            className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer pr-1"
            title="Filtrar por Fecha de Despacho"
          >
            <option value="ALL" className="bg-slate-900 text-white">
              Todas las Fechas
            </option>
            {uniqueDates.map((dateStr) => (
              <option key={dateStr} value={dateStr} className="bg-slate-900 text-white">
                📅 {formatDispatchDate(dateStr)}
              </option>
            ))}
          </select>
        </div>

        {/* Route / Zone Filter */}
        <div className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/80 rounded-2xl px-3 py-1.5">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-slate-900">
              Todos los Destinos
            </option>
            {allDestNames.map((z) => (
              <option key={z} value={z} className="bg-slate-900">
                {z}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/80 rounded-2xl px-3 py-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-slate-900">
              Prioridad (Todas)
            </option>
            <option value="Urgente" className="bg-slate-900">
              🔴 Urgente
            </option>
            <option value="Alta" className="bg-slate-900">
              🟠 Alta
            </option>
            <option value="Normal" className="bg-slate-900">
              🟢 Normal
            </option>
          </select>
        </div>

        {/* Driver Filter */}
        <div className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/80 rounded-2xl px-3 py-1.5">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
          >
            <option value="ALL" className="bg-slate-900">
              Chofer (Todos)
            </option>
            {uniqueDrivers.map((d) => (
              <option key={d} value={d} className="bg-slate-900">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl text-xs font-bold transition"
            title="Limpiar filtros"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
};
