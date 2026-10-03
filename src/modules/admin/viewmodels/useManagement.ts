import { useCallback, useEffect, useMemo, useState } from 'react';
import { bookingService } from '../../../core/services/booking/BookingService';
import {
  CatalogServiceRequest,
  CatalogServiceResponse,
  ServiceCategoryResponse,
} from '../../../core/services/booking/booking.types';
import { VehicleTypeResponse, vehicleService } from '../../../core/services/vehicles/VehicleService';
import {
  ManagedService,
  ManagedUser,
  Promotion,
  PromotionFormValues,
  PromotionMetrics,
  PromotionStatus,
  Role,
  RoleFormValues,
  ServiceCategory,
  ServiceFormValues,
  UserFilter,
  UserFormValues,
} from '../models/management';
import {
  INITIAL_PROMOTIONS,
  INITIAL_ROLES,
  INITIAL_USERS,
  PROMOTION_METRICS,
} from '../services/managementMock';
import { getTodayISO } from '../utils/reservationUtils';

// Genera un id único para los registros nuevos (solo los datos que siguen siendo mock)
const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

// Hook con el estado y la lógica de la pantalla de gestión
export function useManagement() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);

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

  // Cantidad de usuarios por rol (para la pestaña de roles)
  const roleUserCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((user) => {
      counts[user.roleId] = (counts[user.roleId] ?? 0) + 1;
    });
    return counts;
  }, [users]);

  // Números de los filtros de usuarios
  const userCounts = useMemo<Record<UserFilter, number>>(
    () => ({
      enabled: users.filter((user) => user.active).length,
      registered: users.filter((user) => user.invited).length,
      disabled: users.filter((user) => !user.active).length,
    }),
    [users],
  );

  // Métricas de promociones
  const promotionMetrics = useMemo<PromotionMetrics>(
    () => ({
      redemptions: promotions.reduce((total, item) => total + item.redemptions, 0),
      savings: PROMOTION_METRICS.savings,
      conversion: PROMOTION_METRICS.conversion,
    }),
    [promotions],
  );

  // ---------------------------------------------------------------
  // Usuarios
  // ---------------------------------------------------------------

  // Indica si un correo ya existe (se ignora el usuario que se está editando)
  const isEmailTaken = (email: string, ignoreId?: string): boolean =>
    users.some(
      (user) => user.id !== ignoreId && user.email.toLowerCase() === email.trim().toLowerCase(),
    );

  const createUser = (values: UserFormValues) =>
    setUsers((prev) => [
      ...prev,
      {
        id: newId('usr'),
        name: values.name,
        email: values.email,
        roleId: values.roleId,
        createdAt: getTodayISO(),
        invited: values.sendInvitation,
        active: true,
      },
    ]);

  const updateUser = (id: string, values: UserFormValues) =>
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, name: values.name, email: values.email, roleId: values.roleId }
          : user,
      ),
    );

  // Habilita o inhabilita la cuenta
  const toggleUserActive = (id: string) =>
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, active: !user.active } : user)));

  const deleteUser = (id: string) => setUsers((prev) => prev.filter((user) => user.id !== id));

  // ---------------------------------------------------------------
  // Roles
  // ---------------------------------------------------------------

  const createRole = (values: RoleFormValues) =>
    setRoles((prev) => [...prev, { id: newId('role'), ...values }]);

  const updateRole = (id: string, values: RoleFormValues) =>
    setRoles((prev) => prev.map((role) => (role.id === id ? { ...role, ...values } : role)));

  // Un rol con usuarios asignados no se puede eliminar (devuelve false)
  const deleteRole = (id: string): boolean => {
    if (users.some((user) => user.roleId === id)) return false;
    setRoles((prev) => prev.filter((role) => role.id !== id));
    return true;
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
  // Promociones
  // ---------------------------------------------------------------

  const createPromotion = (values: PromotionFormValues) =>
    setPromotions((prev) => [...prev, { id: newId('promo'), redemptions: 0, ...values }]);

  const updatePromotion = (id: string, values: PromotionFormValues) =>
    setPromotions((prev) => prev.map((item) => (item.id === id ? { ...item, ...values } : item)));

  const changePromotionStatus = (id: string, status: PromotionStatus) =>
    setPromotions((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));

  const deletePromotion = (id: string) =>
    setPromotions((prev) => prev.filter((item) => item.id !== id));

  return {
    // Datos
    roles,
    users,
    services,
    promotions,
    roleUserCounts,
    userCounts,
    promotionMetrics,
    // Usuarios
    isEmailTaken,
    createUser,
    updateUser,
    toggleUserActive,
    deleteUser,
    // Roles
    createRole,
    updateRole,
    deleteRole,
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