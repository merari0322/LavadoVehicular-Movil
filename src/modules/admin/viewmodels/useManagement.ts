import { useCallback, useEffect, useMemo, useState } from 'react';
import { bookingService } from '../../../core/services/booking/BookingService';
import {
  CatalogServiceRequest,
  CatalogServiceResponse,
  ServiceCategoryResponse,
} from '../../../core/services/booking/booking.types';
import {
  PromotionView,
  SavePromotionRequest,
  paymentService,
} from '../../../core/services/payments/PaymentService';
import {
  PermissionView,
  RoleCode as BackendRoleCode,
  RolePermissionsMatrix,
  rolePermissionsService,
} from '../../../core/services/users/CustomRoleService';
import { VehicleTypeResponse, vehicleService } from '../../../core/services/vehicles/VehicleService';
import {
  ManagedService,
  Promotion,
  PromotionFormValues,
  PromotionIcon,
  PromotionMetrics,
  Role,
  RoleFormValues,
  ServiceCategory,
  ServiceFormValues,
} from '../models/management';

// etiquetas en español de los 3 roles fijos (ADR-015)
const ROLE_LABELS: Record<BackendRoleCode, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operario',
  CLIENT: 'Cliente',
};

// el formulario no pide fecha de fin (solo activa/pausa); se guarda "sin vencimiento"
const NO_END_DATE = '9999-12-31';
const DEFAULT_ICON: PromotionIcon = 'directions-car';

// Promoción del payment-service -> promoción de la pantalla
function toPromotion(view: PromotionView): Promotion {
  return {
    id: String(view.id),
    name: view.name,
    coupon: view.code,
    description: view.description ?? '',
    price: view.price,
    duration: view.durationMinutes,
    icon: (view.icon as PromotionIcon) ?? DEFAULT_ICON,
    status: view.status,
    startDate: view.validFrom,
    featured: view.featured,
    benefits: view.benefits,
    redemptions: view.redemptions,
    discountPercent: view.discountPercent,
    requiredPoints: view.requiredPoints,
  };
}

// Promoción de la pantalla -> lo que espera el backend al guardar
function toSaveRequest(values: PromotionFormValues): SavePromotionRequest {
  return {
    code: values.coupon,
    name: values.name,
    description: values.description.trim() || null,
    price: values.price,
    durationMinutes: values.duration,
    icon: values.icon,
    featured: values.featured,
    benefits: values.benefits,
    validFrom: values.startDate,
    validTo: NO_END_DATE,
    discountPercent: values.discountPercent,
    requiredPoints: values.requiredPoints,
  };
}

// Permisos de un rol fijo (security-service, ADR-015) -> rol de la pantalla
function toRole(role: BackendRoleCode, matrix: RolePermissionsMatrix): Role {
  const assigned = matrix.roles.find((r) => r.role === role);
  const permissionIds = assigned?.permissionIds ?? [];
  const byId = new Map<number, PermissionView>(matrix.permissions.map((p) => [p.id, p]));
  return {
    id: role,
    name: ROLE_LABELS[role],
    description: '',
    permissions: permissionIds.map((id) => byId.get(id)?.name ?? String(id)),
    permissionIds,
  };
}

// Códigos de categoría del booking-service (seed 103: LAVADO, POLICHADO, DETALLADO, INTERIOR)
// y su equivalente en las pantallas de la app
const CATEGORY_BY_CODE: Record<string, ServiceCategory> = {
  LAVADO: 'wash',
  POLICHADO: 'shine',
  DETALLADO: 'detail',
  INTERIOR: 'interior',
};
const CODE_BY_CATEGORY: Record<ServiceCategory, string> = {
  wash: 'LAVADO',
  shine: 'POLICHADO',
  detail: 'DETALLADO',
  interior: 'INTERIOR',
};

// Servicio del booking-service -> servicio de la pantalla. Se muestra el precio y la
// duración mínimos entre los tipos de vehículo (el formulario de la app usa uno solo).
function toManagedService(service: CatalogServiceResponse): ManagedService {
  const prices = service.prices ?? [];
  return {
    id: String(service.id),
    name: service.name,
    price: prices.length ? Math.round(Math.min(...prices.map((item) => item.price))) : 0,
    description: service.description ?? '',
    duration: prices.length ? Math.min(...prices.map((item) => item.estimatedMinutes)) : 30,
    category: CATEGORY_BY_CODE[service.category?.code ?? ''] ?? 'wash',
    active: service.active,
  };
}

// El formulario de la app pide un precio y una duración únicos; al guardar se replican
// a todos los tipos de vehículo del catálogo (customer-service).
function buildServiceRequest(
  values: ServiceFormValues,
  categories: ServiceCategoryResponse[],
  vehicleTypes: VehicleTypeResponse[],
): CatalogServiceRequest {
  const category = categories.find((item) => item.code === CODE_BY_CATEGORY[values.category]);
  return {
    name: values.name,
    description: values.description.trim() || null,
    categoryId: category?.id ?? 0,
    prices: vehicleTypes.map((vehicleType) => ({
      vehicleTypeId: vehicleType.id,
      price: values.price,
      estimatedMinutes: values.duration,
    })),
  };
}

const ROLE_CODES: BackendRoleCode[] = ['ADMIN', 'OPERATOR', 'CLIENT'];

// Hook con el estado y la lógica de la pantalla de gestión
export function useManagement() {
  // Permisos de los 3 roles fijos, reales (security-service, ADR-015)
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionView[]>([]);

  const reloadRoles = useCallback(async () => {
    const matrix = await rolePermissionsService.matrix();
    setPermissionsCatalog(matrix.permissions);
    setRoles(ROLE_CODES.map((role) => toRole(role, matrix)));
  }, []);

  useEffect(() => {
    void reloadRoles();
  }, [reloadRoles]);

  // Promociones reales del payment-service (migración 017)
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionMetrics, setPromotionMetrics] = useState<PromotionMetrics>({
    redemptions: 0,
    savings: 0,
    conversion: 0,
  });

  const reloadPromotions = useCallback(async () => {
    const [list, metrics] = await Promise.all([paymentService.promotions(), paymentService.promotionMetrics()]);
    setPromotions(list.map(toPromotion));
    setPromotionMetrics(metrics);
  }, []);

  useEffect(() => {
    void reloadPromotions();
  }, [reloadPromotions]);

  // Servicios reales del booking-service. Categorías y tipos de vehículo se cargan junto
  // con el catálogo para poder armar las tarifas al crear/editar.
  const [services, setServices] = useState<ManagedService[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryResponse[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Carga el catálogo de servicios más las categorías y los tipos de vehículo
  const reloadServices = useCallback(async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const [serviceList, categoryList, typeList] = await Promise.all([
        bookingService.adminServices(),
        bookingService.categories(),
        vehicleService.listVehicleTypes(),
      ]);
      setServices(serviceList.map(toManagedService));
      setServiceCategories(categoryList);
      setVehicleTypes(typeList);
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : String(error));
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadServices();
  }, [reloadServices]);

  // ---------------------------------------------------------------
  // Datos calculados
  // ---------------------------------------------------------------

  // Cantidad de usuarios por rol (para la pestaña de roles). Los 3 roles son fijos (ADR-015) y
  // sí tienen cuentas reales asignadas (useUserAccounts.ts), pero ese hook vive aparte y esta
  // pantalla no lo consume todavía, así que por ahora queda en 0 (no bloquea nada: los roles ya
  // no se pueden borrar de todos modos).
  const roleUserCounts = useMemo<Record<string, number>>(() => ({}), []);

  // ---------------------------------------------------------------
  // Roles (security-service, ADR-015): los 3 roles son fijos, solo se editan sus permisos
  // ---------------------------------------------------------------

  const updateRole = async (values: RoleFormValues) => {
    await rolePermissionsService.update(values.role, values.permissionIds);
    await reloadRoles();
  };

  // ---------------------------------------------------------------
  // Servicios (catálogo real del booking-service)
  // ---------------------------------------------------------------

  const createService = async (values: ServiceFormValues) => {
    const created = await bookingService.createService(
      buildServiceRequest(values, serviceCategories, vehicleTypes),
    );
    setServices((prev) => [...prev, toManagedService(created)]);
  };

  const updateService = async (id: string, values: ServiceFormValues) => {
    const updated = await bookingService.updateService(
      Number(id),
      buildServiceRequest(values, serviceCategories, vehicleTypes),
    );
    setServices((prev) =>
      prev.map((item) => (item.id === String(updated.id) ? toManagedService(updated) : item)),
    );
  };

  // Activa o pausa el servicio
  const toggleServiceActive = async (id: string) => {
    const target = services.find((item) => item.id === id);
    if (!target) return;
    const updated = await bookingService.setServiceActive(Number(id), !target.active);
    setServices((prev) =>
      prev.map((item) => (item.id === String(updated.id) ? toManagedService(updated) : item)),
    );
  };

  const deleteService = async (id: string) => {
    await bookingService.deleteService(Number(id));
    setServices((prev) => prev.filter((item) => item.id !== id));
  };

  // ---------------------------------------------------------------
  // Promociones (payment-service, migración 017)
  // ---------------------------------------------------------------

  const createPromotion = async (values: PromotionFormValues) => {
    await paymentService.createPromotion(toSaveRequest(values));
    await reloadPromotions();
  };

  const updatePromotion = async (id: string, values: PromotionFormValues) => {
    await paymentService.updatePromotion(Number(id), toSaveRequest(values));
    await reloadPromotions();
  };

  // la pantalla solo alterna activa/pausada; "scheduled" sale sola cuando la fecha es futura
  const changePromotionStatus = async (id: string, status: Promotion['status']) => {
    await paymentService.setPromotionActive(Number(id), status !== 'paused');
    await reloadPromotions();
  };

  const deletePromotion = async (id: string) => {
    await paymentService.deletePromotion(Number(id));
    await reloadPromotions();
  };

  return {
    // Datos
    roles,
    permissionsCatalog,
    services,
    promotions,
    roleUserCounts,
    promotionMetrics,
    // Roles
    updateRole,
    // Servicios
    servicesLoading,
    servicesError,
    reloadServices,
    createService,
    updateService,
    toggleServiceActive,
    deleteService,
    // Promociones
    createPromotion,
    updatePromotion,
    changePromotionStatus,
    deletePromotion,
  };
}