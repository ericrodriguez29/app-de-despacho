import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Order,
  OrderItem,
  OrderStatus,
  Priority,
  RouteRecord,
  DriverPerformance,
  StatusHistoryEntry,
  DestinationZone,
  ProductPresentation,
  OvertimeLog,
} from '../types/dispatch';
import {
  INITIAL_ORDERS,
  INITIAL_ROUTES,
  INITIAL_DESTINATIONS,
  INITIAL_PRODUCT_PRESENTATIONS,
  INITIAL_CALIBRES,
  INITIAL_DRIVERS,
  INITIAL_HELPERS,
  INITIAL_ALUZINC_COLORS,
  INITIAL_OVERTIME_LOGS,
  calculateOvertimeMinutes,
  formatOvertimeDuration,
} from '../data/initialData';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface AdvanceStatusOptions {
  notes?: string;
  updatedBy?: string;
  location?: string;
  unitsVerified?: number;
  itemsDelivered?: OrderItem[];
  delayReason?: string;
  driverOvertimeMinutes?: number;
  helperOvertimeMinutes?: number;
}

interface DispatchContextType {
  orders: Order[];
  routes: RouteRecord[];
  destinations: DestinationZone[];
  productPresentations: ProductPresentation[];
  calibres: string[];
  aluzincColors: string[];
  drivers: string[];
  helpers: string[];
  overtimeLogs: OvertimeLog[];
  regularShiftEndTime: string;
  setRegularShiftEndTime: (time: string) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedZone: string;
  setSelectedZone: (z: string) => void;
  selectedPriority: string;
  setSelectedPriority: (p: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedDriver: string;
  setSelectedDriver: (d: string) => void;
  selectedDispatchDate: string;
  setSelectedDispatchDate: (date: string) => void;
  quickDriverMode: boolean;
  setQuickDriverMode: (val: boolean) => void;
  activeDriverFilter: string;
  setActiveDriverFilter: (driver: string) => void;

  // Order Actions
  addOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'dispatchedAt' | 'arrivedAt' | 'deliveredAt' | 'history'>) => Order;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  advanceOrderStatus: (orderId: string, targetStatus: OrderStatus, options?: AdvanceStatusOptions) => void;
  quickVerifyUnits: (orderId: string, count: number) => void;
  quickVerifyItemUnits: (orderId: string, itemId: string, count: number) => void;

  // Route & Overtime Actions
  updateRouteDeparture: (routeId: string, actualTime?: string) => void;
  updateRouteArrival: (routeId: string, actualTime?: string) => void;
  updateRouteStatus: (routeId: string, status: RouteRecord['status'], notes?: string) => void;
  updateRouteOvertime: (routeId: string, driverOvertimeMinutes: number, helperOvertimeMinutes: number, notes?: string) => void;
  addRoute: (route: Omit<RouteRecord, 'id' | 'completedStops' | 'deliveredUnits' | 'actualDeparture' | 'actualArrival'>) => void;
  updateRoute: (route: RouteRecord) => void;
  deleteRoute: (id: string) => void;

  addOvertimeLog: (log: Omit<OvertimeLog, 'id'>) => void;
  updateOvertimeLog: (log: OvertimeLog) => void;
  deleteOvertimeLog: (id: string) => void;

  // Catalog / Settings Actions
  addDestination: (dest: Omit<DestinationZone, 'id'>) => void;
  updateDestination: (dest: DestinationZone) => void;
  deleteDestination: (id: string) => void;

  addProductPresentation: (prod: Omit<ProductPresentation, 'id'>) => void;
  updateProductPresentation: (prod: ProductPresentation) => void;
  deleteProductPresentation: (id: string) => void;

  addCalibre: (calibre: string) => void;
  deleteCalibre: (calibre: string) => void;

  addAluzincColor: (color: string) => void;
  deleteAluzincColor: (color: string) => void;

  addDriver: (driver: string) => void;
  deleteDriver: (driver: string) => void;

  addHelper: (helper: string) => void;
  deleteHelper: (helper: string) => void;

  resetAllData: () => void;
  clearAllToZero: (options?: { resetRoutes?: boolean }) => void;

  // Computed
  driverPerformances: DriverPerformance[];
  kpis: {
    totalOrders: number;
    pendingCount: number;
    inTransitCount: number;
    inUnloadCount: number;
    deliveredCount: number;
    totalUnitsPending: number;
    totalUnitsInTransit: number;
    totalUnitsDelivered: number;
    efficiencyRate: number;
    avgUnloadMinutes: number;
    totalDriverOvertimeMinutes: number;
    totalHelperOvertimeMinutes: number;
  };
  filteredOrders: Order[];

  // Push & System
  isOnline: boolean;
  offlineQueueCount: number;
  notifications: ReturnType<typeof usePushNotifications>['notifications'];
  unreadNotifsCount: number;
  requestPushPermission: () => Promise<string>;
  pushPermission: NotificationPermission;
  markNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  triggerManualPushTest: () => void;
}

const DispatchContext = createContext<DispatchContextType | null>(null);

export const DispatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();
  const {
    permission: pushPermission,
    notifications,
    unreadCount: unreadNotifsCount,
    requestPermission: requestPushPermission,
    sendNotification,
    markAllAsRead: markNotificationsAsRead,
    clearNotifications: clearAllNotifications,
    triggerHaptic,
  } = usePushNotifications();

  // Load state from localStorage or initial dataset (v6 includes updated Aluzinc colors)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dispatch_orders_v6');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ORDERS;
      }
    }
    return INITIAL_ORDERS;
  });

  const [routes, setRoutes] = useState<RouteRecord[]>(() => {
    const saved = localStorage.getItem('dispatch_routes_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ROUTES;
      }
    }
    return INITIAL_ROUTES;
  });

  const [destinations, setDestinations] = useState<DestinationZone[]>(() => {
    const saved = localStorage.getItem('dispatch_destinations_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DESTINATIONS;
      }
    }
    return INITIAL_DESTINATIONS;
  });

  const [productPresentations, setProductPresentations] = useState<ProductPresentation[]>(() => {
    const saved = localStorage.getItem('dispatch_products_v6');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PRODUCT_PRESENTATIONS;
      }
    }
    return INITIAL_PRODUCT_PRESENTATIONS;
  });

  const [calibres, setCalibres] = useState<string[]>(() => {
    const saved = localStorage.getItem('dispatch_calibres_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CALIBRES;
      }
    }
    return INITIAL_CALIBRES;
  });

  const [aluzincColors, setAluzincColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('dispatch_aluzinc_colors_v6');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ALUZINC_COLORS;
      }
    }
    return INITIAL_ALUZINC_COLORS;
  });

  const [drivers, setDrivers] = useState<string[]>(() => {
    const saved = localStorage.getItem('dispatch_drivers_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DRIVERS;
      }
    }
    return INITIAL_DRIVERS;
  });

  const [helpers, setHelpers] = useState<string[]>(() => {
    const saved = localStorage.getItem('dispatch_helpers_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_HELPERS;
      }
    }
    return INITIAL_HELPERS;
  });

  const [overtimeLogs, setOvertimeLogs] = useState<OvertimeLog[]>(() => {
    const saved = localStorage.getItem('dispatch_overtime_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_OVERTIME_LOGS;
      }
    }
    return INITIAL_OVERTIME_LOGS;
  });

  const [regularShiftEndTime, setRegularShiftEndTime] = useState<string>(() => {
    return localStorage.getItem('dispatch_shift_end_v5') || '17:00';
  });

  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDriver, setSelectedDriver] = useState('ALL');
  const [selectedDispatchDate, setSelectedDispatchDate] = useState('ALL');

  // Quick Unload Driver Mode - default to Carlos
  const [quickDriverMode, setQuickDriverMode] = useState(false);
  const [activeDriverFilter, setActiveDriverFilter] = useState('Carlos');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('dispatch_orders_v6', JSON.stringify(orders));
    if (!isOnline) {
      setOfflineQueueCount((prev) => prev + 1);
    } else {
      setOfflineQueueCount(0);
    }
  }, [orders, isOnline]);

  useEffect(() => {
    localStorage.setItem('dispatch_routes_v5', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('dispatch_destinations_v5', JSON.stringify(destinations));
  }, [destinations]);

  useEffect(() => {
    localStorage.setItem('dispatch_products_v6', JSON.stringify(productPresentations));
  }, [productPresentations]);

  useEffect(() => {
    localStorage.setItem('dispatch_calibres_v5', JSON.stringify(calibres));
  }, [calibres]);

  useEffect(() => {
    localStorage.setItem('dispatch_aluzinc_colors_v6', JSON.stringify(aluzincColors));
  }, [aluzincColors]);

  useEffect(() => {
    localStorage.setItem('dispatch_drivers_v5', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('dispatch_helpers_v5', JSON.stringify(helpers));
  }, [helpers]);

  useEffect(() => {
    localStorage.setItem('dispatch_overtime_v5', JSON.stringify(overtimeLogs));
  }, [overtimeLogs]);

  useEffect(() => {
    localStorage.setItem('dispatch_shift_end_v5', regularShiftEndTime);
  }, [regularShiftEndTime]);

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'por_despachar':
        return 'Por Despachar (Almacén)';
      case 'en_preparacion':
        return 'En Preparación y Conteo';
      case 'en_ruta':
        return 'En Ruta de Transporte';
      case 'en_descarga':
        return 'En Destino (Descargando Unidades)';
      case 'entregado':
        return 'Entregado y Conforme';
      case 'novedad':
        return 'Novedad / Incidencia';
      case 'devuelto':
        return 'Devuelto a Almacén';
      default:
        return status;
    }
  };

  const calculateMinutesBetween = (date1Str?: string | null, date2Str?: string | null): number => {
    if (!date1Str || !date2Str) return 0;
    try {
      const d1 = new Date(date1Str).getTime();
      const d2 = new Date(date2Str).getTime();
      if (isNaN(d1) || isNaN(d2)) return 0;
      return Math.max(0, Math.round((d2 - d1) / (1000 * 60)));
    } catch {
      return 0;
    }
  };

  // Advance Order Status with full timeline entry
  const advanceOrderStatus = useCallback(
    (orderId: string, targetStatus: OrderStatus, options?: AdvanceStatusOptions) => {
      const now = new Date();
      const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;
      const timeOnlyStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const nowStr = `${todayDateStr} ${timeOnlyStr}`;

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== orderId) return order;

          const lastHistory = order.history[order.history.length - 1];
          const duration = lastHistory
            ? calculateMinutesBetween(lastHistory.timestamp, nowStr)
            : 0;

          const verifiedTotal = options?.unitsVerified ?? order.unitsDelivered ?? order.unitsCount;

          const newHistoryEntry: StatusHistoryEntry = {
            id: `h-${order.id}-${Date.now()}`,
            status: targetStatus,
            statusLabel: getStatusLabel(targetStatus),
            timestamp: nowStr,
            updatedBy:
              options?.updatedBy ||
              (order.helper && order.helper !== 'Sin Ayudante'
                ? `${order.driver} (Chofer) & ${order.helper} (Ayudante)`
                : order.driver || 'Chofer Responsable'),
            notes:
              options?.notes ||
              (targetStatus === 'entregado'
                ? 'Descarga completada y verificada conforme.'
                : 'Actualización de estado en sistema.'),
            location:
              options?.location ||
              (targetStatus === 'en_ruta'
                ? 'En trayecto hacia destino'
                : targetStatus === 'en_descarga'
                ? order.zone
                : 'Almacén'),
            unitsVerified: verifiedTotal,
            durationFromPrevMinutes: duration,
          };

          let dispatchedAt = order.dispatchedAt;
          let arrivedAt = order.arrivedAt;
          let deliveredAt = order.deliveredAt;
          let departureTime = order.departureTime;
          let arrivalTime = order.arrivalTime;
          let unloadingDurationMinutes = order.unloadingDurationMinutes;
          let driverOvertimeMinutes = options?.driverOvertimeMinutes ?? order.driverOvertimeMinutes;
          let helperOvertimeMinutes = options?.helperOvertimeMinutes ?? order.helperOvertimeMinutes;

          if (targetStatus === 'en_ruta' && !dispatchedAt) {
            dispatchedAt = nowStr;
            if (!departureTime) departureTime = timeOnlyStr;
          } else if (targetStatus === 'en_descarga') {
            arrivedAt = nowStr;
          } else if (targetStatus === 'entregado') {
            deliveredAt = nowStr;
            if (!arrivalTime) arrivalTime = timeOnlyStr;
            if (arrivedAt) {
              unloadingDurationMinutes = calculateMinutesBetween(arrivedAt, nowStr);
            } else if (dispatchedAt) {
              unloadingDurationMinutes = 20;
            }
            // If overtime wasn't explicitly set, calculate from arrivalTime vs regularShiftEndTime
            if (driverOvertimeMinutes === undefined && arrivalTime) {
              const autoOt = calculateOvertimeMinutes(arrivalTime, regularShiftEndTime);
              if (autoOt > 0) {
                driverOvertimeMinutes = autoOt;
                helperOvertimeMinutes =
                  order.helper && order.helper !== 'Sin Ayudante' ? autoOt : 0;
              }
            }
          }

          // Update items delivered counts if provided or if delivered
          const updatedItems =
            options?.itemsDelivered ||
            order.items.map((it) => ({
              ...it,
              unitsDelivered:
                targetStatus === 'entregado'
                  ? it.unitsDelivered ?? it.unitsCount
                  : it.unitsDelivered,
            }));

          const updatedOrder: Order = {
            ...order,
            status: targetStatus,
            dispatchedAt,
            arrivedAt,
            deliveredAt,
            departureTime,
            arrivalTime,
            driverOvertimeMinutes,
            helperOvertimeMinutes,
            items: updatedItems,
            unitsDelivered: targetStatus === 'entregado' ? verifiedTotal : order.unitsDelivered,
            delayReason: options?.delayReason ?? order.delayReason,
            unloadingDurationMinutes,
            history: [...order.history, newHistoryEntry],
          };

          return updatedOrder;
        })
      );

      // Trigger Push Notification & Audio
      const targetOrder = orders.find((o) => o.id === orderId);
      const clientName = targetOrder ? targetOrder.client : 'Cliente';
      const units = options?.unitsVerified || targetOrder?.unitsCount || 1;
      const zone = targetOrder ? targetOrder.zone : 'Destino';

      if (targetStatus === 'entregado') {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#0284c7', '#10b981', '#6366f1', '#f59e0b'],
        });
        sendNotification(
          `✅ Entrega Exitosa: ${orderId}`,
          `Entregadas ${units} unidades en ${zone} (${clientName}) conforme.`,
          'success',
          { orderId }
        );
      } else if (targetStatus === 'en_descarga') {
        sendNotification(
          `⏱️ En Descarga: ${orderId}`,
          `Chofer en rampa de ${zone}. Verificando ${units} unidades de mercancía.`,
          'info',
          { orderId }
        );
      } else if (targetStatus === 'en_ruta') {
        sendNotification(
          `🚚 En Tránsito: ${orderId}`,
          `Despachado hacia ${zone} (${units} unidades a bordo).`,
          'info',
          { orderId }
        );
      } else if (targetStatus === 'novedad') {
        sendNotification(
          `⚠️ Novedad en Pedido: ${orderId}`,
          `Incidencia reportada en ${zone}: ${options?.notes || 'Revisar detalles'}`,
          'alert',
          { orderId }
        );
      }
    },
    [orders, regularShiftEndTime, sendNotification]
  );

  const quickVerifyUnits = useCallback((orderId: string, count: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, unitsDelivered: Math.max(0, count) } : o))
    );
  }, []);

  const quickVerifyItemUnits = useCallback((orderId: string, itemId: string, count: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newItems = o.items.map((it) =>
          it.id === itemId ? { ...it, unitsDelivered: Math.max(0, count) } : it
        );
        const sumDelivered = newItems.reduce((acc, it) => acc + (it.unitsDelivered ?? it.unitsCount), 0);
        return {
          ...o,
          items: newItems,
          unitsDelivered: sumDelivered,
        };
      })
    );
  }, []);

  // Route Time Trackers
  const updateRouteDeparture = useCallback(
    (routeId: string, customTime?: string) => {
      const timeStr =
        customTime ||
        new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                actualDeparture: timeStr,
                status: 'en_ruta',
              }
            : r
        )
      );

      const route = routes.find((r) => r.id === routeId);
      if (route) {
        sendNotification(
          `🚦 Hora de Salida Registrada: ${route.name}`,
          `${route.driver} inició ruta a las ${timeStr} (${route.totalUnits} unidades a bordo).`,
          'info',
          { routeId }
        );
      }
    },
    [routes, sendNotification]
  );

  const updateRouteArrival = useCallback(
    (routeId: string, customTime?: string) => {
      const timeStr =
        customTime ||
        new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

      const targetRoute = routes.find((r) => r.id === routeId);
      const shiftEnd = targetRoute?.shiftEndTime || regularShiftEndTime || '17:00';
      const autoOtMins = calculateOvertimeMinutes(timeStr, shiftEnd);

      setRoutes((prev) =>
        prev.map((r) => {
          if (r.id !== routeId) return r;
          const hasHelper = r.helper && r.helper !== 'Sin Ayudante';
          return {
            ...r,
            actualArrival: timeStr,
            driverOvertimeMinutes: autoOtMins > 0 ? autoOtMins : r.driverOvertimeMinutes || 0,
            helperOvertimeMinutes:
              autoOtMins > 0 && hasHelper ? autoOtMins : r.helperOvertimeMinutes || 0,
            status: 'completada',
          };
        })
      );

      if (targetRoute) {
        if (autoOtMins > 0) {
          const todayStr =
            targetRoute.dispatchDate ||
            new Date().toISOString().split('T')[0];
          const hasHelper = targetRoute.helper && targetRoute.helper !== 'Sin Ayudante';
          const newLog: OvertimeLog = {
            id: `ot-${Date.now()}`,
            date: todayStr,
            routeId: targetRoute.id,
            zone: targetRoute.zone,
            driver: targetRoute.driver,
            helper: targetRoute.helper || 'Sin Ayudante',
            departureTime: targetRoute.actualDeparture || targetRoute.scheduledDeparture,
            arrivalTime: timeStr,
            regularEndTime: shiftEnd,
            driverOvertimeMinutes: autoOtMins,
            helperOvertimeMinutes: hasHelper ? autoOtMins : 0,
            notes: `Calculado automáticamente al registrar hora de llegada (${timeStr} vs turno ${shiftEnd}).`,
          };
          setOvertimeLogs((prev) => [newLog, ...prev]);
        }

        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
        sendNotification(
          `🏁 Hora de Llegada Registrada: ${targetRoute.name}`,
          `${targetRoute.driver} reportó llegada a las ${timeStr}.${
            autoOtMins > 0
              ? ` Tiempo extra registrado: ${formatOvertimeDuration(autoOtMins)}.`
              : ''
          }`,
          'success',
          { routeId }
        );
      }
    },
    [routes, regularShiftEndTime, sendNotification]
  );

  const updateRouteStatus = useCallback(
    (routeId: string, status: RouteRecord['status'], notes?: string) => {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                status,
                notes: notes || r.notes,
              }
            : r
        )
      );
    },
    []
  );

  const updateRouteOvertime = useCallback(
    (routeId: string, driverOvertimeMinutes: number, helperOvertimeMinutes: number, notes?: string) => {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                driverOvertimeMinutes: Math.max(0, driverOvertimeMinutes),
                helperOvertimeMinutes: Math.max(0, helperOvertimeMinutes),
                overtimeNotes: notes ?? r.overtimeNotes,
              }
            : r
        )
      );
    },
    []
  );

  const addRoute = useCallback(
    (newR: Omit<RouteRecord, 'id' | 'completedStops' | 'deliveredUnits' | 'actualDeparture' | 'actualArrival'>) => {
      const newId = `RUT-${String(routes.length + 1).padStart(2, '0')}`;
      const record: RouteRecord = {
        ...newR,
        id: newId,
        completedStops: 0,
        deliveredUnits: 0,
        actualDeparture: null,
        actualArrival: null,
      };
      setRoutes((prev) => [record, ...prev]);
      sendNotification('📋 Nueva Ruta Creada', `Ruta ${record.name} asignada a ${record.driver}.`, 'info');
    },
    [routes, sendNotification]
  );

  const updateRoute = useCallback((updated: RouteRecord) => {
    setRoutes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  const deleteRoute = useCallback((id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Overtime Log CRUD
  const addOvertimeLog = useCallback(
    (logData: Omit<OvertimeLog, 'id'>) => {
      const newLog: OvertimeLog = {
        ...logData,
        id: `ot-${Date.now()}`,
      };
      setOvertimeLogs((prev) => [newLog, ...prev]);
      sendNotification(
        '⏱️ Hora Extra Registrada',
        `Chofer ${logData.driver} (${formatOvertimeDuration(logData.driverOvertimeMinutes)}) y Ayudante ${logData.helper} (${formatOvertimeDuration(logData.helperOvertimeMinutes)}).`,
        'info'
      );
    },
    [sendNotification]
  );

  const updateOvertimeLog = useCallback((updated: OvertimeLog) => {
    setOvertimeLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  const deleteOvertimeLog = useCallback((id: string) => {
    setOvertimeLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Catalog CRUD
  const addDestination = useCallback((dest: Omit<DestinationZone, 'id'>) => {
    const newId = `dest-${Date.now()}`;
    setDestinations((prev) => [...prev, { ...dest, id: newId }]);
  }, []);

  const updateDestination = useCallback((dest: DestinationZone) => {
    setDestinations((prev) => prev.map((d) => (d.id === dest.id ? dest : d)));
  }, []);

  const deleteDestination = useCallback((id: string) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addProductPresentation = useCallback((prod: Omit<ProductPresentation, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    setProductPresentations((prev) => [...prev, { ...prod, id: newId }]);
  }, []);

  const updateProductPresentation = useCallback((prod: ProductPresentation) => {
    setProductPresentations((prev) => prev.map((p) => (p.id === prod.id ? prod : p)));
  }, []);

  const deleteProductPresentation = useCallback((id: string) => {
    setProductPresentations((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addCalibre = useCallback((cal: string) => {
    if (!cal.trim()) return;
    setCalibres((prev) => (prev.includes(cal.trim()) ? prev : [...prev, cal.trim()]));
  }, []);

  const deleteCalibre = useCallback((cal: string) => {
    setCalibres((prev) => prev.filter((c) => c !== cal));
  }, []);

  const addAluzincColor = useCallback((color: string) => {
    if (!color.trim()) return;
    setAluzincColors((prev) => (prev.includes(color.trim()) ? prev : [...prev, color.trim()]));
  }, []);

  const deleteAluzincColor = useCallback((color: string) => {
    setAluzincColors((prev) => prev.filter((c) => c !== color));
  }, []);

  const addDriver = useCallback((driverName: string) => {
    if (!driverName.trim()) return;
    setDrivers((prev) => (prev.includes(driverName.trim()) ? prev : [...prev, driverName.trim()]));
  }, []);

  const deleteDriver = useCallback((driverName: string) => {
    setDrivers((prev) => prev.filter((d) => d !== driverName));
  }, []);

  const addHelper = useCallback((helperName: string) => {
    if (!helperName.trim()) return;
    setHelpers((prev) => (prev.includes(helperName.trim()) ? prev : [...prev, helperName.trim()]));
  }, []);

  const deleteHelper = useCallback((helperName: string) => {
    setHelpers((prev) => prev.filter((h) => h !== helperName));
  }, []);

  const addOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'createdAt' | 'dispatchedAt' | 'arrivedAt' | 'deliveredAt' | 'history'>) => {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')}`;
      const nowStr = `${todayStr} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const newId = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculate total units from items
      const calculatedUnitsCount =
        orderData.items && orderData.items.length > 0
          ? orderData.items.reduce((acc, it) => acc + (it.unitsCount || 0), 0)
          : orderData.unitsCount || 1;

      // Summary description of items including Aluzinc color
      const itemsSummary =
        orderData.itemsDescription ||
        orderData.items
          .map((it) => {
            const colorPart =
              it.color && it.color !== 'No aplica' ? ` [${it.color}]` : '';
            const calPart = it.calibre ? ` (${it.calibre})` : '';
            return `${it.unitsCount} ${it.productType}${colorPart}${calPart}`;
          })
          .join(', ');

      const dispatchDateVal = orderData.dispatchDate || todayStr;

      const newOrder: Order = {
        ...orderData,
        id: newId,
        dispatchDate: dispatchDateVal,
        createdAt: nowStr,
        dispatchedAt: null,
        arrivedAt: null,
        deliveredAt: null,
        unitsCount: calculatedUnitsCount,
        unitsDelivered: calculatedUnitsCount,
        itemsDescription: itemsSummary,
        history: [
          {
            id: `h-${newId}-1`,
            status: 'por_despachar',
            statusLabel: 'Pedido Creado en Almacén',
            timestamp: nowStr,
            updatedBy: 'Control de Despacho',
            notes: `Orden programada para despacho el ${dispatchDateVal} con ${calculatedUnitsCount} unidades [${itemsSummary}] hacia ${orderData.zone}. Chofer: ${orderData.driver}${
              orderData.helper && orderData.helper !== 'Sin Ayudante'
                ? ` | Ayudante: ${orderData.helper}`
                : ''
            }.`,
            unitsVerified: calculatedUnitsCount,
          },
        ],
      };

      setOrders((prev) => [newOrder, ...prev]);

      // If overtime minutes were already entered on creation, also log them
      if (
        (orderData.driverOvertimeMinutes && orderData.driverOvertimeMinutes > 0) ||
        (orderData.helperOvertimeMinutes && orderData.helperOvertimeMinutes > 0)
      ) {
        const otEntry: OvertimeLog = {
          id: `ot-${Date.now()}`,
          date: dispatchDateVal,
          orderId: newId,
          routeId: orderData.routeId,
          zone: orderData.zone,
          driver: orderData.driver,
          helper: orderData.helper || 'Sin Ayudante',
          departureTime: orderData.departureTime || '08:00',
          arrivalTime: orderData.arrivalTime || '18:00',
          regularEndTime: regularShiftEndTime,
          driverOvertimeMinutes: orderData.driverOvertimeMinutes || 0,
          helperOvertimeMinutes: orderData.helperOvertimeMinutes || 0,
          notes: orderData.overtimeNotes || `Horas extras registradas en el pedido ${newId}.`,
        };
        setOvertimeLogs((prev) => [otEntry, ...prev]);
      }

      // Update route units and stops count
      if (orderData.routeId) {
        setRoutes((prevRoutes) =>
          prevRoutes.map((r) =>
            r.id === orderData.routeId
              ? {
                  ...r,
                  targetStops: r.targetStops + 1,
                  totalUnits: r.totalUnits + calculatedUnitsCount,
                }
              : r
          )
        );
      }

      sendNotification(
        `📦 Nuevo Despacho: ${newId}`,
        `Fecha: ${dispatchDateVal} • Destino: ${orderData.zone} - ${calculatedUnitsCount} uds asignadas a ${orderData.driver}.`,
        'info',
        { orderId: newId }
      );

      return newOrder;
    },
    [regularShiftEndTime, sendNotification]
  );

  const updateOrder = useCallback((updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const resetAllData = useCallback(() => {
    setOrders(INITIAL_ORDERS);
    setRoutes(INITIAL_ROUTES);
    setDestinations(INITIAL_DESTINATIONS);
    setProductPresentations(INITIAL_PRODUCT_PRESENTATIONS);
    setCalibres(INITIAL_CALIBRES);
    setAluzincColors(INITIAL_ALUZINC_COLORS);
    setDrivers(INITIAL_DRIVERS);
    setHelpers(INITIAL_HELPERS);
    setOvertimeLogs(INITIAL_OVERTIME_LOGS);
    localStorage.removeItem('dispatch_orders_v6');
    localStorage.removeItem('dispatch_routes_v5');
    localStorage.removeItem('dispatch_destinations_v5');
    localStorage.removeItem('dispatch_products_v6');
    localStorage.removeItem('dispatch_calibres_v5');
    localStorage.removeItem('dispatch_aluzinc_colors_v6');
    localStorage.removeItem('dispatch_drivers_v5');
    localStorage.removeItem('dispatch_helpers_v5');
    localStorage.removeItem('dispatch_overtime_v5');
  }, []);

  const clearAllToZero = useCallback(
    (options?: { resetRoutes?: boolean }) => {
      setOrders([]);
      setOvertimeLogs([]);
      localStorage.setItem('dispatch_orders_v6', JSON.stringify([]));
      localStorage.setItem('dispatch_overtime_v5', JSON.stringify([]));

      if (options?.resetRoutes) {
        const todayStr = new Date().toISOString().split('T')[0];
        setRoutes((prev) =>
          prev.map((r) => ({
            ...r,
            dispatchDate: todayStr,
            targetStops: 0,
            completedStops: 0,
            totalUnits: 0,
            deliveredUnits: 0,
            actualDeparture: null,
            actualArrival: null,
            driverOvertimeMinutes: 0,
            helperOvertimeMinutes: 0,
            overtimeNotes: '',
            status: 'programada' as const,
          }))
        );
      }

      clearAllNotifications();

      sendNotification(
        '🚀 Sistema Inicializado en Cero',
        'Se han limpiado todos los pedidos y contadores de horas extras. Listo para tu operación real.',
        'success'
      );
    },
    [clearAllNotifications, sendNotification]
  );

  const triggerManualPushTest = useCallback(() => {
    sendNotification(
      '🔔 Alerta en Tiempo Real de Prueba',
      '¡Sistema PWA conectado! Las notificaciones de salida, llegada, colores y horas extras están activas.',
      'info'
    );
    triggerHaptic();
  }, [sendNotification, triggerHaptic]);

  // Performance calculations for transportistas & ayudantes
  const driverPerformances = useMemo<DriverPerformance[]>(() => {
    const driversMap = new Map<
      string,
      {
        helperName: string;
        vehicle: string;
        routeId: string;
        totalOrders: number;
        deliveredOrders: number;
        totalUnits: number;
        deliveredUnits: number;
        scheduledDeparture: string;
        actualDeparture: string | null;
        scheduledArrival: string;
        actualArrival: string | null;
        unloadDurations: number[];
        driverOvertimeMinutes: number;
        helperOvertimeMinutes: number;
      }
    >();

    // Initialize all drivers from driver list
    drivers.forEach((d) => {
      const matchRoute = routes.find((r) => r.driver === d);
      driversMap.set(d, {
        helperName: matchRoute?.helper || 'José',
        vehicle: matchRoute ? matchRoute.vehicle : 'Camión Asignado',
        routeId: matchRoute ? matchRoute.id : 'RUT-01',
        totalOrders: 0,
        deliveredOrders: 0,
        totalUnits: 0,
        deliveredUnits: 0,
        scheduledDeparture: matchRoute ? matchRoute.scheduledDeparture : '08:00',
        actualDeparture: matchRoute ? matchRoute.actualDeparture : null,
        scheduledArrival: matchRoute ? matchRoute.scheduledArrival : '17:00',
        actualArrival: matchRoute ? matchRoute.actualArrival : null,
        unloadDurations: [],
        driverOvertimeMinutes: 0,
        helperOvertimeMinutes: 0,
      });
    });

    // Sum overtime from overtimeLogs
    overtimeLogs.forEach((log) => {
      const entry = driversMap.get(log.driver);
      if (entry) {
        entry.driverOvertimeMinutes += log.driverOvertimeMinutes || 0;
        entry.helperOvertimeMinutes += log.helperOvertimeMinutes || 0;
        if (log.helper && log.helper !== 'Sin Ayudante') {
          entry.helperName = log.helper;
        }
      }
    });

    // Populate from orders
    orders.forEach((o) => {
      const entry = driversMap.get(o.driver);
      if (entry) {
        entry.totalOrders++;
        entry.totalUnits += o.unitsCount;
        if (o.helper && o.helper !== 'Sin Ayudante') {
          entry.helperName = o.helper;
        }
        if (o.status === 'entregado') {
          entry.deliveredOrders++;
          entry.deliveredUnits += o.unitsDelivered ?? o.unitsCount;
          if (o.unloadingDurationMinutes) {
            entry.unloadDurations.push(o.unloadingDurationMinutes);
          }
        }
      } else {
        driversMap.set(o.driver, {
          helperName: o.helper || 'Sin Ayudante',
          vehicle: 'Vehículo Asignado',
          routeId: o.routeId || 'RUT-XX',
          totalOrders: 1,
          deliveredOrders: o.status === 'entregado' ? 1 : 0,
          totalUnits: o.unitsCount,
          deliveredUnits: o.status === 'entregado' ? (o.unitsDelivered ?? o.unitsCount) : 0,
          scheduledDeparture: '08:00',
          actualDeparture: o.dispatchedAt ? o.dispatchedAt.slice(11, 16) : null,
          scheduledArrival: '17:00',
          actualArrival: o.deliveredAt ? o.deliveredAt.slice(11, 16) : null,
          unloadDurations: o.unloadingDurationMinutes ? [o.unloadingDurationMinutes] : [],
          driverOvertimeMinutes: o.driverOvertimeMinutes || 0,
          helperOvertimeMinutes: o.helperOvertimeMinutes || 0,
        });
      }
    });

    const parseTimeToMins = (tStr: string | null): number | null => {
      if (!tStr) return null;
      const parts = tStr.split(':');
      if (parts.length < 2) return null;
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const results: DriverPerformance[] = [];
    driversMap.forEach((data, driverName) => {
      const schedDepMins = parseTimeToMins(data.scheduledDeparture) ?? 480;
      const actDepMins = parseTimeToMins(data.actualDeparture);
      const depVariance = actDepMins !== null ? actDepMins - schedDepMins : 0;

      const schedArrMins = parseTimeToMins(data.scheduledArrival) ?? 1020;
      const actArrMins = parseTimeToMins(data.actualArrival);
      const arrVariance = actArrMins !== null ? actArrMins - schedArrMins : 0;

      const avgUnload =
        data.unloadDurations.length > 0
          ? Math.round(
              data.unloadDurations.reduce((a, b) => a + b, 0) / data.unloadDurations.length
            )
          : 20;

      let score = 100;
      if (depVariance > 10) score -= Math.min(25, (depVariance - 10) * 1.5);
      if (arrVariance > 30) score -= Math.min(20, (arrVariance - 30) * 0.5);
      if (data.totalUnits > 0) {
        const unitAccuracy = data.deliveredUnits / data.totalUnits;
        score = score * 0.6 + unitAccuracy * 40;
      }
      if (avgUnload > 35) score -= 10;
      const finalScore = Math.max(10, Math.min(100, Math.round(score)));

      let status: DriverPerformance['status'] = 'En tiempo';
      if (!data.actualDeparture) {
        status = 'Pendiente salida';
      } else if (data.actualArrival) {
        status = 'Completado con éxito';
      } else if (depVariance > 25) {
        status = 'Retraso crítico';
      } else if (depVariance > 10) {
        status = 'Retraso leve';
      }

      results.push({
        driverName,
        helperName: data.helperName,
        vehicle: data.vehicle,
        routeId: data.routeId,
        totalOrders: data.totalOrders,
        deliveredOrders: data.deliveredOrders,
        totalUnits: data.totalUnits,
        deliveredUnits: data.deliveredUnits,
        scheduledDeparture: data.scheduledDeparture,
        actualDeparture: data.actualDeparture,
        scheduledArrival: data.scheduledArrival,
        actualArrival: data.actualArrival,
        departureVarianceMinutes: depVariance,
        arrivalVarianceMinutes: arrVariance,
        avgUnloadMinutes: avgUnload,
        driverOvertimeMinutes: data.driverOvertimeMinutes,
        helperOvertimeMinutes: data.helperOvertimeMinutes,
        efficiencyScore: finalScore,
        status,
      });
    });

    return results.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }, [routes, orders, drivers, overtimeLogs]);

  // KPI calculations
  const kpis = useMemo(() => {
    let pendingCount = 0;
    let inTransitCount = 0;
    let inUnloadCount = 0;
    let deliveredCount = 0;
    let totalUnitsPending = 0;
    let totalUnitsInTransit = 0;
    let totalUnitsDelivered = 0;
    const unloadDurations: number[] = [];

    orders.forEach((o) => {
      if (o.status === 'por_despachar' || o.status === 'en_preparacion') {
        pendingCount++;
        totalUnitsPending += o.unitsCount;
      } else if (o.status === 'en_ruta') {
        inTransitCount++;
        totalUnitsInTransit += o.unitsCount;
      } else if (o.status === 'en_descarga') {
        inUnloadCount++;
        totalUnitsInTransit += o.unitsCount;
      } else if (o.status === 'entregado') {
        deliveredCount++;
        totalUnitsDelivered += o.unitsDelivered ?? o.unitsCount;
        if (o.unloadingDurationMinutes) {
          unloadDurations.push(o.unloadingDurationMinutes);
        }
      }
    });

    const totalOrders = orders.length;
    const efficiencyRate =
      totalOrders > 0 ? Math.round((deliveredCount / totalOrders) * 100) : 0;

    const avgUnloadMinutes =
      unloadDurations.length > 0
        ? Math.round(unloadDurations.reduce((a, b) => a + b, 0) / unloadDurations.length)
        : 22;

    const totalDriverOvertimeMinutes = overtimeLogs.reduce(
      (acc, l) => acc + (l.driverOvertimeMinutes || 0),
      0
    );
    const totalHelperOvertimeMinutes = overtimeLogs.reduce(
      (acc, l) => acc + (l.helperOvertimeMinutes || 0),
      0
    );

    return {
      totalOrders,
      pendingCount,
      inTransitCount,
      inUnloadCount,
      deliveredCount,
      totalUnitsPending,
      totalUnitsInTransit,
      totalUnitsDelivered,
      efficiencyRate,
      avgUnloadMinutes,
      totalDriverOvertimeMinutes,
      totalHelperOvertimeMinutes,
    };
  }, [orders, overtimeLogs]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const matchSearch =
        !query ||
        o.id.toLowerCase().includes(query) ||
        o.client.toLowerCase().includes(query) ||
        o.address.toLowerCase().includes(query) ||
        o.driver.toLowerCase().includes(query) ||
        (o.helper && o.helper.toLowerCase().includes(query)) ||
        o.zone.toLowerCase().includes(query) ||
        (o.dispatchDate && o.dispatchDate.includes(query)) ||
        (o.itemsDescription && o.itemsDescription.toLowerCase().includes(query)) ||
        o.items.some(
          (it) =>
            it.productType.toLowerCase().includes(query) ||
            (it.calibre && it.calibre.toLowerCase().includes(query)) ||
            (it.color && it.color.toLowerCase().includes(query))
        );

      const matchZone = selectedZone === 'ALL' || o.zone === selectedZone;
      const matchPriority = selectedPriority === 'ALL' || o.priority === selectedPriority;
      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'pendientes' && (o.status === 'por_despachar' || o.status === 'en_preparacion')) ||
        (selectedStatus === 'en_ruta' && (o.status === 'en_ruta' || o.status === 'en_descarga')) ||
        o.status === selectedStatus;
      const matchDriver = selectedDriver === 'ALL' || o.driver === selectedDriver;
      const matchDate =
        selectedDispatchDate === 'ALL' || o.dispatchDate === selectedDispatchDate;

      return matchSearch && matchZone && matchPriority && matchStatus && matchDriver && matchDate;
    });
  }, [orders, searchQuery, selectedZone, selectedPriority, selectedStatus, selectedDriver, selectedDispatchDate]);

  return (
    <DispatchContext.Provider
      value={{
        orders,
        routes,
        destinations,
        productPresentations,
        calibres,
        aluzincColors,
        drivers,
        helpers,
        overtimeLogs,
        regularShiftEndTime,
        setRegularShiftEndTime,
        searchQuery,
        setSearchQuery,
        selectedZone,
        setSelectedZone,
        selectedPriority,
        setSelectedPriority,
        selectedStatus,
        setSelectedStatus,
        selectedDriver,
        setSelectedDriver,
        selectedDispatchDate,
        setSelectedDispatchDate,
        quickDriverMode,
        setQuickDriverMode,
        activeDriverFilter,
        setActiveDriverFilter,
        addOrder,
        updateOrder,
        deleteOrder,
        advanceOrderStatus,
        quickVerifyUnits,
        quickVerifyItemUnits,
        updateRouteDeparture,
        updateRouteArrival,
        updateRouteStatus,
        updateRouteOvertime,
        addRoute,
        updateRoute,
        deleteRoute,
        addOvertimeLog,
        updateOvertimeLog,
        deleteOvertimeLog,
        addDestination,
        updateDestination,
        deleteDestination,
        addProductPresentation,
        updateProductPresentation,
        deleteProductPresentation,
        addCalibre,
        deleteCalibre,
        addAluzincColor,
        deleteAluzincColor,
        addDriver,
        deleteDriver,
        addHelper,
        deleteHelper,
        resetAllData,
        clearAllToZero,
        driverPerformances,
        kpis,
        filteredOrders,
        isOnline,
        offlineQueueCount,
        notifications,
        unreadNotifsCount,
        requestPushPermission,
        pushPermission,
        markNotificationsAsRead,
        clearAllNotifications,
        triggerManualPushTest,
      }}
    >
      {children}
    </DispatchContext.Provider>
  );
};

export function useDispatch() {
  const context = useContext(DispatchContext);
  if (!context) {
    throw new Error('useDispatch must be used within a DispatchProvider');
  }
  return context;
}
