import React, { useState } from 'react';
import {
  Settings2,
  X,
  MapPin,
  Boxes,
  Plus,
  Trash2,
  Edit2,
  Check,
  Tag,
  User,
  Users,
  Palette,
  Sparkles,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useDispatch } from '../context/DispatchContext';
import { getColorSwatch } from '../data/initialData';

interface CatalogSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogSettingsModal: React.FC<CatalogSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    destinations,
    addDestination,
    updateDestination,
    deleteDestination,
    productPresentations,
    addProductPresentation,
    updateProductPresentation,
    deleteProductPresentation,
    calibres,
    addCalibre,
    deleteCalibre,
    aluzincColors,
    addAluzincColor,
    deleteAluzincColor,
    drivers,
    addDriver,
    deleteDriver,
    helpers,
    addHelper,
    deleteHelper,
    clearAllToZero,
    resetAllData,
    orders,
  } = useDispatch();

  const [activeTab, setActiveTab] = useState<
    'destinations' | 'products' | 'colors' | 'calibres' | 'drivers' | 'reset'
  >('destinations');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Destination inputs
  const [newDestName, setNewDestName] = useState('');
  const [newDestRegion, setNewDestRegion] = useState('');
  const [editingDestId, setEditingDestId] = useState<string | null>(null);
  const [editDestName, setEditDestName] = useState('');
  const [editDestRegion, setEditDestRegion] = useState('');

  // Product Presentation inputs
  const [newProdName, setNewProdName] = useState('');
  const [newProdCalibreReq, setNewProdCalibreReq] = useState(true);
  const [newProdDefaultCal, setNewProdDefaultCal] = useState('Calibre 26 (0.45 mm)');
  const [newProdDefaultColor, setNewProdDefaultColor] = useState('Azul liso');
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdDefaultCal, setEditProdDefaultCal] = useState('');
  const [editProdDefaultColor, setEditProdDefaultColor] = useState('');

  // Color input
  const [newColorName, setNewColorName] = useState('');

  // Calibre input
  const [newCalibreName, setNewCalibreName] = useState('');

  // Driver & Helper inputs
  const [newDriverName, setNewDriverName] = useState('');
  const [newHelperName, setNewHelperName] = useState('');

  if (!isOpen) return null;

  // Handlers for Destinations
  const handleAddDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName.trim()) return;
    addDestination({
      name: newDestName.trim(),
      cityRegion: newDestRegion.trim() || 'Región Cibao',
    });
    setNewDestName('');
    setNewDestRegion('');
  };

  const handleSaveEditDest = (id: string) => {
    if (!editDestName.trim()) return;
    updateDestination({
      id,
      name: editDestName.trim(),
      cityRegion: editDestRegion.trim() || 'Región Cibao',
    });
    setEditingDestId(null);
  };

  // Handlers for Products
  const handleAddProd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    addProductPresentation({
      name: newProdName.trim(),
      calibreRequired: newProdCalibreReq,
      defaultCalibre: newProdDefaultCal,
      defaultColor: newProdDefaultColor,
      hasColor: newProdDefaultColor !== 'No aplica',
    });
    setNewProdName('');
  };

  const handleSaveEditProd = (id: string) => {
    if (!editProdName.trim()) return;
    updateProductPresentation({
      id,
      name: editProdName.trim(),
      calibreRequired: true,
      defaultCalibre: editProdDefaultCal,
      defaultColor: editProdDefaultColor,
      hasColor: editProdDefaultColor !== 'No aplica',
    });
    setEditingProdId(null);
  };

  // Handlers for Aluzinc Colors
  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColorName.trim()) return;
    addAluzincColor(newColorName.trim());
    setNewColorName('');
  };

  // Handlers for Calibres
  const handleAddCal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCalibreName.trim()) return;
    addCalibre(newCalibreName.trim());
    setNewCalibreName('');
  };

  // Handlers for Drivers & Helpers
  const handleAddDrv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;
    addDriver(newDriverName.trim());
    setNewDriverName('');
  };

  const handleAddHlp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHelperName.trim()) return;
    addHelper(newHelperName.trim());
    setNewHelperName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Settings2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white">
                Catálogo de Destinos, Productos, Colores de Aluzinc & Personal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Personaliza los destinos, productos, colores de Aluzinc, calibres, choferes y ayudantes.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'destinations'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Destinos ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'products'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Productos ({productPresentations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'colors'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                : 'bg-slate-800/80 text-sky-300 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Colores Aluzinc ({aluzincColors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calibres')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'calibres'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Calibres ({calibres.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'drivers'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Choferes & Ayudantes</span>
          </button>

          <button
            onClick={() => setActiveTab('reset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activeTab === 'reset'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                : 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Poner en Cero</span>
          </button>
        </div>

        {/* Tab 1: DESTINATIONS & ZONES */}
        {activeTab === 'destinations' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs">
            <form
              onSubmit={handleAddDest}
              className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                required
                placeholder="Nombre del Destino (Ej: Jarabacoa, Hierro Rafa STGO...)"
                value={newDestName}
                onChange={(e) => setNewDestName(e.target.value)}
                className="flex-grow bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-semibold"
              />
              <input
                type="text"
                placeholder="Ciudad / Región (Ej: Santiago, La Vega)"
                value={newDestRegion}
                onChange={(e) => setNewDestRegion(e.target.value)}
                className="sm:w-48 bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-sm hover:border-sky-500/40 transition"
                >
                  {editingDestId === dest.id ? (
                    <div className="flex-grow flex flex-col gap-2">
                      <input
                        type="text"
                        value={editDestName}
                        onChange={(e) => setEditDestName(e.target.value)}
                        className="bg-slate-900 text-white px-2 py-1.5 rounded-lg border border-sky-500 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={editDestRegion}
                        onChange={(e) => setEditDestRegion(e.target.value)}
                        className="bg-slate-900 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 text-xs"
                      />
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingDestId(null)}
                          className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-lg text-[11px]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditDest(dest.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{dest.name}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 pl-5">
                          {dest.cityRegion || 'Cibao Central'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingDestId(dest.id);
                            setEditDestName(dest.name);
                            setEditDestRegion(dest.cityRegion || '');
                          }}
                          className="p-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-sky-400 rounded-lg transition"
                          title="Editar nombre o región"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteDestination(dest.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          title="Eliminar destino"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: PRODUCT PRESENTATIONS */}
        {activeTab === 'products' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs">
            <form
              onSubmit={handleAddProd}
              className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                required
                placeholder="Nombre del Producto (Ej: Aluzinc, Caballete, Tolas...)"
                value={newProdName}
                onChange={(e) => setNewProdName(e.target.value)}
                className="flex-grow bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 font-semibold"
              />
              <select
                value={newProdDefaultColor}
                onChange={(e) => setNewProdDefaultColor(e.target.value)}
                className="sm:w-44 bg-slate-800 text-sky-300 font-bold px-3 py-2 rounded-xl border border-slate-700"
              >
                {aluzincColors.map((col) => (
                  <option key={col} value={col}>
                    Color: {col}
                  </option>
                ))}
              </select>
              <select
                value={newProdDefaultCal}
                onChange={(e) => setNewProdDefaultCal(e.target.value)}
                className="sm:w-48 bg-slate-800 text-slate-200 px-3 py-2 rounded-xl border border-slate-700"
              >
                {calibres.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-md flex items-center justify-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {productPresentations.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-sm hover:border-amber-500/40 transition"
                >
                  {editingProdId === prod.id ? (
                    <div className="flex-grow flex flex-col gap-2">
                      <input
                        type="text"
                        value={editProdName}
                        onChange={(e) => setEditProdName(e.target.value)}
                        className="bg-slate-900 text-white px-2 py-1.5 rounded-lg border border-amber-500 text-xs font-bold"
                      />
                      <select
                        value={editProdDefaultColor}
                        onChange={(e) => setEditProdDefaultColor(e.target.value)}
                        className="bg-slate-900 text-sky-300 px-2 py-1 rounded-lg border border-slate-700 text-xs"
                      >
                        {aluzincColors.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editProdDefaultCal}
                        onChange={(e) => setEditProdDefaultCal(e.target.value)}
                        className="bg-slate-900 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 text-xs"
                      >
                        {calibres.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingProdId(null)}
                          className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-lg text-[11px]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditProd(prod.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{prod.name}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 pl-5 font-mono">
                          Calibre: <strong className="text-amber-300">{prod.defaultCalibre || 'Calibre 26'}</strong>
                          {prod.defaultColor && prod.defaultColor !== 'No aplica' && (
                            <>
                              {' '}
                              &bull; Color: <strong className="text-sky-300">{prod.defaultColor}</strong>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingProdId(prod.id);
                            setEditProdName(prod.name);
                            setEditProdDefaultCal(prod.defaultCalibre || 'Calibre 26 (0.45 mm)');
                            setEditProdDefaultColor(prod.defaultColor || 'No aplica');
                          }}
                          className="p-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg transition"
                          title="Editar producto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteProductPresentation(prod.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: COLORES DE ALUZINC */}
        {activeTab === 'colors' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs">
            <form
              onSubmit={handleAddColor}
              className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex gap-2"
            >
              <input
                type="text"
                required
                placeholder="Nuevo Color de Aluzinc / Lámina (Ej: Azul Cielo, Verde Esmeralda, Terracota...)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-grow bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-semibold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition shadow-md flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Color</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {aluzincColors.map((col) => {
                const swatch = getColorSwatch(col);
                return (
                  <div
                    key={col}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${swatch.dotClass}`} />
                      <span className="font-bold text-xs text-white">{col}</span>
                    </div>
                    {aluzincColors.length > 1 && (
                      <button
                        onClick={() => deleteAluzincColor(col)}
                        className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                        title="Eliminar color"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: CALIBRES & GAUGES */}
        {activeTab === 'calibres' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs">
            <form
              onSubmit={handleAddCal}
              className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex gap-2"
            >
              <input
                type="text"
                required
                placeholder="Nuevo Calibre / Espesor (Ej: Calibre 20, Calibre 3/8...)"
                value={newCalibreName}
                onChange={(e) => setNewCalibreName(e.target.value)}
                className="flex-grow bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 font-semibold"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {calibres.map((cal) => (
                <div
                  key={cal}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm"
                >
                  <span className="font-mono text-xs font-bold text-slate-200">{cal}</span>
                  <button
                    onClick={() => deleteCalibre(cal)}
                    className="p-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                    title="Eliminar calibre"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: DRIVERS & HELPERS (Choferes y Ayudantes) */}
        {activeTab === 'drivers' && (
          <div className="space-y-5 overflow-y-auto pr-1 flex-grow text-xs">
            {/* Choferes Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Choferes / Transportistas ({drivers.length})</span>
              </h3>

              <form
                onSubmit={handleAddDrv}
                className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Nombre del Chofer (Ej: Carlos, Danilo, Nelson...)"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="flex-grow bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 font-semibold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Chofer</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {drivers.map((drv) => (
                  <div
                    key={drv}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-2"
                  >
                    <span className="font-extrabold text-sm text-amber-300">🚛 {drv}</span>
                    {drivers.length > 1 && (
                      <button
                        onClick={() => deleteDriver(drv)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Ayudantes Section */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Ayudantes de Camión ({helpers.length})</span>
              </h3>

              <form
                onSubmit={handleAddHlp}
                className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  required
                  placeholder="Nombre del Ayudante (Ej: José, Miguel, Pedro...)"
                  value={newHelperName}
                  onChange={(e) => setNewHelperName(e.target.value)}
                  className="flex-grow bg-slate-800 text-white px-3 py-2 rounded-xl border border-slate-700 font-semibold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Ayudante</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {helpers.map((hlp) => (
                  <div
                    key={hlp}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-2"
                  >
                    <span className="font-extrabold text-sm text-indigo-300">👷 {hlp}</span>
                    {helpers.length > 1 && (
                      <button
                        onClick={() => deleteHelper(hlp)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: RESET & CLEAR TO ZERO */}
        {activeTab === 'reset' && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-grow text-xs">
            {resetSuccessMessage && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Poner todo en CERO */}
              <div className="bg-slate-950/80 border border-rose-500/30 rounded-3xl p-4 flex flex-col justify-between space-y-4 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Poner Todo en Cero</h3>
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                        Modo Operación Real
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Elimina todos los pedidos de prueba actuales ({orders.length} pedidos) y reinicia los contadores de unidades y horas extras a 0 para que puedas empezar tu jornada real.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Tus destinos, productos, colores de Aluzinc, calibres, choferes y ayudantes se mantendrán intactos.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    clearAllToZero({ resetRoutes: true });
                    setResetSuccessMessage(
                      '¡Sistema puesto en CERO con éxito! Listo para despachos reales.'
                    );
                    setTimeout(() => setResetSuccessMessage(null), 3000);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpiar y Poner a CERO</span>
                </button>
              </div>

              {/* Option 2: Cargar Datos de Prueba (Demo) */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between space-y-4 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Cargar Datos de Demostración</h3>
                      <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                        Modo Ejemplo / Pruebas
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Restaura un conjunto de órdenes de ejemplo con colores de Aluzinc, fechas de despacho y horas extras para practicar el uso del tablero.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setResetSuccessMessage('¡Datos de demostración cargados exitosamente!');
                    setTimeout(() => setResetSuccessMessage(null), 3000);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl transition border border-slate-700 flex items-center justify-center gap-2 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Cargar Datos Demo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition"
          >
            Guardar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
