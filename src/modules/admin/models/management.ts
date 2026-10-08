// Modelos y tipos del módulo de gestión (usuarios, roles, servicios y promociones)

export type ManagementTab = 'users' | 'roles' | 'services' | 'promotions';
export const MANAGEMENT_TABS: ManagementTab[] = ['users', 'roles', 'services', 'promotions'];

// ---------------------------------------------------------------
// Roles
// ---------------------------------------------------------------

// ADR-015: los 3 roles son fijos (ADMIN/OPERATOR/CLIENT); id es el código del rol. Los permisos
// vienen del catálogo real de security-service (security.permission), ya no son estos 4 fijos,
// pero se deja el tipo para quien todavía los use como fallback de visualización.
export type Permission = 'view_panels' | 'create_records' | 'edit_data' | 'delete';
export const PERMISSIONS: Permission[] = ['view_panels', 'create_records', 'edit_data', 'delete'];

export type RoleCode = 'ADMIN' | 'OPERATOR' | 'CLIENT';
export const ROLE_CODES: RoleCode[] = ['ADMIN', 'OPERATOR', 'CLIENT'];

export interface RolePermissionOption {
  id: number;
  name: string;
}

export interface Role {
  id: string; // RoleCode
  name: string; // etiqueta ya traducida (Administrador/Operario/Cliente)
  description: string;
  permissions: string[]; // nombres de los permisos asignados (para mostrar en la tabla)
  permissionIds: number[]; // ids reales (security.permission), para editar
}

export interface RoleFormValues {
  role: RoleCode;
  permissionIds: number[];
}

// ---------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------

export type UserFilter = 'enabled' | 'registered' | 'disabled';
export const USER_FILTERS: UserFilter[] = ['enabled', 'registered', 'disabled'];

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  createdAt: string; // Formato ISO: YYYY-MM-DD
  invited: boolean; // Se le envió invitación por correo
  active: boolean; // false = inhabilitado
}

export interface UserFormValues {
  name: string;
  email: string;
  roleId: string;
  sendInvitation: boolean;
}

// ---------------------------------------------------------------
// Servicios
// ---------------------------------------------------------------

export type ServiceCategory = 'wash' | 'shine' | 'detail' | 'interior';
export const SERVICE_CATEGORIES: ServiceCategory[] = ['wash', 'shine', 'detail', 'interior'];

// Duraciones disponibles en el selector (en minutos)
export const SERVICE_DURATIONS: number[] = [15, 30, 45, 60, 90, 120];

export interface ManagedService {
  id: string;
  name: string;
  price: number; // COP
  description: string;
  duration: number; // Minutos
  category: ServiceCategory;
  active: boolean;
}

export type ServiceFormValues = Omit<ManagedService, 'id' | 'active'>;

// ---------------------------------------------------------------
// Promociones
// ---------------------------------------------------------------

export type PromotionStatus = 'active' | 'paused' | 'scheduled';
export const PROMOTION_STATUSES: PromotionStatus[] = ['active', 'paused', 'scheduled'];

export type PromotionIcon = 'directions-car' | 'water-drop' | 'auto-awesome';
export const PROMOTION_ICONS: PromotionIcon[] = ['directions-car', 'water-drop', 'auto-awesome'];

export interface Promotion {
  id: string;
  name: string;
  coupon: string;
  description: string;
  price: number; // COP
  duration: number; // Minutos
  icon: PromotionIcon;
  status: PromotionStatus;
  startDate: string; // Formato ISO: YYYY-MM-DD
  featured: boolean;
  benefits: string[];
  redemptions: number; // Cantidad de canjes del cupón
  // cupón real (ADR-015): % de descuento que aplica al canjear y puntos necesarios para
  // desbloquearlo; price/duration/icon/featured/benefits son solo la tarjeta de marketing
  discountPercent: number;
  requiredPoints: number;
}

export type PromotionFormValues = Omit<Promotion, 'id' | 'redemptions'>;

// Métricas generales de las promociones
export interface PromotionMetrics {
  redemptions: number;
  savings: number; // COP
  conversion: number; // Porcentaje
}
