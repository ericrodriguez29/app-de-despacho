import React, { useState } from 'react';
import {
  DispatchProvider,
  useDispatch,
} from './context/DispatchContext';
import { Header } from './components/Header';
import { KPIBanner } from './components/KPIBanner';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { QuickUnloadMode } from './components/QuickUnloadMode';
import { NewOrderModal } from './components/NewOrderModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { DeliveryConfirmationModal } from './components/DeliveryConfirmationModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { RouteManagerModal } from './components/RouteManagerModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { CatalogSettingsModal } from './components/CatalogSettingsModal';
import { ClearZeroModal } from './components/ClearZeroModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Order } from './types/dispatch';
import { Truck, RotateCcw, Settings2, Sparkles } from 'lucide-react';

function DispatchAppContent() {
  const {
    quickDriverMode,
    setQuickDriverMode,
    resetAllData,
  } = useDispatch();

  // Modal States
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isRoutesManagerOpen, setIsRoutesManagerOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCatalogSettingsOpen, setIsCatalogSettingsOpen] = useState(false);
  const [isClearZeroOpen, setIsClearZeroOpen] = useState(false);

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedOrderHistory, setSelectedOrderHistory] = useState<Order | null>(null);
  const [selectedOrderConfirmation, setSelectedOrderConfirmation] = useState<Order | null>(null);

  const handleOpenHistory = (order: Order) => {
    setSelectedOrderHistory(order);
  };

  const handleOpenConfirmation = (order: Order) => {
    setSelectedOrderConfirmation(order);
  };

  const handleOpenDetails = (order: Order) => {
    setSelectedOrderDetails(order);
  };

  const handleSelectFromScanner = (order: Order) => {
    setSelectedOrderDetails(order);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Application Navigation */}
      <Header
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenRoutesManager={() => setIsRoutesManagerOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCatalogSettings={() => setIsCatalogSettingsOpen(true)}
        onOpenClearZero={() => setIsClearZeroOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-3.5 sm:p-6 space-y-6">
        {quickDriverMode ? (
          /* QUICK UNLOAD / DRIVER TOUCH MODE */
          <QuickUnloadMode
            onOpenConfirmation={handleOpenConfirmation}
            onOpenHistory={handleOpenHistory}
            onExitMode={() => setQuickDriverMode(false)}
          />
        ) : (
          /* STANDARD DISPATCH LOGISTICS CONTROL BOARD */
          <>
            {/* KPI Metrics Banner */}
            <KPIBanner />

            {/* Filter and Search Bar */}
            <FilterBar />

            {/* 4-Column Drag & Drop Kanban Board */}
            <KanbanBoard
              onOpenDetails={handleOpenDetails}
              onOpenConfirmation={handleOpenConfirmation}
              onOpenHistory={handleOpenHistory}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
            />
          </>
        )}
      </main>

      {/* Floating Offline Sync Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOpenCatalogSettings={() => setIsCatalogSettingsOpen(true)}
      />

      <RouteManagerModal
        isOpen={isRoutesManagerOpen}
        onClose={() => setIsRoutesManagerOpen(false)}
      />

      <CatalogSettingsModal
        isOpen={isCatalogSettingsOpen}
        onClose={() => setIsCatalogSettingsOpen(false)}
      />

      <ClearZeroModal
        isOpen={isClearZeroOpen}
        onClose={() => setIsClearZeroOpen(false)}
        onOpenNewOrder={() => {
          setIsClearZeroOpen(false);
          setIsNewOrderOpen(true);
        }}
      />

      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectOrder={handleSelectFromScanner}
      />

      <OrderDetailsModal
        order={selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        onOpenHistory={handleOpenHistory}
        onOpenConfirmation={handleOpenConfirmation}
      />

      <OrderHistoryModal
        order={selectedOrderHistory}
        onClose={() => setSelectedOrderHistory(null)}
      />

      <DeliveryConfirmationModal
        order={selectedOrderConfirmation}
        onClose={() => setSelectedOrderConfirmation(null)}
      />

      {/* Application Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800/80 py-4 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-400">
              Dispatch Logistics Pro PWA &bull; Conteo de Unidades &bull; Techos & Aceros &bull; Control de Rutas
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-3 sm:gap-4">
            <button
              onClick={() => setIsClearZeroOpen(true)}
              className="text-rose-400 hover:text-rose-300 transition flex items-center gap-1 font-bold"
              title="Poner todo en cero para iniciar la jornada real"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Poner Todo en CERO</span>
            </button>
            <button
              onClick={() => setIsCatalogSettingsOpen(true)}
              className="text-sky-400 hover:text-sky-300 transition flex items-center gap-1 font-semibold"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Editar Destinos & Catálogo</span>
            </button>
            <button
              onClick={resetAllData}
              className="text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
              title="Restaurar datos de demostración"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Cargar Demo</span>
            </button>
            <span>&copy; {new Date().getFullYear()} Plataforma Logística</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DispatchProvider>
      <DispatchAppContent />
    </DispatchProvider>
  );
}
