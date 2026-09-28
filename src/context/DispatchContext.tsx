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
} from '../types/dispatch';
import {
  INITIAL_ORDERS,
  INITIAL_ROUTES,
  INITIAL_DESTINATIONS,
  INITIAL_PRODUCT_PRESENTATIONS,
  INITIAL_CALIBRES,
  INITIAL_DRIVERS,
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
}

interface DispatchContextType {
  orders: Order[];
  routes: RouteRecord[];
  destinations: DestinationZone[];
  productPresentations: ProductPresentation[];
  calibres: string[];
  drivers: string[];

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

  // Route Actions
  updateRouteDeparture: (routeId: string, actualTime?: string) => void;
  updateRouteArrival: (routeId: string, actualTime?: string) => void;
  updateRouteStatus: (routeId: string, status: RouteRecord['status'], notes?: string) => void;
  addRoute: (route: Omit<RouteRecord, 'id' | 'completedStops' | 'deliveredUnits' | 'actualDeparture' | 'actualArrival'>) => void;
  updateRoute: (route: RouteRecord) => void;
  deleteRoute: (id: string) => void;

  // Catalog / Settings Actions
  addDestination: (dest: Omit<DestinationZone, 'id'>) => void;
  updateDestination: (dest: DestinationZone) => void;
  deleteDestination: (id: string) => void;

  addProductPresentation: (prod: Omit<ProductPresentation, 'id'>) => void;
  updateProductPresentation: (prod: ProductPresentation) => void;
  deleteProductPresentation: (id: string) => void;

  addCalibre: (calibre: string) => void;
  deleteCalibre: (calibre: string) => void;

  addDriver: (driver: string) => void;
  deleteDriver: (driver: string) => void;

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

  // Load state from localStorage or initial dataset
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dispatch_orders_v4');
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
    const saved = localStorage.getItem('dispatch_routes_v4');
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
    const saved = localStorage.getItem('dispatch_destinations_v4');
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
    const saved = localStorage.getItem('dispatch_products_v4');
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
    const saved = localStorage.getItem('dispatch_calibres_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CALIBRES;
      }
    }
    return INITIAL_CALIBRES;
  });

  const [drivers, setDrivers] = useState<string[]>(() => {
    const saved = localStorage.getItem('dispatch_drivers_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_DRIVERS;
      }
    }
    return INITIAL_DRIVERS;
  });

  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDriver, setSelectedDriver] = useState('ALL');

  // Quick Unload Driver Mode - default to Carlos
  const [quickDriverMode, setQuickDriverMode] = useState(false);
  const [activeDriverFilter, setActiveDriverFilter] = useState('Carlos');

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('dispatch_orders_v4', JSON.stringify(orders));
    if (!isOnline) {
      setOfflineQueueCount((prev) => prev + 1);
    } else {
      setOfflineQueueCount(0);
    }
  }, [orders, isOnline]);

  useEffect(() => {
    localStorage.setItem('dispatch_routes_v4', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('dispatch_destinations_v4', JSON.stringify(destinations));
  }, [destinations]);

  useEffect(() => {
    localStorage.setItem('dispatch_products_v4', JSON.stringify(productPresentations));
  }, [productPresentations]);

  useEffect(() => {
    localStorage.setItem('dispatch_calibres_v4', JSON.stringify(calibres));
  }, [calibres]);

  useEffect(() => {
    localStorage.setItem('dispatch_drivers_v4', JSON.stringify(drivers));
  }, [drivers]);

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

  // Advance Order Status with full timeline entry (NO SIGNATURE / NO RECEIVER NAME REQUIRED)
  const advanceOrderStatus = useCallback(
    (orderId: string, targetStatus: OrderStatus, options?: AdvanceStatusOptions) => {
      const now = new Date();
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

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
            updatedBy: options?.updatedBy || order.driver || 'Chofer Responsable',
            notes: options?.notes || (targetStatus === 'entregado' ? 'Descarga completada y verificada conforme.' : 'Actualización de estado en sistema.'),
            location: options?.location || (targetStatus === 'en_ruta' ? 'En trayecto hacia destino' : targetStatus === 'en_descarga' ? order.zone : 'Almacén'),
            unitsVerified: verifiedTotal,
            durationFromPrevMinutes: duration,
          };

          let dispatchedAt = order.dispatchedAt;
          let arrivedAt = order.arrivedAt;
          let deliveredAt = order.deliveredAt;
          let unloadingDurationMinutes = order.unloadingDurationMinutes;

          if (targetStatus === 'en_ruta' && !dispatchedAt) {
            dispatchedAt = nowStr;
          } else if (targetStatus === 'en_descarga') {
            arrivedAt = nowStr;
          } else if (targetStatus === 'entregado') {
            deliveredAt = nowStr;
            if (arrivedAt) {
              unloadingDurationMinutes = calculateMinutesBetween(arrivedAt, nowStr);
            } else if (dispatchedAt) {
              unloadingDurationMinutes = 20;
            }
          }

          // Update items delivered counts if provided or if delivered
          const updatedItems = options?.itemsDelivered || order.items.map((it) => ({
            ...it,
            unitsDelivered: targetStatus === 'entregado' ? (it.unitsDelivered ?? it.unitsCount) : it.unitsDelivered,
          }));

          const updatedOrder: Order = {
            ...order,
            status: targetStatus,
            dispatchedAt,
            arrivedAt,
            deliveredAt,
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
    [orders, sendNotification]
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
        new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

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
          `🚦 Salida Registrada: ${route.name}`,
          `${route.driver} inició ruta a las ${timeStr} (${route.totalUnits} unidades a bordo). Programado: ${route.scheduledDeparture}.`,
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
        new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                actualArrival: timeStr,
                status: 'completada',
              }
            : r
        )
      );

      const route = routes.find((r) => r.id === routeId);
      if (route) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
        sendNotification(
          `🏁 Fin de Ruta Registrado: ${route.name}`,
          `${route.driver} reportó llegada/regreso a las ${timeStr}. Eficiencia de transporte procesada.`,
          'success',
          { routeId }
        );
      }
    },
    [routes, sendNotification]
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

  const addDriver = useCallback((driverName: string) => {
    if (!driverName.trim()) return;
    setDrivers((prev) => (prev.includes(driverName.trim()) ? prev : [...prev, driverName.trim()]));
  }, []);

  const deleteDriver = useCallback((driverName: string) => {
    setDrivers((prev) => prev.filter((d) => d !== driverName));
  }, []);

  const addOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'createdAt' | 'dispatchedAt' | 'arrivedAt' | 'deliveredAt' | 'history'>) => {
      const now = new Date();
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
      ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      const newId = `DSP-${Math.floor(1000 + Math.random() * 9000)}`;

      // Calculate total units from items
      const calculatedUnitsCount =
        orderData.items && orderData.items.length > 0
          ? orderData.items.reduce((acc, it) => acc + (it.unitsCount || 0), 0)
          : orderData.unitsCount || 1;

      // Summary description of items
      const itemsSummary =
        orderData.itemsDescription ||
        orderData.items
          .map((it) => `${it.unitsCount} ${it.productType}${it.calibre ? ` (${it.calibre})` : ''}`)
          .join(', ');

      const newOrder: Order = {
        ...orderData,
        id: newId,
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
            notes: `Orden registrada con ${calculatedUnitsCount} unidades combinadas [${itemsSummary}] para entrega en ${orderData.zone}.`,
            unitsVerified: calculatedUnitsCount,
          },
        ],
      };

      setOrders((prev) => [newOrder, ...prev]);

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
        `Destino: ${orderData.zone} - ${calculatedUnitsCount} unidades asignadas a ${orderData.driver}.`,
        'info',
        { orderId: newId }
      );

      return newOrder;
    },
    [sendNotification]
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
    setDrivers(INITIAL_DRIVERS);
    localStorage.removeItem('dispatch_orders_v4');
    localStorage.removeItem('dispatch_routes_v4');
    localStorage.removeItem('dispatch_destinations_v4');
    localStorage.removeItem('dispatch_products_v4');
    localStorage.removeItem('dispatch_calibres_v4');
    localStorage.removeItem('dispatch_drivers_v4');
  }, []);

  const clearAllToZero = useCallback(
    (options?: { resetRoutes?: boolean }) => {
      setOrders([]);
      localStorage.setItem('dispatch_orders_v4', JSON.stringify([]));

      if (options?.resetRoutes) {
        setRoutes((prev) =>
          prev.map((r) => ({
            ...r,
            targetStops: 0,
            completedStops: 0,
            totalUnits: 0,
            deliveredUnits: 0,
            actualDeparture: null,
            actualArrival: null,
            status: 'programada' as const,
          }))
        );
      }

      clearAllNotifications();

      sendNotification(
        '🚀 Sistema Inicializado en Cero',
        'Se han limpiado todas las órdenes de prueba. El sistema está 100% listo para registrar operaciones reales.',
        'success'
      );
    },
    [clearAllNotifications, sendNotification]
  );

  const triggerManualPushTest = useCallback(() => {
    sendNotification(
      '🔔 Alerta en Tiempo Real de Prueba',
      '¡Sistema PWA conectado! Las notificaciones de salida, llegada y entrega de unidades están activas.',
      'info'
    );
    triggerHaptic();
  }, [sendNotification, triggerHaptic]);

  // Performance calculations for transportistas
  const driverPerformances = useMemo<DriverPerformance[]>(() => {
    const driversMap = new Map<string, {
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
    }>();

    // Initialize all drivers from driver list
    drivers.forEach((d) => {
      const matchRoute = routes.find((r) => r.driver === d);
      driversMap.set(d, {
        vehicle: matchRoute ? matchRoute.vehicle : 'Camión Asignado',
        routeId: matchRoute ? matchRoute.id : 'RUT-01',
        totalOrders: 0,
        deliveredOrders: 0,
        totalUnits: 0,
        deliveredUnits: 0,
        scheduledDeparture: matchRoute ? matchRoute.scheduledDeparture : '08:00',
        actualDeparture: matchRoute ? matchRoute.actualDeparture : null,
        scheduledArrival: matchRoute ? matchRoute.scheduledArrival : '14:00',
        actualArrival: matchRoute ? matchRoute.actualArrival : null,
        unloadDurations: [],
      });
    });

    // Populate from orders
    orders.forEach((o) => {
      const entry = driversMap.get(o.driver);
      if (entry) {
        entry.totalOrders++;
        entry.totalUnits += o.unitsCount;
        if (o.status === 'entregado') {
          entry.deliveredOrders++;
          entry.deliveredUnits += o.unitsDelivered ?? o.unitsCount;
          if (o.unloadingDurationMinutes) {
            entry.unloadDurations.push(o.unloadingDurationMinutes);
          }
        }
      } else {
        driversMap.set(o.driver, {
          vehicle: 'Vehículo Asignado',
          routeId: o.routeId || 'RUT-XX',
          totalOrders: 1,
          deliveredOrders: o.status === 'entregado' ? 1 : 0,
          totalUnits: o.unitsCount,
          deliveredUnits: o.status === 'entregado' ? (o.unitsDelivered ?? o.unitsCount) : 0,
          scheduledDeparture: '08:00',
          actualDeparture: o.dispatchedAt ? o.dispatchedAt.slice(11, 16) : null,
          scheduledArrival: '14:00',
          actualArrival: o.deliveredAt ? o.deliveredAt.slice(11, 16) : null,
          unloadDurations: o.unloadingDurationMinutes ? [o.unloadingDurationMinutes] : [],
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

      const schedArrMins = parseTimeToMins(data.scheduledArrival) ?? 840;
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
      if (arrVariance > 15) score -= Math.min(25, (arrVariance - 15) * 1.2);
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
      } else if (depVariance > 25 || arrVariance > 30) {
        status = 'Retraso crítico';
      } else if (depVariance > 10 || arrVariance > 15) {
        status = 'Retraso leve';
      }

      results.push({
        driverName,
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
        efficiencyScore: finalScore,
        status,
      });
    });

    return results.sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }, [routes, orders, drivers]);

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
    };
  }, [orders]);

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
        o.zone.toLowerCase().includes(query) ||
        (o.itemsDescription && o.itemsDescription.toLowerCase().includes(query)) ||
        o.items.some(
          (it) =>
            it.productType.toLowerCase().includes(query) ||
            (it.calibre && it.calibre.toLowerCase().includes(query))
        );

      const matchZone = selectedZone === 'ALL' || o.zone === selectedZone;
      const matchPriority = selectedPriority === 'ALL' || o.priority === selectedPriority;
      const matchStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'pendientes' && (o.status === 'por_despachar' || o.status === 'en_preparacion')) ||
        (selectedStatus === 'en_ruta' && (o.status === 'en_ruta' || o.status === 'en_descarga')) ||
        o.status === selectedStatus;
      const matchDriver = selectedDriver === 'ALL' || o.driver === selectedDriver;

      return matchSearch && matchZone && matchPriority && matchStatus && matchDriver;
    });
  }, [orders, searchQuery, selectedZone, selectedPriority, selectedStatus, selectedDriver]);

  return (
    <DispatchContext.Provider
      value={{
        orders,
        routes,
        destinations,
        productPresentations,
        calibres,
        drivers,
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
        addRoute,
        updateRoute,
        deleteRoute,
        addDestination,
        updateDestination,
        deleteDestination,
        addProductPresentation,
        updateProductPresentation,
        deleteProductPresentation,
        addCalibre,
        deleteCalibre,
        addDriver,
        deleteDriver,
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
