export type OrderStatus =
  | 'creado'
  | 'por_despachar'
  | 'en_preparacion'
  | 'en_ruta'
  | 'en_descarga'
  | 'entregado'
  | 'novedad'
  | 'devuelto';

export type Priority = 'Normal' | 'Alta' | 'Urgente';

export interface ProductPresentation {
  id: string;
  name: string; // e.g., 'Aluzinc', 'Caballete', 'Tolas', etc.
  calibreRequired?: boolean;
  defaultCalibre?: string;
  description?: string;
}

export interface DestinationZone {
  id: string;
  name: string; // e.g. 'Jarabacoa', 'Hierro Reales La Vega', etc.
  cityRegion?: string;
  description?: string;
}

export interface OrderItem {
  id: string;
  productType: string; // e.g. 'Aluzinc', 'Caballete', 'Tolas', etc.
  calibre?: string; // e.g. 'Calibre 26 (0.45 mm)', 'Calibre 1/8"', etc.
  unitsCount: number; // Cantidad de unidades de este tipo específico
  unitsDelivered?: number; // Cantidad verificada en descarga
  notes?: string;
}

export interface StatusHistoryEntry {
  id: string;
  status: OrderStatus;
  statusLabel: string;
  timestamp: string;
  updatedBy: string; // Chofer o despachador
  notes?: string;
  location?: string;
  unitsVerified?: number;
  durationFromPrevMinutes?: number;
}

export interface Order {
  id: string;
  client: string;
  phone: string;
  address: string;
  zone: string; // e.g. 'Jarabacoa', 'Hierro Reales La Vega', etc.
  routeId: string;
  priority: Priority;
  status: OrderStatus;
  driver: 'Carlos' | 'Danilo' | 'Nelson' | string;
  items: OrderItem[]; // Desglose de cada tipo de unidad despachada en el mismo envío
  unitsCount: number; // Total de unidades sumadas
  unitsDelivered?: number; // Total entregado
  itemsDescription?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  dispatchedAt: string | null;
  arrivedAt: string | null;
  deliveredAt: string | null;
  history: StatusHistoryEntry[];
  delayReason?: string;
  unloadingDurationMinutes?: number;
}

export interface RouteRecord {
  id: string;
  name: string;
  zone: string;
  driver: 'Carlos' | 'Danilo' | 'Nelson' | string;
  vehicle: string;
  scheduledDeparture: string;
  actualDeparture: string | null;
  scheduledArrival: string;
  actualArrival: string | null;
  status: 'programada' | 'en_ruta' | 'completada' | 'demorada';
  targetStops: number;
  completedStops: number;
  totalUnits: number;
  deliveredUnits: number;
  startKm?: number;
  endKm?: number;
  notes?: string;
}

export interface DriverPerformance {
  driverName: string;
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
  departureVarianceMinutes: number;
  arrivalVarianceMinutes: number;
  avgUnloadMinutes: number;
  efficiencyScore: number;
  status: 'En tiempo' | 'Retraso leve' | 'Retraso crítico' | 'Completado con éxito' | 'Pendiente salida';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  orderId?: string;
  routeId?: string;
}
