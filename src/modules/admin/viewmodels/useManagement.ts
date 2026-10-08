import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiErrorKey } from '../../../core/api/apiError';
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
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import {
  ManagedService,
  Permission,
  Promotion,
  PromotionFormValues,
  PromotionIcon,
  PromotionMetrics,
  Role,
  RoleFormValues,
  ServiceCategory,
  ServiceFormValues,
} from '../models/management';

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

// Nombre de un permiso en el idioma actual según su code (VIEW_PANELS -> view_panels); si llega
// uno que la app no conoce se muestra el name que manda security-service
export function permissionLabel(permission: PermissionView): string {
  const label = MANAGEMENT_TEXTS.roles.permissions[permission.code.toLowerCase() as Permission];
  return typeof label === 'string' ? label : permission.name;
}

// Permisos de un rol fijo (security-service, ADR-015) -> rol de la pantalla. El nombre del rol y
// el de cada permiso van en el idioma actual: el name de security.permission está solo en español
function toRole(role: BackendRoleCode, matrix: RolePermissionsMatrix, roleLabel: string): Role {
  const assigned = matrix.roles.find((r) => r.role === role);
  const permissionIds = assigned?.permissionIds ?? [];
  const byId = new Map<number, PermissionView>(matrix.permissions.map((p) => [p.id, p]));
  return {
    id: role,
    name: roleLabel,
    description: '',
    permissions: permissionIds.map((id) => {
      const permission = byId.get(id);
      return permission ? permissionLabel(permission) : String(id);
    }),
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
  const { t, i18n } = useTranslation();

  // Permisos de los 3 roles fijos, reales (security-service, ADR-015). Los roles se arman con
  // useMemo para que cambien de idioma sin volver a pedirlos
  const [roleMatrix, setRoleMatrix] = useState<RolePermissionsMatrix>({ permissions: [], roles: [] });
  const [rolesError, setRolesError] = useState<string | null>(null);

  const reloadRoles = useCallback(async () => {
    setRolesError(null);
    try {
      setRoleMatrix(await rolePermissionsService.matrix());
    } catch (error) {
      // sin security-service la pestaña muestra el error en vez de quedar vacía
      setRolesError(apiErrorKey(error));
    }
  }, []);

  useEffect(() => {
    void reloadRoles();
  }, [reloadRoles]);

  const roles = useMemo<Role[]>(
    () => ROLE_CODES.map((role) => toRole(role, roleMatrix, t(`PROFILE.ROLE.${role}`))),
    // i18n.language: al cambiar de idioma se vuelven a traducir los nombres
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roleMatrix, t, i18n.language],
  );
  const permissionsCatalog = roleMatrix.permissions;

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
    rolesError,
    reloadRoles,
    permissionsCatalog,
    services,
    promotions,
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