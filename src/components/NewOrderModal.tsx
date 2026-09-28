import React, { useState, useEffect } from 'react';
import {
  Boxes,
  X,
  Plus,
  Trash2,
  MapPin,
  Phone,
  User,
  Truck,
  AlertCircle,
  Clock,
  Settings2,
  Layers,
  Tag,
  Check,
} from 'lucide-react';
import { Priority, OrderItem } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';

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
  const { addOrder, routes, destinations, productPresentations, calibres, drivers } = useDispatch();

  const [client, setClient] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [routeId, setRouteId] = useState('RUT-01');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [driver, setDriver] = useState('Carlos');

  // Multi-item builder state (Cada tipo de unidad despachada en el mismo envío)
  const [orderItems, setOrderItems] = useState<Array<{
    id: string;
    productType: string;
    calibre: string;
    unitsCount: number;
    notes?: string;
  }>>([
    {
      id: `item-${Date.now()}-1`,
      productType: 'Aluzinc',
      calibre: 'Calibre 26 (0.45 mm)',
      unitsCount: 40,
    },
    {
      id: `item-${Date.now()}-2`,
      productType: 'Caballete',
      calibre: 'Calibre 26 (0.45 mm)',
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

  if (!isOpen) return null;

  const totalUnitsInOrder = orderItems.reduce((acc, it) => acc + (it.unitsCount || 0), 0);

  const handleAddItemRow = () => {
    const defaultProd = productPresentations[0]?.name || 'Aluzinc';
    const defaultCal = productPresentations[0]?.defaultCalibre || calibres[2] || 'Calibre 26 (0.45 mm)';
    setOrderItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productType: defaultProd,
        calibre: defaultCal,
        unitsCount: 20,
      },
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (orderItems.length === 1) {
      alert('El envío debe contener al menos un tipo de producto.');
      return;
    }
    setOrderItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemProductChange = (id: string, newProd: string) => {
    const found = productPresentations.find((p) => p.name === newProd);
    setOrderItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              productType: newProd,
              calibre: found?.defaultCalibre || it.calibre,
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
      alert('Por favor complete los datos obligatorios y asegúrese de que haya unidades en el envío.');
      return;
    }

    const formattedItems: OrderItem[] = orderItems.map((it) => ({
      id: it.id,
      productType: it.productType,
      calibre: it.calibre,
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
      items: formattedItems,
      unitsCount: totalUnitsInOrder,
    });

    onClose();
    // Reset fields
    setClient('');
    setPhone('');
    setAddress('');
    setOrderItems([
      {
        id: `item-${Date.now()}-1`,
        productType: 'Aluzinc',
        calibre: 'Calibre 26 (0.45 mm)',
        unitsCount: 40,
      },
      {
        id: `item-${Date.now()}-2`,
        productType: 'Caballete',
        calibre: 'Calibre 26 (0.45 mm)',
        unitsCount: 10,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[95vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Nuevo Pedido de Despacho</h3>
              <p className="text-xs text-slate-400">Despacho de múltiples productos y cantidades en el mismo envío</p>
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
                title="Editar catálogo de destinos y productos"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Catálogo</span>
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
          {/* RUTA / ZONA / DESTINO */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-sky-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sky-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>Destino / Zona de Entrega *</span>
              </label>
            </div>

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

          {/* MULTI-PRODUCT ITEM BREAKDOWN (CANTIDAD DE CADA TIPO DE UNIDAD EN EL MISMO ENVÍO) */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border-2 border-amber-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <label className="text-amber-400 font-black text-sm flex items-center gap-1.5">
                  <Boxes className="w-4 h-4" />
                  <span>Productos & Cantidades Despachadas en este Envío</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Desglosa la cantidad exacta de cada tipo de unidad (Caballete, Aluzinc, Tolas, etc.)
                </span>
              </div>

              <div className="bg-slate-900 px-3 py-1 rounded-xl border border-amber-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-slate-400 text-xs font-bold">Total del Envío:</span>
                <span className="text-amber-400 font-black text-base">{totalUnitsInOrder}</span>
                <span className="text-xs text-slate-400">unidades</span>
              </div>
            </div>

            {/* List of Product Rows */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {orderItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 group hover:border-amber-500/40 transition"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-slate-700">
                    {index + 1}
                  </span>

                  {/* Product Type Dropdown */}
                  <div className="flex-grow min-w-[140px]">
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Tipo de Unidad / Producto</label>
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

                  {/* Calibre Dropdown */}
                  <div className="sm:w-44">
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Calibre / Espesor</label>
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

                  {/* Quantity Stepper */}
                  <div className="sm:w-32">
                    <label className="text-[10px] text-slate-400 block mb-0.5 font-bold">Cantidad (Uds)</label>
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
                        onChange={(e) => handleItemCountChange(item.id, parseInt(e.target.value, 10) || 1)}
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

                  {/* Remove row button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(item.id)}
                    className="self-end sm:self-center p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
                    title="Eliminar este producto del envío"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add More Product Button */}
            <button
              type="button"
              onClick={handleAddItemRow}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl text-amber-300 font-bold transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Añadir Otro Tipo de Producto a este Envío</span>
            </button>
          </div>

          {/* Driver (Carlos, Danilo, Nelson) & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1">Chofer Asignado *</label>
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
