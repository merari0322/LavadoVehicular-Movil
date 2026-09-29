// Modelos y tipos del módulo de gestión (usuarios, roles, servicios y promociones)

export type ManagementTab = 'users' | 'roles' | 'services' | 'promotions';
export const MANAGEMENT_TABS: ManagementTab[] = ['users', 'roles', 'services', 'promotions'];

// ---------------------------------------------------------------
// Roles
// ---------------------------------------------------------------

export type Permission = 'view_panels' | 'create_records' | 'edit_data' | 'delete';
export const PERMISSIONS: Permission[] = ['view_panels', 'create_records', 'edit_data', 'delete'];

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export type RoleFormValues = Omit<Role, 'id'>;

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
}

export type PromotionFormValues = Omit<Promotion, 'id' | 'redemptions'>;

// Métricas generales de las promociones
export interface PromotionMetrics {
  redemptions: number;
  savings: number; // COP
  conversion: number; // Porcentaje
}
