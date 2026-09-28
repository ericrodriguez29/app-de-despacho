import React from 'react';
import {
  X,
  MapPin,
  Phone,
  Boxes,
  Clock,
  Truck,
  History,
  Trash2,
  CheckCircle2,
  Tag,
  Layers,
} from 'lucide-react';
import { Order } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenHistory: (order: Order) => void;
  onOpenConfirmation: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onOpenHistory,
  onOpenConfirmation,
}) => {
  const { deleteOrder } = useDispatch();

  if (!order) return null;

  const handleDelete = () => {
    if (confirm(`¿Está seguro de eliminar el pedido ${order.id}?`)) {
      deleteOrder(order.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-500/30">
                {order.id}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                📍 {order.zone}
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">{order.client}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="space-y-4 text-xs font-semibold">
          {/* Status and Priority */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl flex items-center justify-between border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Estado Actual:</span>
              <span className="font-black text-sm text-sky-400 uppercase tracking-wider">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Prioridad:</span>
              <span className="font-bold text-amber-400">{order.priority}</span>
            </div>
          </div>

          {/* Precision Unit Count & Multi-item List */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Total Unidades en el Envío:</span>
                  <span className="text-base font-black text-amber-300">
                    {order.unitsCount} unidades
                  </span>
                </div>
              </div>
              {order.unitsDelivered !== undefined && (
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl text-xs font-bold">
                  {order.unitsDelivered} entregadas
                </span>
              )}
            </div>

            {/* Itemized Table */}
            <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                Desglose por Tipo de Unidad Despachada:
              </span>
              <div className="space-y-1">
                {order.items.map((it) => (
                  <div
                    key={it.id}
                    className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-white font-bold">{it.productType}</span>
                      {it.calibre && <span className="text-slate-400 font-mono text-[10px]">({it.calibre})</span>}
                    </div>
                    <span className="font-mono text-amber-300 font-black">
                      {it.unitsDelivered !== undefined ? `${it.unitsDelivered} / ` : ''}{it.unitsCount} uds
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-slate-300">
            <div>
              <span className="text-slate-500 block text-[11px]">Dirección de Entrega:</span>
              <p className="text-white mt-0.5">{order.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div>
                <span className="text-slate-500 block text-[11px]">Teléfono:</span>
                <p className="text-slate-200">{order.phone}</p>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Chofer Asignado:</span>
                <p className="text-amber-300 font-bold">🚛 {order.driver}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-[11px] text-slate-400 font-mono">
            <div>🕒 Creado: <span className="text-slate-200">{order.createdAt}</span></div>
            <div>🚚 Salida a Ruta: <span className="text-slate-200">{order.dispatchedAt || 'Pendiente'}</span></div>
            <div>🏁 Llegada / Entrega: <span className="text-slate-200">{order.deliveredAt || 'En proceso'}</span></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap gap-2 justify-between border-t border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl font-bold transition text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenHistory(order);
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-bold transition text-xs flex items-center gap-1 border border-slate-700"
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial</span>
            </button>
          </div>

          <div className="flex gap-2">
            {order.status !== 'entregado' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenConfirmation(order);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition text-xs flex items-center gap-1 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar Entrega</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
