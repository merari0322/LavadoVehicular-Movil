import { useMemo, useState } from 'react';
import {
  ManagedService,
  ManagedUser,
  Promotion,
  PromotionFormValues,
  PromotionMetrics,
  PromotionStatus,
  Role,
  RoleFormValues,
  ServiceFormValues,
  UserFilter,
  UserFormValues,
} from '../models/management';
import {
  INITIAL_PROMOTIONS,
  INITIAL_ROLES,
  INITIAL_SERVICES,
  INITIAL_USERS,
  PROMOTION_METRICS,
} from '../services/managementMock';
import { getTodayISO } from '../utils/reservationUtils';

// Genera un id único para los registros nuevos
const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Hook con el estado y la lógica de la pantalla de gestión
export function useManagement() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [services, setServices] = useState<ManagedService[]>(INITIAL_SERVICES);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);

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
  // Servicios
  // ---------------------------------------------------------------

  const createService = (values: ServiceFormValues) =>
    setServices((prev) => [...prev, { id: newId('srv'), active: true, ...values }]);

  const updateService = (id: string, values: ServiceFormValues) =>
    setServices((prev) => prev.map((item) => (item.id === id ? { ...item, ...values } : item)));

  // Activa o pausa el servicio
  const toggleServiceActive = (id: string) =>
    setServices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );

  const deleteService = (id: string) =>
    setServices((prev) => prev.filter((item) => item.id !== id));

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
