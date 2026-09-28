import { DestinationZone, Order, OvertimeLog, ProductPresentation, RouteRecord } from '../types/dispatch';

export const INITIAL_DRIVERS = ['Carlos', 'Danilo', 'Nelson'];

export const INITIAL_HELPERS = ['José', 'Miguel', 'Pedro', 'Sin Ayudante'];

export const INITIAL_ALUZINC_COLORS: string[] = [
  'Azul liso',
  'Rojo liso',
  'Marrón liso',
  'Terracota liso',
  'Verde liso',
  'Marrón text',
  'Rojo text',
  'Verde text',
  'Gris text',
  'Negro text',
  'Azul text',
  'Terracota text',
  'No aplica',
];

// Horario laboral oficial: 8:00 AM a 12:00 PM y de 2:00 PM a 6:00 PM
export const WORK_SCHEDULE = {
  morningStart: '08:00', // 8:00 AM
  morningEnd: '12:00',   // 12:00 PM
  afternoonStart: '14:00', // 2:00 PM
  afternoonEnd: '18:00',   // 6:00 PM
  label: '8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM',
};

export function formatTime12h(time24?: string | null): string {
  if (!time24) return '--:--';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

export function getColorSwatch(colorName?: string): { dotClass: string; badgeClass: string; isApplicable: boolean } {
  if (!colorName || colorName === 'No aplica' || colorName === 'Sin color') {
    return {
      dotClass: 'bg-slate-500',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
      isApplicable: false,
    };
  }
  const lower = colorName.toLowerCase();
  if (lower.includes('terracota')) {
    return {
      dotClass: 'bg-orange-500',
      badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      isApplicable: true,
    };
  }
  if (lower.includes('rojo')) {
    return {
      dotClass: 'bg-red-500',
      badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30',
      isApplicable: true,
    };
  }
  if (lower.includes('azul')) {
    return {
      dotClass: 'bg-blue-500',
      badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      isApplicable: true,
    };
  }
  if (lower.includes('verde')) {
    return {
      dotClass: 'bg-emerald-500',
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      isApplicable: true,
    };
  }
  if (lower.includes('gris')) {
    return {
      dotClass: 'bg-slate-400',
      badgeClass: 'bg-slate-500/20 text-slate-200 border-slate-400/30',
      isApplicable: true,
    };
  }
  if (lower.includes('marrón') || lower.includes('marron')) {
    return {
      dotClass: 'bg-amber-700',
      badgeClass: 'bg-amber-700/20 text-amber-300 border-amber-600/30',
      isApplicable: true,
    };
  }
  if (lower.includes('negro')) {
    return {
      dotClass: 'bg-zinc-950 ring-1 ring-slate-400',
      badgeClass: 'bg-zinc-900 text-zinc-200 border-zinc-600',
      isApplicable: true,
    };
  }
  return {
    dotClass: 'bg-sky-400',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    isApplicable: true,
  };
}

export function formatDispatchDate(dateStr?: string): string {
  if (!dateStr) return 'Hoy';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatOvertimeDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return '0h 00m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs}h 00m`;
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
}

export interface OvertimeBreakdown {
  before8amMins: number;
  middayMins: number;
  after6pmMins: number;
  totalOvertimeMins: number;
  spansFullMidday: boolean;
}

/**
 * Calcula las horas extras tomando en cuenta la jornada laboral:
 * Mañana: 8:00 AM (480) a 12:00 PM (720)
 * Mediodía (Fuera de turno): 12:00 PM (720) a 2:00 PM (840)
 * Tarde: 2:00 PM (840) a 6:00 PM (1080)
 */
export function calculateScheduleOvertimeBreakdown(
  departureTime?: string | null,
  arrivalTime?: string | null,
  workedDuringLunch = false
): OvertimeBreakdown {
  const empty: OvertimeBreakdown = {
    before8amMins: 0,
    middayMins: 0,
    after6pmMins: 0,
    totalOvertimeMins: 0,
    spansFullMidday: false,
  };

  if (!arrivalTime) return empty;

  const parseMins = (t?: string | null): number | null => {
    if (!t) return null;
    const p = t.split(':');
    if (p.length < 2) return null;
    const h = parseInt(p[0], 10);
    const m = parseInt(p[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  const arrMins = parseMins(arrivalTime);
  if (arrMins === null) return empty;
  const depMins = parseMins(departureTime) ?? 480; // Default 8:00 AM if not provided

  if (arrMins <= depMins) return empty;

  const MORNING_START = 8 * 60;   // 08:00 (480)
  const MORNING_END = 12 * 60;    // 12:00 (720)
  const AFTERNOON_START = 14 * 60; // 14:00 (840)
  const AFTERNOON_END = 18 * 60;   // 18:00 (1080)

  // 1. Minutos antes de las 8:00 AM
  const before8amMins =
    depMins < MORNING_START
      ? Math.max(0, Math.min(arrMins, MORNING_START) - depMins)
      : 0;

  // 2. Minutos entre 12:00 PM y 2:00 PM
  const overlapMidday = Math.max(
    0,
    Math.min(arrMins, AFTERNOON_START) - Math.max(depMins, MORNING_END)
  );
  // Si la ruta inició en la mañana y terminó entre 12:01 PM y 2:00 PM, o inició entre 12:00 PM y 1:59 PM,
  // ese tiempo en el bloque de 12:00 PM a 2:00 PM se trabajó efectivamente.
  // Si cruzó todo el día (salió antes de las 12:00 PM y regresó después de las 2:00 PM), se suma si workedDuringLunch = true.
  const spansFullMidday = depMins <= MORNING_END && arrMins >= AFTERNOON_START;
  const middayMins = spansFullMidday
    ? workedDuringLunch
      ? overlapMidday
      : 0
    : overlapMidday;

  // 3. Minutos después de las 6:00 PM (18:00)
  const after6pmMins =
    arrMins > AFTERNOON_END
      ? Math.max(0, arrMins - Math.max(depMins, AFTERNOON_END))
      : 0;

  const totalOvertimeMins = before8amMins + middayMins + after6pmMins;

  return {
    before8amMins,
    middayMins,
    after6pmMins,
    totalOvertimeMins,
    spansFullMidday,
  };
}

export function calculateOvertimeMinutes(
  arrivalTime?: string | null,
  _shiftEndTime = '18:00',
  departureTime?: string | null,
  workedDuringLunch = false
): number {
  return calculateScheduleOvertimeBreakdown(
    departureTime,
    arrivalTime,
    workedDuringLunch
  ).totalOvertimeMins;
}

export const INITIAL_DESTINATIONS: DestinationZone[] = [
  { id: 'dest-1', name: 'Jarabacoa', cityRegion: 'La Vega - Cordillera Central' },
  { id: 'dest-2', name: 'Hierro Reales La Vega', cityRegion: 'La Vega - Zona Industrial' },
  { id: 'dest-3', name: 'Hierro Rafa SFM', cityRegion: 'San Francisco de Macorís' },
  { id: 'dest-4', name: 'Hierro Rafa STGO', cityRegion: 'Santiago de los Caballeros' },
  { id: 'dest-5', name: 'Hierro Rafa Puerto Plata', cityRegion: 'Puerto Plata - Costa Norte' },
  { id: 'dest-6', name: 'Bellon STGO', cityRegion: 'Santiago - Av. Bartolomé Colón' },
  { id: 'dest-7', name: 'Metria SFM', cityRegion: 'San Francisco de Macorís' },
  { id: 'dest-8', name: 'Grupo Delsa', cityRegion: 'Región Cibao Central' },
];

export const INITIAL_PRODUCT_PRESENTATIONS: ProductPresentation[] = [
  { id: 'prod-1', name: 'Caballete', calibreRequired: true, defaultCalibre: 'Calibre 26 (0.45 mm)', hasColor: true, defaultColor: 'Azul liso' },
  { id: 'prod-2', name: 'Aluzinc', calibreRequired: true, defaultCalibre: 'Calibre 26 (0.45 mm)', hasColor: true, defaultColor: 'Azul liso' },
  { id: 'prod-3', name: 'Aluteja', calibreRequired: true, defaultCalibre: 'Calibre 26 (0.45 mm)', hasColor: true, defaultColor: 'Terracota text' },
  { id: 'prod-4', name: 'Caballete tipo teja', calibreRequired: true, defaultCalibre: 'Calibre 26 (0.45 mm)', hasColor: true, defaultColor: 'Terracota text' },
  { id: 'prod-5', name: 'Lima hoya', calibreRequired: true, defaultCalibre: 'Calibre 24 (0.55 mm)', hasColor: true, defaultColor: 'Azul liso' },
  { id: 'prod-6', name: 'Parales', calibreRequired: true, defaultCalibre: 'Calibre 18 (1.20 mm)', hasColor: false, defaultColor: 'No aplica' },
  { id: 'prod-7', name: 'Durmientes', calibreRequired: true, defaultCalibre: 'Calibre 16 (1.50 mm)', hasColor: false, defaultColor: 'No aplica' },
  { id: 'prod-8', name: 'Caños', calibreRequired: true, defaultCalibre: 'Calibre 1/8" (3.17 mm)', hasColor: false, defaultColor: 'No aplica' },
  { id: 'prod-9', name: 'Tolas', calibreRequired: true, defaultCalibre: 'Calibre 1/8" (3.17 mm)', hasColor: false, defaultColor: 'No aplica' },
];

export const INITIAL_CALIBRES: string[] = [
  'Calibre 22 (0.75 mm)',
  'Calibre 24 (0.55 mm)',
  'Calibre 26 (0.45 mm)',
  'Calibre 28 (0.35 mm)',
  'Calibre 16 (1.50 mm)',
  'Calibre 18 (1.20 mm)',
  'Calibre 1/8" (3.17 mm)',
  'Calibre 3/16" (4.76 mm)',
  'Calibre 1/4" (6.35 mm)',
  'Calibre Estándar / No aplica',
];

export const INITIAL_ROUTES: RouteRecord[] = [
  {
    id: 'RUT-01',
    name: 'Ruta Santiago & Puerto Plata',
    zone: 'Hierro Rafa STGO',
    driver: 'Carlos',
    helper: 'José',
    dispatchDate: '2026-09-28',
    vehicle: 'Camión Isuzu 01 (Placa A92-BB7)',
    scheduledDeparture: '08:00',
    actualDeparture: '08:00',
    scheduledArrival: '18:00',
    actualArrival: '19:30',
    shiftEndTime: '18:00',
    driverOvertimeMinutes: 90,
    helperOvertimeMinutes: 90,
    overtimeNotes: '1h 30m extra después de las 6:00 PM en Santiago.',
    status: 'en_ruta',
    targetStops: 3,
    completedStops: 1,
    totalUnits: 155,
    deliveredUnits: 65,
    startKm: 14230,
    notes: 'Despacho de Aluzinc, Caballetes y Tolas para el Cibao.',
  },
  {
    id: 'RUT-02',
    name: 'Ruta SFM & La Vega',
    zone: 'Hierro Rafa SFM',
    driver: 'Danilo',
    helper: 'Miguel',
    dispatchDate: '2026-09-28',
    vehicle: 'Camión Mack 03 (Placa B45-XZ1)',
    scheduledDeparture: '08:00',
    actualDeparture: '08:00',
    scheduledArrival: '18:00',
    actualArrival: '20:00',
    shiftEndTime: '18:00',
    driverOvertimeMinutes: 120,
    helperOvertimeMinutes: 120,
    overtimeNotes: '2h 00m extra después de las 6:00 PM por descarga en SFM.',
    status: 'en_ruta',
    targetStops: 3,
    completedStops: 1,
    totalUnits: 180,
    deliveredUnits: 75,
    startKm: 89400,
    notes: 'Descarga con montacargas en Metria SFM e Hierro Reales.',
  },
  {
    id: 'RUT-03',
    name: 'Ruta Jarabacoa & Cordillera',
    zone: 'Jarabacoa',
    driver: 'Nelson',
    helper: 'Pedro',
    dispatchDate: '2026-09-28',
    vehicle: 'Camión Daihatsu 02 (Placa M09-KL4)',
    scheduledDeparture: '08:00',
    actualDeparture: '08:00',
    scheduledArrival: '12:00',
    actualArrival: '13:15',
    shiftEndTime: '18:00',
    driverOvertimeMinutes: 75,
    helperOvertimeMinutes: 75,
    overtimeNotes: '1h 15m de hora extra trabajando en horario de mediodía (12:00 PM a 1:15 PM).',
    status: 'completada',
    targetStops: 2,
    completedStops: 2,
    totalUnits: 110,
    deliveredUnits: 110,
    startKm: 12050,
    endKm: 12120,
    notes: 'Ruta completada con éxito.',
  },
];

export const INITIAL_OVERTIME_LOGS: OvertimeLog[] = [
  {
    id: 'ot-1',
    date: '2026-09-28',
    routeId: 'RUT-01',
    orderId: 'DSP-1001',
    zone: 'Hierro Rafa STGO',
    driver: 'Carlos',
    helper: 'José',
    departureTime: '08:00',
    arrivalTime: '19:30',
    regularEndTime: '18:00',
    driverOvertimeMinutes: 90,
    helperOvertimeMinutes: 90,
    notes: 'Llegada a las 7:30 PM (1h 30m después del cierre de las 6:00 PM).',
  },
  {
    id: 'ot-2',
    date: '2026-09-28',
    routeId: 'RUT-02',
    orderId: 'DSP-1002',
    zone: 'Hierro Reales La Vega',
    driver: 'Danilo',
    helper: 'Miguel',
    departureTime: '14:00',
    arrivalTime: '20:00',
    regularEndTime: '18:00',
    driverOvertimeMinutes: 120,
    helperOvertimeMinutes: 120,
    notes: 'Turno tarde (2:00 PM a 8:00 PM): 2h 00m extra después de las 6:00 PM.',
  },
  {
    id: 'ot-3',
    date: '2026-09-28',
    routeId: 'RUT-03',
    orderId: 'DSP-1005',
    zone: 'Bellon STGO',
    driver: 'Nelson',
    helper: 'Pedro',
    departureTime: '08:00',
    arrivalTime: '13:15',
    regularEndTime: '12:00',
    driverOvertimeMinutes: 75,
    helperOvertimeMinutes: 75,
    notes: 'Turno mañana extendido hasta la 1:15 PM (1h 15m extra en horario de 12:00 PM - 2:00 PM).',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'DSP-1001',
    client: 'Hierro Rafa STGO',
    phone: '+1 (809) 582-1144',
    address: 'Av. Circunvalación Sur, Santiago de los Caballeros',
    zone: 'Hierro Rafa STGO',
    routeId: 'RUT-01',
    priority: 'Urgente',
    status: 'en_descarga',
    driver: 'Carlos',
    helper: 'José',
    dispatchDate: '2026-09-28',
    departureTime: '08:00',
    arrivalTime: '19:30',
    driverOvertimeMinutes: 90,
    helperOvertimeMinutes: 90,
    items: [
      {
        id: 'item-1001-1',
        productType: 'Aluzinc',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Azul liso',
        unitsCount: 40,
        unitsDelivered: 40,
        notes: 'Láminas de 12 pies Azul liso',
      },
      {
        id: 'item-1001-2',
        productType: 'Caballete',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Azul liso',
        unitsCount: 15,
        unitsDelivered: 15,
        notes: 'Caballetes 2.44m Azul liso',
      },
      {
        id: 'item-1001-3',
        productType: 'Lima hoya',
        calibre: 'Calibre 24 (0.55 mm)',
        color: 'Gris text',
        unitsCount: 10,
        unitsDelivered: 10,
        notes: 'Canales de desagüe Gris text',
      },
    ],
    unitsCount: 65,
    unitsDelivered: 65,
    itemsDescription: '40 Aluzinc Azul liso C-26, 15 Caballetes Azul liso C-26, 10 Lima hoya Gris text C-24',
    estimatedDeliveryTime: '09:30',
    createdAt: '2026-09-28 08:00',
    dispatchedAt: '2026-09-28 08:00',
    arrivedAt: '2026-09-28 08:50',
    deliveredAt: null,
    history: [
      {
        id: 'h-1001-1',
        status: 'creado',
        statusLabel: 'Pedido Registrado en Planta',
        timestamp: '2026-09-28 08:00',
        updatedBy: 'Despacho Central',
        notes: 'Envío multi-producto registrado: 40 Aluzinc (Azul liso), 15 Caballetes, 10 Lima hoya (65 unidades totales).',
        unitsVerified: 65,
      },
      {
        id: 'h-1001-2',
        status: 'en_preparacion',
        statusLabel: 'Flejeado y Verificación de Calibres y Colores',
        timestamp: '2026-09-28 08:10',
        updatedBy: 'Control de Calidad',
        notes: '65 unidades contadas y separadas por tipo de producto y color.',
        unitsVerified: 65,
        durationFromPrevMinutes: 10,
      },
      {
        id: 'h-1001-3',
        status: 'en_ruta',
        statusLabel: 'Salida de Patio a Ruta',
        timestamp: '2026-09-28 08:15',
        updatedBy: 'Carlos (Chofer) & José (Ayudante)',
        notes: 'En camino hacia Santiago.',
        location: 'Patio Central',
        durationFromPrevMinutes: 5,
      },
      {
        id: 'h-1001-4',
        status: 'en_descarga',
        statusLabel: 'Llegada a Rampa - En Descarga',
        timestamp: '2026-09-28 08:50',
        updatedBy: 'Carlos (Chofer)',
        notes: 'Camión ubicado en patio de descarga de Hierro Rafa STGO. Conteo de unidades en rampa.',
        unitsVerified: 65,
        durationFromPrevMinutes: 35,
      },
    ],
  },
  {
    id: 'DSP-1002',
    client: 'Hierro Reales La Vega',
    phone: '+1 (809) 573-2288',
    address: 'Autopista Duarte Km 4.5, La Vega',
    zone: 'Hierro Reales La Vega',
    routeId: 'RUT-02',
    priority: 'Alta',
    status: 'en_ruta',
    driver: 'Danilo',
    helper: 'Miguel',
    dispatchDate: '2026-09-28',
    departureTime: '14:00',
    arrivalTime: '20:00',
    driverOvertimeMinutes: 120,
    helperOvertimeMinutes: 120,
    items: [
      {
        id: 'item-1002-1',
        productType: 'Aluteja',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Terracota text',
        unitsCount: 50,
        notes: 'Color Terracota text 14 pies',
      },
      {
        id: 'item-1002-2',
        productType: 'Caballete tipo teja',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Terracota text',
        unitsCount: 15,
        notes: 'Caballetes esmaltados Terracota text',
      },
      {
        id: 'item-1002-3',
        productType: 'Parales',
        calibre: 'Calibre 18 (1.20 mm)',
        color: 'No aplica',
        unitsCount: 10,
        notes: 'Parales estructurales',
      },
    ],
    unitsCount: 75,
    itemsDescription: '50 Aluteja Terracota text C-26, 15 Caballete tipo teja C-26, 10 Parales C-18',
    estimatedDeliveryTime: '16:15',
    createdAt: '2026-09-28 14:00',
    dispatchedAt: '2026-09-28 14:15',
    arrivedAt: null,
    deliveredAt: null,
    history: [
      {
        id: 'h-1002-1',
        status: 'creado',
        statusLabel: 'Pedido Registrado',
        timestamp: '2026-09-28 14:00',
        updatedBy: 'Ventas La Vega',
        notes: 'Envío con 75 unidades combinadas.',
        unitsVerified: 75,
      },
      {
        id: 'h-1002-2',
        status: 'en_ruta',
        statusLabel: 'En Ruta hacia La Vega',
        timestamp: '2026-09-28 14:15',
        updatedBy: 'Danilo (Chofer) & Miguel (Ayudante)',
        notes: 'Tránsito fluido por Autopista Duarte.',
        durationFromPrevMinutes: 15,
      },
    ],
  },
  {
    id: 'DSP-1003',
    client: 'Metria SFM',
    phone: '+1 (809) 588-3311',
    address: 'Av. Frank Grullón #88, San Francisco de Macorís',
    zone: 'Metria SFM',
    routeId: 'RUT-02',
    priority: 'Normal',
    status: 'en_ruta',
    driver: 'Danilo',
    helper: 'Miguel',
    dispatchDate: '2026-09-28',
    departureTime: '08:15',
    items: [
      {
        id: 'item-1003-1',
        productType: 'Durmientes',
        calibre: 'Calibre 16 (1.50 mm)',
        color: 'No aplica',
        unitsCount: 30,
        notes: 'Durmientes galvanizados',
      },
      {
        id: 'item-1003-2',
        productType: 'Caños',
        calibre: 'Calibre 1/8" (3.17 mm)',
        color: 'No aplica',
        unitsCount: 25,
        notes: 'Caños redondos estructurales',
      },
      {
        id: 'item-1003-3',
        productType: 'Tolas',
        calibre: 'Calibre 1/8" (3.17 mm)',
        color: 'No aplica',
        unitsCount: 50,
        notes: 'Tolas 4x8 pies',
      },
    ],
    unitsCount: 105,
    itemsDescription: '30 Durmientes C-16, 25 Caños 1/8", 50 Tolas 1/8"',
    estimatedDeliveryTime: '11:45',
    createdAt: '2026-09-28 08:00',
    dispatchedAt: '2026-09-28 08:15',
    arrivedAt: null,
    deliveredAt: null,
    history: [
      {
        id: 'h-1003-1',
        status: 'creado',
        statusLabel: 'Pedido Creado',
        timestamp: '2026-09-28 08:00',
        updatedBy: 'Despacho SFM',
        unitsVerified: 105,
      },
      {
        id: 'h-1003-2',
        status: 'en_ruta',
        statusLabel: 'En Tránsito',
        timestamp: '2026-09-28 08:15',
        updatedBy: 'Danilo',
        durationFromPrevMinutes: 15,
      },
    ],
  },
  {
    id: 'DSP-1004',
    client: 'Hierro Rafa Puerto Plata',
    phone: '+1 (809) 261-5500',
    address: 'Carretera Puerto Plata - Playa Dorada Km 2',
    zone: 'Hierro Rafa Puerto Plata',
    routeId: 'RUT-01',
    priority: 'Urgente',
    status: 'por_despachar',
    driver: 'Carlos',
    helper: 'José',
    dispatchDate: '2026-09-29',
    departureTime: '08:00',
    items: [
      {
        id: 'item-1004-1',
        productType: 'Tolas',
        calibre: 'Calibre 3/16" (4.76 mm)',
        color: 'No aplica',
        unitsCount: 40,
        notes: 'Tolas navales',
      },
      {
        id: 'item-1004-2',
        productType: 'Aluzinc',
        calibre: 'Calibre 24 (0.55 mm)',
        color: 'Verde liso',
        unitsCount: 50,
        notes: 'Aluzinc reforzado C-24 Verde liso',
      },
    ],
    unitsCount: 90,
    itemsDescription: '40 Tolas C-3/16", 50 Aluzinc Verde liso C-24',
    estimatedDeliveryTime: '11:30',
    createdAt: '2026-09-28 08:15',
    dispatchedAt: null,
    arrivedAt: null,
    deliveredAt: null,
    history: [
      {
        id: 'h-1004-1',
        status: 'creado',
        statusLabel: 'Pedido Registrado',
        timestamp: '2026-09-28 08:15',
        updatedBy: 'Despacho Industrial',
        unitsVerified: 90,
      },
    ],
  },
  {
    id: 'DSP-1005',
    client: 'Bellon STGO',
    phone: '+1 (809) 581-2233',
    address: 'Av. Bartolomé Colón, Ensanche Bolívar, Santiago',
    zone: 'Bellon STGO',
    routeId: 'RUT-03',
    priority: 'Normal',
    status: 'entregado',
    driver: 'Nelson',
    helper: 'Pedro',
    dispatchDate: '2026-09-28',
    departureTime: '08:00',
    arrivalTime: '13:15',
    driverOvertimeMinutes: 75,
    helperOvertimeMinutes: 75,
    items: [
      {
        id: 'item-1005-1',
        productType: 'Aluzinc',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Rojo liso',
        unitsCount: 40,
        unitsDelivered: 40,
        notes: 'Aluzinc Rojo liso',
      },
      {
        id: 'item-1005-2',
        productType: 'Caballete',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Rojo liso',
        unitsCount: 20,
        unitsDelivered: 20,
        notes: 'Caballetes Rojo liso',
      },
    ],
    unitsCount: 60,
    unitsDelivered: 60,
    itemsDescription: '40 Aluzinc Rojo liso C-26, 20 Caballetes Rojo liso C-26',
    createdAt: '2026-09-28 08:00',
    dispatchedAt: '2026-09-28 08:35',
    arrivedAt: '2026-09-28 12:30',
    deliveredAt: '2026-09-28 13:15',
    unloadingDurationMinutes: 45,
    history: [
      {
        id: 'h-1005-1',
        status: 'creado',
        statusLabel: 'Pedido Registrado',
        timestamp: '2026-09-28 08:00',
        updatedBy: 'Almacén',
        unitsVerified: 60,
      },
      {
        id: 'h-1005-2',
        status: 'en_ruta',
        statusLabel: 'Salida a Ruta',
        timestamp: '2026-09-28 08:35',
        updatedBy: 'Nelson',
        durationFromPrevMinutes: 35,
      },
      {
        id: 'h-1005-3',
        status: 'en_descarga',
        statusLabel: 'Llegada y Descarga',
        timestamp: '2026-09-28 12:30',
        updatedBy: 'Nelson',
        durationFromPrevMinutes: 235,
      },
      {
        id: 'h-1005-4',
        status: 'entregado',
        statusLabel: 'Entrega Conforme',
        timestamp: '2026-09-28 13:15',
        updatedBy: 'Nelson & Pedro',
        notes: '60 unidades verificadas conforme (40 Aluzinc Rojo liso + 20 Caballetes).',
        unitsVerified: 60,
        durationFromPrevMinutes: 45,
      },
    ],
  },
  {
    id: 'DSP-1006',
    client: 'Grupo Delsa',
    phone: '+1 (809) 241-9900',
    address: 'Zona Industrial de Canabacoa, Santiago',
    zone: 'Grupo Delsa',
    routeId: 'RUT-03',
    priority: 'Alta',
    status: 'entregado',
    driver: 'Nelson',
    helper: 'Pedro',
    dispatchDate: '2026-09-28',
    departureTime: '08:35',
    arrivalTime: '10:25',
    items: [
      {
        id: 'item-1006-1',
        productType: 'Durmientes',
        calibre: 'Calibre 16 (1.50 mm)',
        color: 'No aplica',
        unitsCount: 30,
        unitsDelivered: 30,
      },
      {
        id: 'item-1006-2',
        productType: 'Lima hoya',
        calibre: 'Calibre 24 (0.55 mm)',
        color: 'Marrón text',
        unitsCount: 20,
        unitsDelivered: 20,
      },
    ],
    unitsCount: 50,
    unitsDelivered: 50,
    itemsDescription: '30 Durmientes C-16, 20 Lima hoya Marrón text C-24',
    createdAt: '2026-09-28 08:15',
    dispatchedAt: '2026-09-28 08:35',
    arrivedAt: '2026-09-28 10:00',
    deliveredAt: '2026-09-28 10:25',
    unloadingDurationMinutes: 25,
    history: [
      {
        id: 'h-1006-1',
        status: 'creado',
        statusLabel: 'Pedido Registrado',
        timestamp: '2026-09-28 08:15',
        updatedBy: 'Ventas Delsa',
        unitsVerified: 50,
      },
      {
        id: 'h-1006-2',
        status: 'en_ruta',
        statusLabel: 'En Ruta',
        timestamp: '2026-09-28 08:35',
        updatedBy: 'Nelson',
        durationFromPrevMinutes: 20,
      },
      {
        id: 'h-1006-3',
        status: 'entregado',
        statusLabel: 'Entrega Conforme',
        timestamp: '2026-09-28 10:25',
        updatedBy: 'Nelson',
        notes: '50 unidades descargadas y verificadas con éxito.',
        unitsVerified: 50,
        durationFromPrevMinutes: 110,
      },
    ],
  },
  {
    id: 'DSP-1007',
    client: 'Jarabacoa Materiales',
    phone: '+1 (809) 574-8899',
    address: 'Carretera Federico Basilis, Entrada Jarabacoa',
    zone: 'Jarabacoa',
    routeId: 'RUT-03',
    priority: 'Normal',
    status: 'por_despachar',
    driver: 'Nelson',
    helper: 'Pedro',
    dispatchDate: '2026-09-29',
    departureTime: '14:00',
    items: [
      {
        id: 'item-1007-1',
        productType: 'Aluzinc',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Terracota liso',
        unitsCount: 30,
      },
      {
        id: 'item-1007-2',
        productType: 'Caballete tipo teja',
        calibre: 'Calibre 26 (0.45 mm)',
        color: 'Terracota liso',
        unitsCount: 15,
      },
    ],
    unitsCount: 45,
    itemsDescription: '30 Aluzinc Terracota liso C-26, 15 Caballete tipo teja Terracota liso C-26',
    estimatedDeliveryTime: '16:30',
    createdAt: '2026-09-28 08:45',
    dispatchedAt: null,
    arrivedAt: null,
    deliveredAt: null,
    history: [
      {
        id: 'h-1007-1',
        status: 'creado',
        statusLabel: 'Pedido en Cola de Despacho',
        timestamp: '2026-09-28 08:45',
        updatedBy: 'Despacho Jarabacoa',
        unitsVerified: 45,
      },
    ],
  },
];
