import {
  ManagedService,
  ManagedUser,
  Promotion,
  Role,
} from '../models/management';

// Datos de ejemplo de gestión (TODO: reemplazar por datos de la API)

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrador',
    description: 'Acceso total a todos los paneles y operaciones del negocio.',
    permissions: ['view_panels', 'create_records', 'edit_data', 'delete'],
  },
  {
    id: 'role-bay',
    name: 'Supervisor de Bahía',
    description: 'Gestiona turnos, asignaciones y disponibilidad de operarios.',
    permissions: ['view_panels', 'create_records', 'edit_data'],
  },
  {
    id: 'role-support',
    name: 'Soporte',
    description: 'Consulta reservas y pagos para atender solicitudes de clientes.',
    permissions: ['view_panels'],
  },
];

export const INITIAL_USERS: ManagedUser[] = [
  { id: 'usr-1', name: 'Uziel Loranca Cantoral', email: 'nathan.roberts@example.com', roleId: 'role-admin', createdAt: '2023-02-07', invited: false, active: true },
  { id: 'usr-2', name: 'Iver Avedillo Herbias', email: 'deanna.curtis@example.com', roleId: 'role-admin', createdAt: '2023-08-15', invited: true, active: true },
  { id: 'usr-3', name: 'Aguilda Lloredo Ruifrancos', email: 'debbie.baker@example.com', roleId: 'role-admin', createdAt: '2023-03-03', invited: false, active: true },
];

export const INITIAL_SERVICES: ManagedService[] = [
  { id: 'srv-1', name: 'Encerado', price: 150000, description: 'Aplicación de cera protectora con acabado brillante.', duration: 45, category: 'shine', active: true },
  { id: 'srv-2', name: 'Lavado básico', price: 80000, description: 'Lavado exterior con jabón neutro y secado.', duration: 30, category: 'wash', active: true },
  { id: 'srv-3', name: 'Lavado completo', price: 250000, description: 'Lavado exterior, interior, aspirado y llantas.', duration: 60, category: 'wash', active: false },
  { id: 'srv-4', name: 'Pulido premium', price: 320000, description: 'Pulido de pintura en varias etapas con cera de alta gama.', duration: 90, category: 'shine', active: true },
];

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    name: 'Básico',
    coupon: 'BASICO20',
    description: 'Lavado exterior del vehículo',
    price: 20000,
    duration: 45,
    icon: 'directions-car',
    status: 'active',
    startDate: '2026-09-01',
    featured: false,
    benefits: ['Lavado exterior completo', 'Aspirado básico', 'Limpieza de vidrios'],
    redemptions: 412,
  },
  {
    id: 'promo-2',
    name: 'Premium',
    coupon: 'PREMIUM35',
    description: 'Lavado completo con encerado',
    price: 35000,
    duration: 75,
    icon: 'water-drop',
    status: 'active',
    startDate: '2026-09-01',
    featured: true,
    benefits: ['Todo lo del Básico', 'Lavado de motor', 'Cera líquida protectora'],
    redemptions: 890,
  },
  {
    id: 'promo-3',
    name: 'Completo',
    coupon: 'COMPLETO50',
    description: 'Lavado exterior e interior',
    price: 50000,
    duration: 120,
    icon: 'auto-awesome',
    status: 'scheduled',
    startDate: '2026-10-15',
    featured: false,
    benefits: ['Todo lo del Premium', 'Encerado a mano', 'Detallado de interiores'],
    redemptions: 320,
  },
];

// Métricas fijas de ejemplo (el total de canjes se calcula con las promociones)
export const PROMOTION_METRICS = { savings: 11078000, conversion: 31.2 };
