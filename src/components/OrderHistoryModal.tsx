import React from 'react';
import {
  History,
  X,
  MapPin,
  Clock,
  User,
  Boxes,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Tag,
  Layers,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/dispatch';

interface OrderHistoryModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  order,
  onClose,
}) => {
  if (!order) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'por_despachar':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
          title: 'Por Despachar (Almacén)',
        };
      case 'en_preparacion':
        return {
          bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          dot: 'bg-yellow-400',
          title: 'En Preparación & Embalaje',
        };
      case 'en_ruta':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          dot: 'bg-sky-400',
          title: 'En Ruta de Transporte',
        };
      case 'en_descarga':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          dot: 'bg-indigo-400',
          title: 'En Destino (Descargando)',
        };
      case 'entregado':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400',
          title: 'Entregado Conforme',
        };
      case 'novedad':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          dot: 'bg-rose-400',
          title: 'Novedad / Incidencia',
        };
      case 'devuelto':
        return {
          bg: 'bg-slate-700 text-slate-300 border-slate-600',
          dot: 'bg-slate-400',
          title: 'Devuelto a Almacén',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          dot: 'bg-slate-400',
          title: status,
        };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-xl border border-sky-500/30">
                {order.id}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                📍 {order.zone}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              Historial Detallado de Estados & Trazabilidad
            </h2>
            <p className="text-xs text-slate-400">Cliente: <strong className="text-slate-200">{order.client}</strong></p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              title="Imprimir Guía de Estados"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* General Summary Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs shrink-0">
          <div>
            <span className="text-slate-500 font-bold block">Total Unidades:</span>
            <span className="text-amber-400 font-black text-sm">{order.unitsCount} unidades</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block">Tipos de Producto:</span>
            <span className="text-white font-bold text-sm">{order.items.length} productos</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block">Chofer Asignado:</span>
            <span className="text-amber-300 font-bold">🚛 {order.driver}</span>
          </div>
          <div>
            <span className="text-slate-500 font-bold block">Hora Salida / Entrega:</span>
            <span className="text-sky-300 font-mono font-bold">
              {order.dispatchedAt ? order.dispatchedAt.slice(11, 16) : 'Pendiente'} &bull; {order.deliveredAt ? order.deliveredAt.slice(11, 16) : 'En ruta'}
            </span>
          </div>
        </div>

        {/* Itemized breakdown box */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl space-y-2 shrink-0 text-xs">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Productos y Cantidades en este Envío:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {order.items.map((it) => (
              <div
                key={it.id}
                className="bg-slate-900 border border-slate-700/80 p-2 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-white font-bold">{it.productType}</span>
                  {it.calibre && <span className="text-slate-400 font-mono text-[10px]">({it.calibre})</span>}
                </div>
                <span className="text-amber-300 font-mono font-black">{it.unitsCount} uds</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Timeline Scrollable Section */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-grow">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <span>Línea de Tiempo Cronológica ({order.history.length} Eventos)</span>
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {order.history.map((entry, index) => {
              const badge = getStatusBadge(entry.status);
              const isLast = index === order.history.length - 1;

              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 ${badge.dot} shadow-lg shadow-sky-500/20 flex items-center justify-center`}
                  >
                    {isLast && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                  </div>

                  {/* Entry Card */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2.5 shadow-md group-hover:border-sky-500/40 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${badge.bg}`}>
                          {entry.statusLabel}
                        </span>
                        {entry.durationFromPrevMinutes !== undefined && entry.durationFromPrevMinutes > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                            ⏱️ +{entry.durationFromPrevMinutes} min
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{entry.timestamp}</span>
                      </div>
                    </div>

                    {/* Notes & Description */}
                    <p className="text-xs text-slate-200 font-medium">
                      {entry.notes || 'Estado registrado satisfactoriamente.'}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>Responsable: <strong className="text-slate-300">{entry.updatedBy}</strong></span>
                      </span>

                      {entry.unitsVerified !== undefined && (
                        <span className="flex items-center gap-1 text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700">
                          <Boxes className="w-3 h-3 text-amber-400" />
                          <span>{entry.unitsVerified} unidades verificadas</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirmation Summary if Delivered */}
        {order.status === 'entregado' && (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Confirmación de Entrega Conforme</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                100% Verificado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
              <div>
                <span className="text-slate-400 text-[11px] block">Unidades Entregadas:</span>
                <strong className="text-amber-300 text-sm">{order.unitsDelivered ?? order.unitsCount} unidades</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Tiempo de Descarga:</span>
                <strong className="text-sky-300 text-sm">{order.unloadingDurationMinutes ? `${order.unloadingDurationMinutes} min` : 'Normal'}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
};
