import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  X,
  Boxes,
  MapPin,
  Tag,
  Plus,
  Minus,
  Calendar,
  Clock,
} from 'lucide-react';
import { Order, OrderItem } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';
import {
  getColorSwatch,
  formatDispatchDate,
  formatOvertimeDuration,
  calculateOvertimeMinutes,
} from '../data/initialData';

interface DeliveryConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
}

export const DeliveryConfirmationModal: React.FC<DeliveryConfirmationModalProps> = ({
  order,
  onClose,
}) => {
  const { advanceOrderStatus, regularShiftEndTime, addOvertimeLog } = useDispatch();

  const [itemsDelivered, setItemsDelivered] = useState<OrderItem[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [driverOvertimeMinutes, setDriverOvertimeMinutes] = useState(0);
  const [helperOvertimeMinutes, setHelperOvertimeMinutes] = useState(0);

  useEffect(() => {
    if (order) {
      setItemsDelivered(
        order.items.map((it) => ({
          ...it,
          unitsDelivered: it.unitsDelivered ?? it.unitsCount,
        }))
      );
      setDeliveryNotes('');

      const nowTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const autoOt = calculateOvertimeMinutes(
        order.arrivalTime || nowTime,
        regularShiftEndTime,
        order.departureTime || '08:00'
      );
      setDriverOvertimeMinutes(order.driverOvertimeMinutes ?? autoOt);
      setHelperOvertimeMinutes(
        order.helperOvertimeMinutes ??
          (order.helper && order.helper !== 'Sin Ayudante' ? autoOt : 0)
      );
    }
  }, [order, regularShiftEndTime]);

  if (!order) return null;

  const totalDelivered = itemsDelivered.reduce(
    (acc, it) => acc + (it.unitsDelivered ?? it.unitsCount),
    0
  );

  const handleUpdateItemCount = (itemId: string, count: number) => {
    setItemsDelivered((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, unitsDelivered: Math.max(0, count) } : it))
    );
  };

  const handleVerifyAll100Percent = () => {
    setItemsDelivered((prev) =>
      prev.map((it) => ({
        ...it,
        unitsDelivered: it.unitsCount,
      }))
    );
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();

    advanceOrderStatus(order.id, 'entregado', {
      unitsVerified: totalDelivered,
      itemsDelivered,
      driverOvertimeMinutes,
      helperOvertimeMinutes,
      notes:
        deliveryNotes.trim() ||
        `Descarga verificada conforme (${totalDelivered} de ${order.unitsCount} unidades totales).`,
    });

    if (driverOvertimeMinutes > 0 || helperOvertimeMinutes > 0) {
      const nowTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      addOvertimeLog({
        date: order.dispatchDate || new Date().toISOString().split('T')[0],
        orderId: order.id,
        routeId: order.routeId,
        zone: order.zone,
        driver: order.driver,
        helper: order.helper || 'Sin Ayudante',
        departureTime: order.departureTime || '08:00',
        arrivalTime: order.arrivalTime || nowTime,
        regularEndTime: regularShiftEndTime,
        driverOvertimeMinutes,
        helperOvertimeMinutes,
        notes: deliveryNotes.trim() || `Hora extra registrada al confirmar entrega ${order.id}.`,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                {order.id}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                📍 {order.zone}
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDispatchDate(order.dispatchDate)}</span>
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">{order.client}</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination, Driver & Helper Info */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300">
            <div className="flex items-center gap-3">
              <span>
                Chofer: <strong className="text-amber-300">🚛 {order.driver}</strong>
              </span>
              {order.helper && order.helper !== 'Sin Ayudante' && (
                <span>
                  Ayudante: <strong className="text-indigo-300">👷 {order.helper}</strong>
                </span>
              )}
            </div>
            <span className="text-slate-400">
              Total Despacho: <strong className="text-white">{order.unitsCount} unidades</strong>
            </span>
          </div>
          <p className="text-slate-400 text-[11px] flex items-center gap-1.5 pt-1 border-t border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{order.address}</span>
          </p>
        </div>

        <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs font-semibold">
          {/* MULTI-ITEM COUNTING & VERIFICATION WITH ALUZINC COLOR */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-amber-400 font-bold flex items-center gap-1.5">
                <Boxes className="w-4 h-4" />
                <span>Verificación de Unidades y Colores por Producto</span>
              </label>
              <button
                type="button"
                onClick={handleVerifyAll100Percent}
                className="text-[11px] text-amber-300 hover:underline font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20"
              >
                Verificar Todo (100%)
              </button>
            </div>

            {/* List of items with count adjustment */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {itemsDelivered.map((item) => {
                const count = item.unitsDelivered ?? item.unitsCount;
                const swatch = getColorSwatch(item.color);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-extrabold text-white text-xs flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{item.productType}</span>
                        </h4>
                        {swatch.isApplicable && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${swatch.badgeClass}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${swatch.dotClass}`} />
                            {item.color}
                          </span>
                        )}
                      </div>
                      {item.calibre && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.calibre}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 block">
                        Prog: {item.unitsCount} unidades
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateItemCount(item.id, count - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center active:scale-90 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) =>
                          handleUpdateItemCount(item.id, parseInt(e.target.value, 10) || 0)
                        }
                        className="w-14 bg-slate-950 text-center font-black text-sm text-amber-300 border border-slate-700 rounded-lg py-1 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateItemCount(item.id, count + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center active:scale-90 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total verified summary */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-bold">Total Unidades a Confirmar:</span>
              <span className="text-amber-400 font-black text-base">
                {totalDelivered} / {order.unitsCount} unidades
              </span>
            </div>
          </div>

          {/* OVERTIME MEASUREMENT AT DELIVERY (HORA EXTRA CHOFER Y AYUDANTE) */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Medición de Hora Extra (Chofer y Ayudante)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Horario: <strong className="text-emerald-400 font-mono">8:00 AM-12:00 PM | 2:00 PM-6:00 PM</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    Hora Extra Chofer ({order.driver}):
                  </span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {formatOvertimeDuration(driverOvertimeMinutes)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDriverOvertimeMinutes(Math.max(0, driverOvertimeMinutes - 15))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-[11px]"
                  >
                    -15m
                  </button>
                  <button
                    type="button"
                    onClick={() => setDriverOvertimeMinutes(driverOvertimeMinutes + 15)}
                    className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/30 text-[11px] font-bold"
                  >
                    +15m
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    Hora Extra Ayudante ({order.helper || 'Sin Ayudante'}):
                  </span>
                  <span className="text-sm font-black text-indigo-400 font-mono">
                    {formatOvertimeDuration(helperOvertimeMinutes)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHelperOvertimeMinutes(Math.max(0, helperOvertimeMinutes - 15))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-[11px]"
                  >
                    -15m
                  </button>
                  <button
                    type="button"
                    onClick={() => setHelperOvertimeMinutes(helperOvertimeMinutes + 15)}
                    className="px-2 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg border border-indigo-500/30 text-[11px] font-bold"
                  >
                    +15m
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-slate-300 mb-1">
              Notas / Observaciones de Descarga (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Descarga completada en patio sin novedades."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Descarga Conforme ({totalDelivered} Uds)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
