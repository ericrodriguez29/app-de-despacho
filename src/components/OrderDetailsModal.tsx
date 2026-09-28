import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Boxes,
  Clock,
  History,
  Trash2,
  CheckCircle2,
  Tag,
  Calendar,
  Palette,
  Save,
  User,
  Users,
} from 'lucide-react';
import { Order } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';
import {
  getColorSwatch,
  formatDispatchDate,
  formatOvertimeDuration,
  calculateOvertimeMinutes,
} from '../data/initialData';

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
  const {
    deleteOrder,
    updateOrder,
    aluzincColors,
    drivers,
    helpers,
    regularShiftEndTime,
    addOvertimeLog,
  } = useDispatch();

  const [dispatchDate, setDispatchDate] = useState('');
  const [driver, setDriver] = useState('');
  const [helper, setHelper] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [driverOvertimeMinutes, setDriverOvertimeMinutes] = useState(0);
  const [helperOvertimeMinutes, setHelperOvertimeMinutes] = useState(0);
  const [itemsState, setItemsState] = useState(order?.items || []);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (order) {
      setDispatchDate(order.dispatchDate || new Date().toISOString().split('T')[0]);
      setDriver(order.driver || 'Carlos');
      setHelper(order.helper || 'José');
      setDepartureTime(
        order.departureTime ||
          (order.dispatchedAt ? order.dispatchedAt.slice(11, 16) : '')
      );
      setArrivalTime(
        order.arrivalTime ||
          (order.deliveredAt ? order.deliveredAt.slice(11, 16) : '')
      );
      setDriverOvertimeMinutes(order.driverOvertimeMinutes || 0);
      setHelperOvertimeMinutes(order.helperOvertimeMinutes || 0);
      setItemsState(order.items);
      setSavedNotice(false);
    }
  }, [order]);

  if (!order) return null;

  const handleDelete = () => {
    deleteOrder(order.id);
    onClose();
  };

  const handleDepartureChange = (val: string) => {
    setDepartureTime(val);
    if (arrivalTime) {
      const autoOt = calculateOvertimeMinutes(arrivalTime, regularShiftEndTime, val);
      setDriverOvertimeMinutes(autoOt);
      setHelperOvertimeMinutes(helper && helper !== 'Sin Ayudante' ? autoOt : 0);
    }
  };

  const handleArrivalChange = (val: string) => {
    setArrivalTime(val);
    if (val) {
      const autoOt = calculateOvertimeMinutes(val, regularShiftEndTime, departureTime);
      setDriverOvertimeMinutes(autoOt);
      setHelperOvertimeMinutes(helper && helper !== 'Sin Ayudante' ? autoOt : 0);
    }
  };

  const handleItemColorChange = (itemId: string, newColor: string) => {
    setItemsState((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, color: newColor } : it))
    );
  };

  const handleSaveChanges = () => {
    const updatedOrder: Order = {
      ...order,
      dispatchDate,
      driver,
      helper,
      departureTime: departureTime || undefined,
      arrivalTime: arrivalTime || undefined,
      driverOvertimeMinutes,
      helperOvertimeMinutes,
      items: itemsState,
    };
    updateOrder(updatedOrder);

    if (driverOvertimeMinutes > 0 || helperOvertimeMinutes > 0) {
      addOvertimeLog({
        date: dispatchDate,
        orderId: order.id,
        routeId: order.routeId,
        zone: order.zone,
        driver,
        helper: helper || 'Sin Ayudante',
        departureTime: departureTime || '08:00',
        arrivalTime: arrivalTime || '18:00',
        regularEndTime: regularShiftEndTime,
        driverOvertimeMinutes,
        helperOvertimeMinutes,
        notes: `Actualizado desde detalles del pedido ${order.id}.`,
      });
    }

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-500/30">
                {order.id}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                📍 {order.zone}
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Despacho: {formatDispatchDate(dispatchDate)}</span>
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

        {savedNotice && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¡Cambios guardados (Fecha, Colores de Aluzinc y Horas Extras actualizadas)!</span>
          </div>
        )}

        {/* Info Grid */}
        <div className="space-y-4 text-xs font-semibold">
          {/* Status, Priority & Editable Dispatch Date */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 items-center border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Estado Actual:</span>
              <span className="font-black text-sm text-sky-400 uppercase tracking-wider">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Prioridad:</span>
              <span className="font-bold text-amber-400 text-sm">{order.priority}</span>
            </div>
            <div>
              <label className="text-emerald-400 block text-[11px] font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Fecha de Despacho:
              </label>
              <input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full bg-slate-900 text-emerald-300 font-bold px-2.5 py-1.5 rounded-xl border border-emerald-500/40 focus:outline-none focus:border-emerald-400 text-xs"
              />
            </div>
          </div>

          {/* Precision Unit Count & Multi-item List with Editable Aluzinc Color */}
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

            {/* Itemized Table with Color of Aluzinc */}
            <div className="pt-2 border-t border-slate-700/60 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                <span>Desglose por Tipo de Producto y Color del Aluzinc:</span>
              </span>
              <div className="space-y-2">
                {itemsState.map((it) => {
                  const swatch = getColorSwatch(it.color);
                  return (
                    <div
                      key={it.id}
                      className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-white font-bold">{it.productType}</span>
                        {it.calibre && (
                          <span className="text-slate-400 font-mono text-[10px]">
                            ({it.calibre})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        {/* Color selector for this item */}
                        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-700">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${swatch.dotClass}`} />
                          <select
                            value={it.color || 'No aplica'}
                            onChange={(e) => handleItemColorChange(it.id, e.target.value)}
                            className="bg-transparent text-sky-300 font-bold text-[11px] focus:outline-none cursor-pointer"
                            title="Cambiar color del Aluzinc / Producto"
                          >
                            {aluzincColors.map((col) => (
                              <option key={col} value={col} className="bg-slate-900 text-white">
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>

                        <span className="font-mono text-amber-300 font-black shrink-0">
                          {it.unitsDelivered !== undefined ? `${it.unitsDelivered} / ` : ''}
                          {it.unitsCount} uds
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chofer, Ayudante, Horarios (Salida / Llegada) y Medición de Horas Extras */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Control de Horarios y Hora Extra (Chofer y Ayudante)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Horario: <strong className="text-emerald-400 font-mono">8:00 AM-12:00 PM | 2:00 PM-6:00 PM</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" /> Chofer
                </label>
                <select
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full bg-slate-900 text-amber-300 font-bold p-2 rounded-xl border border-slate-700 text-xs"
                >
                  {drivers.map((d) => (
                    <option key={d} value={d}>
                      🚛 {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-400" /> Ayudante
                </label>
                <select
                  value={helper}
                  onChange={(e) => setHelper(e.target.value)}
                  className="w-full bg-slate-900 text-indigo-300 font-bold p-2 rounded-xl border border-slate-700 text-xs"
                >
                  {helpers.map((h) => (
                    <option key={h} value={h}>
                      👷 {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Hora de Salida</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => handleDepartureChange(e.target.value)}
                  className="w-full bg-slate-900 text-sky-300 font-mono font-bold p-2 rounded-xl border border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Hora de Llegada</label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => handleArrivalChange(e.target.value)}
                  className="w-full bg-slate-900 text-emerald-300 font-mono font-bold p-2 rounded-xl border border-slate-700 text-xs"
                />
              </div>
            </div>

            {/* Overtime Steppers for Driver & Helper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Hora Extra Chofer ({driver}):</span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {formatOvertimeDuration(driverOvertimeMinutes)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDriverOvertimeMinutes(Math.max(0, driverOvertimeMinutes - 15))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-[11px]"
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

              <div className="bg-slate-900 p-2.5 rounded-xl border border-indigo-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Hora Extra Ayudante ({helper}):</span>
                  <span className="text-sm font-black text-indigo-400 font-mono">
                    {formatOvertimeDuration(helperOvertimeMinutes)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHelperOvertimeMinutes(Math.max(0, helperOvertimeMinutes - 15))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-[11px]"
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

          {/* Address & Contact */}
          <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-slate-300">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-slate-500 block text-[11px]">Dirección de Entrega:</span>
                <p className="text-white mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{order.address}</span>
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-slate-500 block text-[11px]">Teléfono:</span>
                <p className="text-slate-200">{order.phone}</p>
              </div>
            </div>
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

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition text-xs flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>

            {order.status !== 'entregado' && (
              <button
                onClick={() => {
                  handleSaveChanges();
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
