import React from 'react';
import {
  Boxes,
  Truck,
  MapPin,
  Clock,
  User,
  History,
  CheckCircle2,
  Check,
  Calendar,
} from 'lucide-react';
import { Order } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';
import {
  getColorSwatch,
  formatDispatchDate,
  formatOvertimeDuration,
} from '../data/initialData';

interface OrderCardProps {
  order: Order;
  onOpenDetails: (order: Order) => void;
  onOpenConfirmation: (order: Order) => void;
  onOpenHistory: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onOpenDetails,
  onOpenConfirmation,
  onOpenHistory,
}) => {
  const { advanceOrderStatus } = useDispatch();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', order.id);
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  // Priority styling
  let priorityClass = 'bg-slate-700/60 text-slate-300 border-slate-600';
  if (order.priority === 'Urgente') {
    priorityClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-extrabold';
  } else if (order.priority === 'Alta') {
    priorityClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold';
  }

  const hasOvertime =
    (order.driverOvertimeMinutes && order.driverOvertimeMinutes > 0) ||
    (order.helperOvertimeMinutes && order.helperOvertimeMinutes > 0);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/40 rounded-3xl p-4 shadow-lg transition transform active:scale-[0.99] space-y-3 cursor-grab active:cursor-grabbing group relative overflow-hidden"
    >
      {/* Top Header: ID, Priority, Dispatch Date & Client */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono font-black text-sky-400 tracking-wider bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/30">
              {order.id}
            </span>
            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md border ${priorityClass}`}>
              {order.priority}
            </span>
            <span
              className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1"
              title="Fecha programada de despacho"
            >
              <Calendar className="w-2.5 h-2.5 text-emerald-400" />
              <span>{formatDispatchDate(order.dispatchDate)}</span>
            </span>
          </div>
          <h3 className="font-extrabold text-sm text-white mt-1 line-clamp-1 group-hover:text-sky-300 transition">
            {order.client}
          </h3>
        </div>

        {/* History Quick Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenHistory(order);
          }}
          className="p-1.5 bg-slate-900/80 hover:bg-slate-700 text-slate-400 hover:text-sky-400 rounded-xl transition border border-slate-700/60"
          title="Ver Historial Detallado de Estados"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Destination & Address */}
      <div className="space-y-1 text-xs text-slate-300">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold truncate">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{order.zone}</span>
          </div>
          {(order.departureTime || order.arrivalTime) && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
              {order.departureTime || '--:--'} &rarr; {order.arrivalTime || '--:--'}
            </span>
          )}
        </div>
        <p className="text-slate-400 text-[11px] line-clamp-1 pl-5">
          {order.address}
        </p>
      </div>

      {/* QUANTITY OF UNITS & MULTI-PRODUCT ITEMIZED BREAKDOWN WITH ALUZINC COLOR */}
      <div className="bg-slate-900/90 rounded-2xl p-2.5 border border-slate-700/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Total Unidades
              </span>
              <span className="text-xs font-black text-amber-300">
                {order.unitsCount} unidades
              </span>
            </div>
          </div>

          {order.status === 'entregado' && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              {order.unitsDelivered ?? order.unitsCount} Recibidas
            </span>
          )}
        </div>

        {/* Itemized product badges with Aluzinc Color dot */}
        <div className="pt-1.5 border-t border-slate-800 space-y-1">
          <div className="flex flex-wrap gap-1">
            {order.items.slice(0, 3).map((it) => {
              const swatch = getColorSwatch(it.color);
              return (
                <span
                  key={it.id}
                  className="text-[10px] bg-slate-950 text-slate-200 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1"
                >
                  <strong className="text-amber-300">{it.unitsCount}</strong>
                  <span>{it.productType}</span>
                  {swatch.isApplicable && (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[9px] font-bold ${swatch.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${swatch.dotClass}`} />
                      {it.color}
                    </span>
                  )}
                  {it.calibre && (
                    <span className="text-slate-400 font-mono text-[9px]">
                      ({it.calibre.split(' ')[1] || ''})
                    </span>
                  )}
                </span>
              );
            })}
            {order.items.length > 3 && (
              <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/20">
                +{order.items.length - 3} más
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Driver, Helper & Overtime */}
      <div className="space-y-1.5 pt-1 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5 truncate">
            <span className="flex items-center gap-1 font-bold text-slate-200">
              <User className="w-3 h-3 text-amber-400 shrink-0" />
              <span>🚛 {order.driver}</span>
            </span>
            {order.helper && order.helper !== 'Sin Ayudante' && (
              <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-500/30">
                👷 {order.helper}
              </span>
            )}
          </div>
          <button
            onClick={() => onOpenDetails(order)}
            className="text-sky-400 hover:text-sky-300 font-bold text-[11px] shrink-0"
          >
            Detalles &rarr;
          </button>
        </div>

        {hasOvertime && (
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/25 rounded-lg px-2 py-1 text-[10px]">
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Hora Extra:</span>
            </span>
            <div className="flex items-center gap-2 font-mono font-bold">
              <span className="text-amber-300">
                Chofer: {formatOvertimeDuration(order.driverOvertimeMinutes)}
              </span>
              {order.helper && order.helper !== 'Sin Ayudante' && (
                <span className="text-indigo-300">
                  Ayud: {formatOvertimeDuration(order.helperOvertimeMinutes)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="pt-1">
        {order.status === 'por_despachar' && (
          <button
            onClick={() =>
              advanceOrderStatus(order.id, 'en_ruta', {
                notes: 'Salida de almacén hacia destino.',
              })
            }
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2 px-3 rounded-2xl text-xs transition shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Despachar a Ruta</span>
          </button>
        )}

        {order.status === 'en_ruta' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                advanceOrderStatus(order.id, 'en_descarga', {
                  notes: 'Llegada a rampa del cliente. Iniciando descarga de unidades.',
                })
              }
              className="w-full bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white border border-indigo-500/30 font-bold py-2 px-2 rounded-2xl text-xs transition flex items-center justify-center gap-1 active:scale-95"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Llegué / Descargar</span>
            </button>
            <button
              onClick={() => onOpenConfirmation(order)}
              className="w-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 font-bold py-2 px-2 rounded-2xl text-xs transition flex items-center justify-center gap-1 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar</span>
            </button>
          </div>
        )}

        {order.status === 'en_descarga' && (
          <button
            onClick={() => onOpenConfirmation(order)}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold py-2 px-3 rounded-2xl text-xs transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmar Entrega Conforme</span>
          </button>
        )}

        {order.status === 'entregado' && (
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Entregado Conforme</span>
            </span>
            <button
              onClick={() => onOpenHistory(order)}
              className="text-slate-300 hover:text-white underline text-[10px]"
            >
              Ver Trazabilidad
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
