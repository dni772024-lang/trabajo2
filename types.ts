
export enum EquipmentStatus {
  AVAILABLE = 'Disponible',
  LOANED = 'Prestado',
  MAINTENANCE = 'Mantenimiento',
  RETIRED = 'Retirado',
  DAMAGED = 'Dañado'
}

export interface Peripheral {
  id: string;
  type: string;
  brandModel: string;
  specs: string;
}

export interface Equipment {
  id: string;
  category: string;
  subCategory: string;
  brand: string;
  model: string;
  serialNumber: string;
  internalId: string;
  internalLabel?: string;
  color?: string;
  featuresList: string[];

  // Detalle Hardware
  hasScreen: boolean;
  screenDetails?: { brand: string; model: string; serial: string; specs: string };
  hasKeyboard: boolean;
  keyboardDetails?: { brand: string; model: string; serial: string; language: string };
  hasBattery: boolean;
  batteryDetails?: { brand: string; model: string; serial: string; capacity: string };

  // Periféricos
  hasPeripherals: boolean;
  peripherals: Peripheral[];

  // Adquisición
  purchaseDate: string;
  provider: string;
  invoiceNumber: string;
  initialValue: number;
  warrantyUntil: string;
  status: EquipmentStatus;
  condition: 'Excelente' | 'Bueno' | 'Regular' | 'Malo';
  location: string;
  responsibleId?: string;
  photos: string[];
  chipNumber?: string; // Para equipos Inmarsat/IMEI
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  username: string;
  rank: string;
  badgeNumber: string;
  unit: string;
  institutionalEmail: string;
  phone?: string;
  password: string;
  role: 'Administrador' | 'Supervisor' | 'Operador' | 'Consulta';
  permissions: string[];
  accessibleModules: string[];
  sessionExpiration: '1h' | '8h' | '24h' | 'Permanente';
  ipRestriction?: string;
  requirePasswordChange: boolean;
  autoLock: boolean;
  status: 'Activo' | 'Suspendido';
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  lastName: string;
  rank: string;
  badgeNumber: string;
  unit: string;
  department: string;
  position: string;
  hireDate: string;
  institutionalEmail: string;
  phone: string;
  photo?: string;
  supervisorId?: string;
  physicalLocation?: string;
  observations?: string;
  loanLimit: number;
  criticalAccess: boolean;
  accessLevel: 'Básico' | 'Intermedio' | 'Avanzado';
  createdAt: string;
}

export interface SatelliteChip {
  id: string;
  type: 'Iridium' | 'Inmarsat';
  number: string;
  status: 'Disponible' | 'Prestado' | 'Mantenimiento' | 'Baja';
  plan?: string;
  notes?: string;
}

export interface LoanItem {
  equipmentId: string;
  serialNumber: string;
  category: string;
  brand: string;
  model: string;
  chipNumber: string;
  chipId?: string; // New field for linked chip
  exitCondition: 'Excelente' | 'Bueno' | 'Regular' | 'Con observaciones';
  exitObservations?: string;
  accessories: string[];
  // Campos de retorno
  returnCondition?: 'Excelente' | 'Bueno' | 'Regular' | 'Dañado';
  returnObservations?: string;
  returnAccessories?: string[];
  requiresMaintenance?: 'No' | 'Preventivo' | 'Correctivo' | 'Urgente';
  maintenanceDetails?: string;
  // Devolución parcial
  isDeviceReturned?: boolean;
  isChipReturned?: boolean;
}

export interface LoanIncident {
  occurred: boolean;
  type?: 'Daño accidental' | 'Mal funcionamiento' | 'Pérdida' | 'Robo' | 'Otro';
  date?: string;
  description?: string;
  officialReport?: boolean;
  reportFile?: string;
  reportReason?: string;
}

export interface Loan {
  id: string;
  idOrden: string; // TEC-SENAN-######-DDMMYYYY
  loanDate: string;
  exitTime: string;
  status: 'active' | 'returned' | 'cancelled';

  // Solicitante
  solicitante: {
    nombre: string;
    rango: string;
    placa: string;
    departamento: string;
    telefono: string;
    email: string;
  };

  // Responsable que entrega (Inventario DNI)
  entregaResponsable: {
    nombre: string;
    rango: string;
    placa: string;
    departamento: string;
  };

  // Equipos
  items: LoanItem[];

  // Misión
  mission: {
    destino: string;
    fechaRetornoProgramada: string;
    motivo: string;
    tipo: 'Operativa' | 'Administrativa' | 'Capacitación' | 'Mantenimiento' | 'Comisión' | 'Otro';
    tipoOtro?: string;
  };

  // Retorno (Solo cuando status = returned)
  returnInfo?: {
    returnDate: string;
    returnTime: string;
    daysLoaned: string;
    onTime: boolean;
    delayJustification?: string;
    incident: LoanIncident;
    satisfaction: number;
    responsiblePlaca: string;
    responsibleNombre: string;
  };

  // Firmas (Base64)
  signatures: {
    solicitanteSalida?: string;
    responsableEntrega?: string;
    solicitanteRetorno?: string;
    responsableRecepcion?: string;
  };

  notes: string;
  liabilityAccepted: boolean;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  parentId?: string;
  customFields: { name: string; type: 'Texto' | 'Número' | 'Fecha' | 'Lista' }[];
  requireApproval: boolean;
  maxLoanDays: number;
  isCritical: boolean;
  maintenanceEveryMonths: number;
  tagColor: string;
  icon: string;
  prefix: string;
  subCategories: string[];
}
