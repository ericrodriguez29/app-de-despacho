import React, { useState } from 'react';
import {
  Boxes,
  Truck,
  Clock,
  CheckCircle2,
  PackageOpen,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/dispatch';
import { useDispatch } from '../context/DispatchContext';
import { OrderCard } from './OrderCard';

interface KanbanBoardProps {
  onOpenDetails: (order: Order) => void;
  onOpenConfirmation: (order: Order) => void;
  onOpenHistory: (order: Order) => void;
  onOpenNewOrder?: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onOpenDetails,
  onOpenConfirmation,
  onOpenHistory,
  onOpenNewOrder,
}) => {
  const { filteredOrders, orders, advanceOrderStatus } = useDispatch();
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Group orders by columns
  const colPending = filteredOrders.filter(
    (o) => o.status === 'por_despachar' || o.status === 'en_preparacion'
  );
  const colInTransit = filteredOrders.filter((o) => o.status === 'en_ruta');
  const colInUnload = filteredOrders.filter((o) => o.status === 'en_descarga');
  const colDelivered = filteredOrders.filter((o) => o.status === 'entregado');

  // Sum units per column
  const pendingUnits = colPending.reduce((acc, o) => acc + o.unitsCount, 0);
  const inTransitUnits = colInTransit.reduce((acc, o) => acc + o.unitsCount, 0);
  const inUnloadUnits = colInUnload.reduce((acc, o) => acc + o.unitsCount, 0);
  const deliveredUnits = colDelivered.reduce((acc, o) => acc + (o.unitsDelivered ?? o.unitsCount), 0);

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: OrderStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (!orderId) return;

    if (targetStatus === 'entregado') {
      const order = filteredOrders.find((o) => o.id === orderId);
      if (order) {
        onOpenConfirmation(order);
        return;
      }
    }

    advanceOrderStatus(orderId, targetStatus, {
      notes: `Movido vía tablero Kanban a ${targetStatus}.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Zero State / Clean Slate Helper Banner */}
      {orders.length === 0 && (
        <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-black shrink-0 border border-sky-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>Tablero en CERO</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider">
                  Listo para Operación Real
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                No tienes órdenes activas pendientes. Registra tu primer envío real con el conteo exacto de unidades y chofer asignado.
              </p>
            </div>
          </div>
          {onOpenNewOrder && (
            <button
              onClick={onOpenNewOrder}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black rounded-xl text-xs transition shadow-lg shadow-sky-500/25 flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Pedido</span>
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        {/* 1. POR DESPACHAR */}
      <div
        onDragOver={(e) => handleDragOver(e, 'por_despachar')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'por_despachar')}
        className={`bg-slate-900/90 rounded-3xl border transition-all p-4 flex flex-col shadow-xl min-h-[500px] ${
          dragOverCol === 'por_despachar'
            ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/40'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
            <h2 className="font-black text-xs uppercase tracking-wider text-slate-200">
              1. Por Despachar
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30">
              {pendingUnits} uds
            </span>
            <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {colPending.length}
            </span>
          </div>
        </div>

        <div className="flex-grow space-y-3">
          {colPending.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
              <PackageOpen className="w-8 h-8 mb-2 opacity-40" />
              <span className="text-xs font-medium">No hay pedidos pendientes en almacén</span>
            </div>
          ) : (
            colPending.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpenDetails={onOpenDetails}
                onOpenConfirmation={onOpenConfirmation}
                onOpenHistory={onOpenHistory}
              />
            ))
          )}
        </div>
      </div>

      {/* 2. EN RUTA */}
      <div
        onDragOver={(e) => handleDragOver(e, 'en_ruta')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'en_ruta')}
        className={`bg-slate-900/90 rounded-3xl border transition-all p-4 flex flex-col shadow-xl min-h-[500px] ${
          dragOverCol === 'en_ruta'
            ? 'border-sky-400 bg-sky-500/10 ring-2 ring-sky-400/40'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50 animate-pulse" />
            <h2 className="font-black text-xs uppercase tracking-wider text-slate-200">
              2. En Ruta (Transporte)
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-lg border border-sky-500/30">
              {inTransitUnits} uds
            </span>
            <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {colInTransit.length}
            </span>
          </div>
        </div>

        <div className="flex-grow space-y-3">
          {colInTransit.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
              <Truck className="w-8 h-8 mb-2 opacity-40" />
              <span className="text-xs font-medium">No hay pedidos en trayecto ahora</span>
            </div>
          ) : (
            colInTransit.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpenDetails={onOpenDetails}
                onOpenConfirmation={onOpenConfirmation}
                onOpenHistory={onOpenHistory}
              />
            ))
          )}
        </div>
      </div>

      {/* 3. EN DESCARGA */}
      <div
        onDragOver={(e) => handleDragOver(e, 'en_descarga')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'en_descarga')}
        className={`bg-slate-900/90 rounded-3xl border transition-all p-4 flex flex-col shadow-xl min-h-[500px] ${
          dragOverCol === 'en_descarga'
            ? 'border-indigo-400 bg-indigo-500/10 ring-2 ring-indigo-400/40'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50 animate-ping" />
            <h2 className="font-black text-xs uppercase tracking-wider text-slate-200">
              3. En Descarga (Recepción)
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-lg border border-indigo-500/30">
              {inUnloadUnits} uds
            </span>
            <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {colInUnload.length}
            </span>
          </div>
        </div>

        <div className="flex-grow space-y-3">
          {colInUnload.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
              <Clock className="w-8 h-8 mb-2 opacity-40" />
              <span className="text-xs font-medium">Ningún chofer descargando en rampa</span>
            </div>
          ) : (
            colInUnload.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpenDetails={onOpenDetails}
                onOpenConfirmation={onOpenConfirmation}
                onOpenHistory={onOpenHistory}
              />
            ))
          )}
        </div>
      </div>

      {/* 4. ENTREGADOS */}
      <div
        onDragOver={(e) => handleDragOver(e, 'entregado')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'entregado')}
        className={`bg-slate-900/90 rounded-3xl border transition-all p-4 flex flex-col shadow-xl min-h-[500px] ${
          dragOverCol === 'entregado'
            ? 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-400/40'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <h2 className="font-black text-xs uppercase tracking-wider text-slate-200">
              4. Entregados Conformes
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              {deliveredUnits} uds
            </span>
            <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {colDelivered.length}
            </span>
          </div>
        </div>

        <div className="flex-grow space-y-3">
          {colDelivered.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
              <span className="text-xs font-medium">Aún no se han registrado entregas hoy</span>
            </div>
          ) : (
            colDelivered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpenDetails={onOpenDetails}
                onOpenConfirmation={onOpenConfirmation}
                onOpenHistory={onOpenHistory}
              />
            ))
          )}
        </div>
      </div>
    </div>
  </div>
  );
};
