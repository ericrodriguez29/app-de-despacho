import React, { useState, useEffect } from 'react';
import {
  Boxes,
  X,
  Plus,
  Trash2,
  MapPin,
  Phone,
  User,
  Users,
  Calendar,
  Clock,
  Settings2,
  Palette,
} from 'lucide-react';
import { Priority, OrderItem } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';
import {
  getColorSwatch,
  calculateOvertimeMinutes,
  formatOvertimeDuration,
} from '../data/initialData';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCatalogSettings?: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onOpenCatalogSettings,
}) => {
  const {
    addOrder,
    destinations,
    productPresentations,
    calibres,
    aluzincColors,
    drivers,
    helpers,
    regularShiftEndTime,
  } = useDispatch();

  const todayStr = new Date().toISOString().split('T')[0];

  const [client, setClient] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [routeId, setRouteId] = useState('RUT-01');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [dispatchDate, setDispatchDate] = useState(todayStr);
  const [driver, setDriver] = useState('Carlos');
  const [helper, setHelper] = useState('José');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [arrivalTime, setArrivalTime] = useState('');
  const [driverOvertimeMinutes, setDriverOvertimeMinutes] = useState(0);
  const [helperOvertimeMinutes, setHelperOvertimeMinutes] = useState(0);

  // Multi-item builder state (Cada tipo de unidad despachada en el mismo envío + Color de Aluzinc)
  const [orderItems, setOrderItems] = useState<
    Array<{
      id: string;
      productType: string;
      calibre: string;
      color: string;
      unitsCount: number;
      notes?: string;
    }>
  >([
    {
      id: `item-${Date.now()}-1`,
      productType: 'Aluzinc',
      calibre: 'Calibre 26 (0.45 mm)',
      color: 'Azul liso',
      unitsCount: 40,
    },
    {
      id: `item-${Date.now()}-2`,
      productType: 'Caballete',
      calibre: 'Calibre 26 (0.45 mm)',
      color: 'Azul liso',
      unitsCount: 10,
    },
  ]);

  useEffect(() => {
    if (destinations.length > 0 && !zone) {
      setZone(destinations[0].name);
    }
  }, [destinations, zone]);

  useEffect(() => {
    if (drivers.length > 0 && !driver) {
      setDriver(drivers[0]);
    }
  }, [drivers, driver]);

  useEffect(() => {
    if (helpers.length > 0 && !helper) {
      setHelper(helpers[0]);
    }
  }, [helpers, helper]);

  if (!isOpen) return null;

  const totalUnitsInOrder = orderItems.reduce((acc, it) => acc + (it.unitsCount || 0), 0);

  const handleArrivalTimeChange = (newArrTime: string) => {
    setArrivalTime(newArrTime);
    if (newArrTime) {
      const autoOt = calculateOvertimeMinutes(newArrTime, regularShiftEndTime);
      setDriverOvertimeMinutes(autoOt);
      setHelperOvertimeMinutes(helper && helper !== 'Sin Ayudante' ? autoOt : 0);
    }
  };

  const handleAddItemRow = () => {
    const defaultProd = productPresentations[1]?.name || productPresentations[0]?.name || 'Aluzinc';
    const found = productPresentations.find((p) => p.name === defaultProd);
    const defaultCal = found?.defaultCalibre || calibres[2] || 'Calibre 26 (0.45 mm)';
    const defaultCol = found?.defaultColor || 'Azul liso';
    setOrderItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productType: defaultProd,
        calibre: defaultCal,
        color: defaultCol,
        unitsCount: 20,
      },
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (orderItems.length === 1) {
      return;
    }
    setOrderItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemProductChange = (id: string, newProd: string) => {
    const found = productPresentations.find((p) => p.name === newProd);
    const isRoofProduct =
      newProd.toLowerCase().includes('aluzinc') ||
      newProd.toLowerCase().includes('aluteja') ||
      newProd.toLowerCase().includes('caballete') ||
      newProd.toLowerCase().includes('lima');

    setOrderItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              productType: newProd,
              calibre: found?.defaultCalibre || it.calibre,
              color:
                found?.defaultColor ||
                (isRoofProduct
                  ? it.color === 'No aplica'
                    ? 'Azul liso'
                    : it.color
                  : 'No aplica'),
            }
          : it
      )
    );
  };

  const handleItemCalibreChange = (id: string, newCal: string) => {
    setOrderItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, calibre: newCal } : it))
    );
  };

  const handleItemColorChange = (id: string, newColor: string) => {
    setOrderItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, color: newColor } : it))
    );
  };

  const handleItemCountChange = (id: string, count: number) => {
    setOrderItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, unitsCount: Math.max(1, count) } : it))
    );
  };

  const handleZoneChange = (zoneName: string) => {
    setZone(zoneName);
    if (!client.trim() || destinations.some((d) => d.name === client)) {
      setClient(zoneName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.trim() || !address.trim() || totalUnitsInOrder <= 0) {
      return;
    }

    const formattedItems: OrderItem[] = orderItems.map((it) => ({
      id: it.id,
      productType: it.productType,
      calibre: it.calibre,
      color: it.color,
      unitsCount: it.unitsCount,
      unitsDelivered: it.unitsCount,
      notes: it.notes,
    }));

    addOrder({
      client: client.trim(),
      phone: phone.trim() || 'N/A',
      address: address.trim(),
      zone: zone || 'Hierro Rafa STGO',
      routeId,
      priority,
      status: 'por_despachar',
      driver: driver || 'Carlos',
      helper: helper || 'José',
      dispatchDate: dispatchDate || todayStr,
      departureTime: departureTime || undefined,
      arrivalTime: arrivalTime || undefined,
      driverOvertimeMinutes: driverOvertimeMinutes > 0 ? driverOvertimeMinutes : undefined,
      helperOvertimeMinutes: helperOvertimeMinutes > 0 ? helperOvertimeMinutes : undefined,
      items: formattedItems,
      unitsCount: totalUnitsInOrder,
    });

    onClose();
    // Reset fields
    setClient('');
    setPhone('');
    setAddress('');
    setArrivalTime('');
    setDriverOvertimeMinutes(0);
    setHelperOvertimeMinutes(0);
    setOrderItems([
      {
        id: `item-${Date.now()}-1`,
        productType: 'Aluzinc',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Azul liso',
        unitsCount: 40,
      },
      {
        id: `item-${Date.now()}-2`,
        productType: 'Caballete',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Azul liso',
        unitsCount: 10,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Nuevo Pedido de Despacho</h3>
              <p className="text-xs text-slate-400">
                Color de Aluzinc, Fecha de Despacho, Chofer, Ayudante y Horas Extras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCatalogSettings && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCatalogSettings();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-bold transition border border-slate-700"
                title="Editar catálogo de destinos, colores y productos"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catálogo & Colores</span>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {/* DESTINO Y FECHA DE DESPACHO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-sky-500/30">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-sky-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Destino / Zona de Entrega *</span>
              </label>
              <select
                value={zone}
                onChange={(e) => handleZoneChange(e.target.value)}
                className="w-full bg-slate-900 text-white font-bold text-sm p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.name}>
                    📍 {d.name} {d.cityRegion ? `(${d.cityRegion})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Fecha de Despacho *</span>
              </label>
              <input
                type="date"
                required
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full bg-slate-900 text-emerald-300 font-black text-sm p-2.5 rounded-xl border border-emerald-500/40 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Client & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Nombre del Cliente / Destino *</label>
              <input
                type="text"
                required
                placeholder="Ej: Hierro Rafa STGO"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="+1 (809) 582-1144"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-slate-300 mb-1">Dirección Exacta de Entrega *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <textarea
                required
                rows={2}
                placeholder="Av. Circunvalación Sur, Patio Industrial #4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 text-white pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* MULTI-PRODUCT ITEM BREAKDOWN WITH ALUZINC COLOR */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border-2 border-amber-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <label className="text-amber-400 font-black text-sm flex items-center gap-1.5">
                  <Boxes className="w-4 h-4" />
                  <span>Productos, Color del Aluzinc & Cantidades Despachadas</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Selecciona cada tipo de unidad, su calibre, el <strong className="text-sky-300">color del Aluzinc/techo</strong> y la cantidad
                </span>
              </div>

              <div className="bg-slate-900 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-slate-400 text-xs font-bold">Total del Envío:</span>
                <span className="text-amber-400 font-black text-base">{totalUnitsInOrder}</span>
                <span className="text-xs text-slate-400">unidades</span>
              </div>
            </div>

            {/* List of Product Rows */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {orderItems.map((item, index) => {
                const swatch = getColorSwatch(item.color);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 flex flex-col gap-2.5 group hover:border-amber-500/40 transition"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      {/* Product Type Dropdown */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                          #{index + 1} Producto / Unidad
                        </label>
                        <select
                          value={item.productType}
                          onChange={(e) => handleItemProductChange(item.id, e.target.value)}
                          className="w-full bg-slate-800 text-amber-300 font-bold p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 text-xs"
                        >
                          {productPresentations.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Color del Aluzinc / Lámina Dropdown */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-sky-400 block mb-0.5 font-bold flex items-center gap-1">
                          <Palette className="w-3 h-3" />
                          <span>Color (Aluzinc / Techo)</span>
                        </label>
                        <div className="relative flex items-center">
                          <span
                            className={`w-2.5 h-2.5 rounded-full absolute left-2.5 pointer-events-none ${swatch.dotClass}`}
                          />
                          <select
                            value={item.color}
                            onChange={(e) => handleItemColorChange(item.id, e.target.value)}
                            className="w-full bg-slate-800 text-white font-bold pl-7 pr-2 py-2 rounded-xl border border-sky-500/40 focus:outline-none focus:border-sky-400 text-xs"
                          >
                            {aluzincColors.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Calibre Dropdown */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                          Calibre / Espesor
                        </label>
                        <select
                          value={item.calibre}
                          onChange={(e) => handleItemCalibreChange(item.id, e.target.value)}
                          className="w-full bg-slate-800 text-slate-200 p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 text-xs font-mono"
                        >
                          {calibres.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Stepper & Delete */}
                      <div className="sm:col-span-3 flex items-end gap-1.5">
                        <div className="flex-grow">
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">
                            Cantidad (Uds)
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleItemCountChange(item.id, item.unitsCount - 5)}
                              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
                              title="-5 unidades"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              required
                              value={item.unitsCount}
                              onChange={(e) =>
                                handleItemCountChange(item.id, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-full bg-slate-800 text-center font-black text-sm text-amber-300 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleItemCountChange(item.id, item.unitsCount + 5)}
                              className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-slate-700"
                              title="+5 unidades"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(item.id)}
                          disabled={orderItems.length === 1}
                          className={`p-2 rounded-xl transition ${
                            orderItems.length === 1
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                          }`}
                          title="Eliminar este producto del envío"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add More Product Button */}
            <button
              type="button"
              onClick={handleAddItemRow}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl text-amber-300 font-bold transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Añadir Otro Producto / Color de Aluzinc a este Envío</span>
            </button>
          </div>

          {/* CHOFER, AYUDANTE & PRIORIDAD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Chofer Asignado *</span>
              </label>
              <select
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="w-full bg-slate-800 text-amber-300 font-bold p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
              >
                {drivers.map((d) => (
                  <option key={d} value={d}>
                    🚛 {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ayudante Asignado</span>
              </label>
              <select
                value={helper}
                onChange={(e) => setHelper(e.target.value)}
                className="w-full bg-slate-800 text-indigo-300 font-bold p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                {helpers.map((h) => (
                  <option key={h} value={h}>
                    👷 {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-800 text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              >
                <option value="Normal">🟢 Normal</option>
                <option value="Alta">🟠 Alta</option>
                <option value="Urgente">🔴 Urgente</option>
              </select>
            </div>
          </div>

          {/* HORARIOS (SOLO HORA DE SALIDA Y HORA DE LLEGADA) + MEDICIÓN DE HORA EXTRA */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2">
              <label className="text-indigo-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Hora de Salida / Hora de Llegada & Medición de Horas Extras</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Fin de jornada normal: <strong className="text-white font-mono">{regularShiftEndTime}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 text-[11px]">Hora de Salida</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-900 text-sky-300 font-mono font-bold p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 text-[11px]">Hora de Llegada</label>
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => handleArrivalTimeChange(e.target.value)}
                  className="w-full bg-slate-900 text-emerald-300 font-mono font-bold p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-amber-300 mb-1 text-[11px]">
                  Hora Extra Chofer ({formatOvertimeDuration(driverOvertimeMinutes)})
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDriverOvertimeMinutes(Math.max(0, driverOvertimeMinutes - 15))}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    title="-15 min"
                  >
                    -15m
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={driverOvertimeMinutes}
                    onChange={(e) => setDriverOvertimeMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-900 text-center font-mono font-black text-amber-300 py-1.5 rounded-lg border border-slate-700"
                    title="Minutos de hora extra del chofer"
                  />
                  <button
                    type="button"
                    onClick={() => setDriverOvertimeMinutes(driverOvertimeMinutes + 15)}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    title="+15 min"
                  >
                    +15m
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-indigo-300 mb-1 text-[11px]">
                  Hora Extra Ayudante ({formatOvertimeDuration(helperOvertimeMinutes)})
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHelperOvertimeMinutes(Math.max(0, helperOvertimeMinutes - 15))}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    title="-15 min"
                  >
                    -15m
                  </button>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={helperOvertimeMinutes}
                    onChange={(e) => setHelperOvertimeMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-900 text-center font-mono font-black text-indigo-300 py-1.5 rounded-lg border border-slate-700"
                    title="Minutos de hora extra del ayudante"
                  />
                  <button
                    type="button"
                    onClick={() => setHelperOvertimeMinutes(helperOvertimeMinutes + 15)}
                    className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                    title="+15 min"
                  >
                    +15m
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Programar Despacho ({totalUnitsInOrder} Uds)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
