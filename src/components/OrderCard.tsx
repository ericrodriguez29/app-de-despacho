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
  Tag,
  Layers,
} from 'lucide-react';
import { Order } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';

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

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/40 rounded-3xl p-4 shadow-lg transition transform active:scale-[0.99] space-y-3 cursor-grab active:cursor-grabbing group relative overflow-hidden"
    >
      {/* Top Header: ID, Priority & Client */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-black text-sky-400 tracking-wider bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/30">
              {order.id}
            </span>
            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md border ${priorityClass}`}>
              {order.priority}
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
        <div className="flex items-center gap-1.5 text-sky-400 font-bold">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{order.zone}</span>
        </div>
        <p className="text-slate-400 text-[11px] line-clamp-1 pl-5">
          {order.address}
        </p>
      </div>

      {/* QUANTITY OF UNITS & MULTI-PRODUCT ITEMIZED BREAKDOWN */}
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

        {/* Itemized product badges */}
        <div className="pt-1.5 border-t border-slate-800 space-y-1">
          <div className="flex flex-wrap gap-1">
            {order.items.slice(0, 3).map((it) => (
              <span
                key={it.id}
                className="text-[10px] bg-slate-950 text-slate-200 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1"
              >
                <strong className="text-amber-300">{it.unitsCount}</strong>
                <span>{it.productType}</span>
                {it.calibre && <span className="text-slate-400 font-mono text-[9px]">({it.calibre.split(' ')[1] || ''})</span>}
              </span>
            ))}
            {order.items.length > 3 && (
              <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/20">
                +{order.items.length - 3} más
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Driver & Status */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
        <span className="flex items-center gap-1 font-medium truncate max-w-[150px]">
          <User className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate font-bold text-slate-300">🚛 {order.driver}</span>
        </span>
        <button
          onClick={() => onOpenDetails(order)}
          className="text-sky-400 hover:text-sky-300 font-bold text-[11px]"
        >
          Detalles &rarr;
        </button>
      </div>

      {/* Primary Action Buttons */}
      <div className="pt-1">
        {order.status === 'por_despachar' && (
          <button
            onClick={() => advanceOrderStatus(order.id, 'en_ruta', { notes: 'Salida de almacén hacia destino.' })}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2 px-3 rounded-2xl text-xs transition shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Despachar a Ruta</span>
          </button>
        )}

        {order.status === 'en_ruta' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => advanceOrderStatus(order.id, 'en_descarga', { notes: 'Llegada a rampa del cliente. Iniciando descarga de unidades.' })}
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
