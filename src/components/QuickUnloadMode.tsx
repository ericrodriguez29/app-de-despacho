import React from 'react';
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Boxes,
  History,
  Plus,
  Minus,
  Check,
  Zap,
  Tag,
} from 'lucide-react';
import { Order } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';

interface QuickUnloadModeProps {
  onOpenConfirmation: (order: Order) => void;
  onOpenHistory: (order: Order) => void;
  onExitMode: () => void;
}

export const QuickUnloadMode: React.FC<QuickUnloadModeProps> = ({
  onOpenConfirmation,
  onOpenHistory,
  onExitMode,
}) => {
  const {
    orders,
    routes,
    drivers,
    activeDriverFilter,
    setActiveDriverFilter,
    advanceOrderStatus,
    quickVerifyUnits,
    quickVerifyItemUnits,
    updateRouteDeparture,
    updateRouteArrival,
  } = useDispatch();

  const driversList = drivers.length > 0 ? drivers : ['Carlos', 'Danilo', 'Nelson'];

  const driverOrders = orders.filter((o) => o.driver === activeDriverFilter);
  const activeRoute = routes.find((r) => r.driver === activeDriverFilter);

  const currentStops = driverOrders.filter(
    (o) => o.status === 'en_ruta' || o.status === 'en_descarga'
  );
  const pendingStops = driverOrders.filter(
    (o) => o.status === 'por_despachar' || o.status === 'en_preparacion'
  );
  const completedStops = driverOrders.filter((o) => o.status === 'entregado');

  const totalDriverUnits = driverOrders.reduce((a, b) => a + b.unitsCount, 0);
  const deliveredDriverUnits = completedStops.reduce(
    (a, b) => a + (b.unitsDelivered ?? b.unitsCount),
    0
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Banner: Driver Quick Dashboard & Route Timestamps */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shadow-amber-500/30">
              <Zap className="w-7 h-7 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Modo Chofer & Descarga Rápida
                </span>
                <span className="text-xs text-slate-400 font-mono">Uso Rápido</span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white mt-0.5">
                Panel de Descarga en Rampa &bull; Conteo de Unidades
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 hidden sm:inline">Chofer:</label>
            <select
              value={activeDriverFilter}
              onChange={(e) => setActiveDriverFilter(e.target.value)}
              className="bg-slate-900 text-amber-300 border border-amber-500/40 rounded-2xl px-3 py-2 text-xs font-black focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {driversList.map((d) => (
                <option key={d} value={d}>
                  🚛 {d}
                </option>
              ))}
            </select>

            <button
              onClick={onExitMode}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-bold transition border border-slate-700"
            >
              Cerrar Modo Chofer
            </button>
          </div>
        </div>

        {/* Route Timetable bar */}
        {activeRoute && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-slate-400 font-bold">Ruta / Zona:</span>
              <span className="text-sky-400 font-black truncate max-w-[170px]">{activeRoute.name}</span>
            </div>

            {/* Salida Almacén */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-slate-400 font-bold">Salida Almacén:</span>
              {activeRoute.actualDeparture ? (
                <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {activeRoute.actualDeparture} (Prog: {activeRoute.scheduledDeparture})
                </span>
              ) : (
                <button
                  onClick={() => updateRouteDeparture(activeRoute.id)}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] transition shadow-md"
                >
                  Registrar Salida Ahora
                </button>
              )}
            </div>

            {/* Llegada Fin de Ruta */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-slate-400 font-bold">Llegada/Fin:</span>
              {activeRoute.actualArrival ? (
                <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {activeRoute.actualArrival} (Prog: {activeRoute.scheduledArrival})
                </span>
              ) : (
                <button
                  onClick={() => updateRouteArrival(activeRoute.id)}
                  disabled={!activeRoute.actualDeparture}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition ${
                    activeRoute.actualDeparture
                      ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Registrar Llegada/Fin
                </button>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar of Units */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span>Progreso de Descarga: {deliveredDriverUnits} de {totalDriverUnits} Unidades</span>
            <span className="text-amber-400 font-mono font-black">
              {totalDriverUnits > 0 ? Math.round((deliveredDriverUnits / totalDriverUnits) * 100) : 0}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{
                width: `${totalDriverUnits > 0 ? (deliveredDriverUnits / totalDriverUnits) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: ACTIVE / IMMEDIATE STOPS */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span>Parada Actual en Curso / Descarga Activa ({currentStops.length})</span>
        </h3>

        {currentStops.length === 0 ? (
          <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-6 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
            <p className="text-sm font-bold text-slate-300">No hay paradas en descarga en este instante.</p>
            <p className="text-xs text-slate-500">
              Despacha una parada de la lista pendiente para iniciar el proceso de conteo y entrega.
            </p>
          </div>
        ) : (
          currentStops.map((order, idx) => {
            const verifiedUnits = order.unitsDelivered ?? order.unitsCount;

            return (
              <div
                key={order.id}
                className="bg-slate-900 border-2 border-sky-500/60 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4 relative overflow-hidden"
              >
                {/* Header with Stop # and Client */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md">
                        PARADA #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-500/30">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold text-sky-300 bg-sky-950/60 px-2.5 py-0.5 rounded-lg border border-sky-500/20">
                        📍 {order.zone}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-white mt-1">{order.client}</h4>
                  </div>

                  {order.phone && order.phone !== 'N/A' && (
                    <a
                      href={`tel:${order.phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-600/30 active:scale-95 self-start sm:self-auto"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Llamar al Cliente</span>
                    </a>
                  )}
                </div>

                {/* Address and Breakdown of items */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-start gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Dirección de Entrega:</strong>
                      <p className="text-slate-300 mt-0.5">{order.address}</p>
                    </div>
                  </div>

                  {/* Multi-product items chips */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                      Desglose de Productos en este Envío:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {order.items.map((it) => (
                        <div
                          key={it.id}
                          className="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-[11px]"
                        >
                          <span className="text-amber-300 font-bold">{it.unitsCount} uds</span>
                          <span className="text-white font-semibold">{it.productType}</span>
                          {it.calibre && <span className="text-slate-400 font-mono text-[10px]">({it.calibre})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* STEP 1: If in transit, 1-tap "Llegué al Cliente" button */}
                {order.status === 'en_ruta' && (
                  <div className="bg-indigo-950/30 border border-indigo-500/30 p-4 rounded-2xl space-y-3 text-center">
                    <p className="text-xs text-indigo-200 font-bold">
                      ¿Has llegado a las instalaciones del cliente en {order.zone}?
                    </p>
                    <button
                      onClick={() =>
                        advanceOrderStatus(order.id, 'en_descarga', {
                          notes: `Llegada a ${order.zone}. Iniciando descarga y verificación de unidades.`,
                        })
                      }
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-500/30 transition flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Clock className="w-5 h-5" />
                      <span>1-TOQUE: LLEGUÉ AL CLIENTE &bull; INICIAR DESCARGA</span>
                    </button>
                  </div>
                )}

                {/* STEP 2: MULTI-ITEM COUNTING TOUCH CONTROLS */}
                {order.status === 'en_descarga' && (
                  <div className="bg-slate-950/90 border-2 border-amber-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                            Conteo de Unidades en Rampa
                          </span>
                          <span className="text-xs text-slate-300">
                            Total programado: <strong className="text-white">{order.unitsCount} unidades</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-400">Verificadas:</span>
                        <span className="text-2xl font-black text-amber-400">{verifiedUnits}</span>
                        <span className="text-xs font-bold text-slate-400">/ {order.unitsCount}</span>
                      </div>
                    </div>

                    {/* Per-item quick stepper */}
                    <div className="space-y-2">
                      {order.items.map((it) => {
                        const itemDelivered = it.unitsDelivered ?? it.unitsCount;
                        return (
                          <div
                            key={it.id}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="text-white font-bold">{it.productType}</span>
                              {it.calibre && <span className="text-slate-400 font-mono text-[10px] ml-1">({it.calibre})</span>}
                              <span className="text-[10px] text-slate-500 block">Prog: {it.unitsCount} uds</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => quickVerifyItemUnits(order.id, it.id, itemDelivered - 1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 active:scale-90 flex items-center justify-center"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono font-black text-amber-300 text-sm w-8 text-center">
                                {itemDelivered}
                              </span>
                              <button
                                type="button"
                                onClick={() => quickVerifyItemUnits(order.id, it.id, itemDelivered + 1)}
                                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 active:scale-90 flex items-center justify-center"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Complete Delivery Button */}
                    <button
                      onClick={() => onOpenConfirmation(order)}
                      className="w-full mt-2 py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 active:scale-95 border border-emerald-400/30"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>CONFIRMAR ENTREGA &bull; CONCLUIR DESCARGA ({verifiedUnits} UDS)</span>
                    </button>
                  </div>
                )}

                {/* Bottom Timeline button */}
                <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                  <span>Salida a Ruta: {order.dispatchedAt || '--'}</span>
                  <button
                    onClick={() => onOpenHistory(order)}
                    className="text-sky-400 hover:text-sky-300 font-bold underline flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Ver Historial de Estados</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SECTION 2: PENDING STOPS */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Próximas Paradas en Cola ({pendingStops.length})</span>
        </h3>

        {pendingStops.length === 0 ? (
          <p className="text-xs text-slate-500 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            No quedan pedidos pendientes de salida para este transportista.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingStops.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-md hover:border-slate-700"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-black text-sky-400">{order.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {order.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">{order.client}</h4>
                  <p className="text-xs text-sky-400 font-bold mt-0.5">📍 {order.zone}</p>
                  <p className="text-xs text-amber-300 font-bold mt-1">
                    📦 {order.unitsCount} unidades combinadas
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {order.items.map((it) => (
                      <span key={it.id} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {it.unitsCount} {it.productType}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() =>
                    advanceOrderStatus(order.id, 'en_ruta', {
                      notes: `Salida de almacén iniciada hacia ${order.zone}.`,
                    })
                  }
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-sky-600/20"
                >
                  <Truck className="w-4 h-4" />
                  <span>Iniciar Salida a Ruta</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: COMPLETED STOPS */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Paradas Entregadas Conformes ({completedStops.length})</span>
        </h3>

        {completedStops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {completedStops.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/80 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{order.id}</span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      {order.unitsDelivered ?? order.unitsCount} uds entregadas
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-white mt-1">{order.client} ({order.zone})</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {order.itemsDescription || order.items.map((it) => `${it.unitsCount} ${it.productType}`).join(', ')}
                  </p>
                </div>

                <button
                  onClick={() => onOpenHistory(order)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition border border-slate-700"
                >
                  Historial
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
