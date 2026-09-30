import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
import { UserRole } from '../../../core/services/auth';
import { AccountSummary, CreateAccountPayload, userAdminService } from '../../../core/services/users/UserAdminService';
import { ManagedUser, Role, UserFilter } from '../models/management';

// los 3 roles fijos del sistema (security.role); crear roles nuevos no existe (ADR-010)
const ROLE_IDS: UserRole[] = ['ADMIN', 'OPERATOR', 'CLIENT'];

// los roles con su nombre en el idioma actual (PROFILE.ROLE.*)
export function useSystemRoles(): Role[] {
  const { t } = useTranslation();
  return useMemo(
    () => ROLE_IDS.map((id) => ({ id, name: t(`PROFILE.ROLE.${id}`), description: '', permissions: [] })),
    [t],
  );
}

function mainRole(roles: UserRole[]): UserRole {
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('OPERATOR')) return 'OPERATOR';
  return 'CLIENT';
}

// convierte la cuenta del backend al formato que usa la lista de usuarios
function toManagedUser(account: AccountSummary): ManagedUser {
  return {
    id: account.id,
    name: account.fullName,
    email: account.email,
    roleId: mainRole(account.roles),
    // la base todavía no guarda la fecha de registro: se muestra el último ingreso
    createdAt: account.lastLogin ? account.lastLogin.slice(0, 10) : '—',
    invited: false,
    active: account.active,
  };
}

// cuentas reales del security-service para la pestaña "Usuarios" de Gestión
export function useUserAccounts() {
  const { t } = useTranslation();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const accounts = await userAdminService.listAccounts();
      setUsers(accounts.map(toManagedUser));
    } catch (error) {
      setLoadError(t(apiErrorKey(error)));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const counts = useMemo<Record<UserFilter, number>>(() => ({
    enabled: users.filter((user) => user.active).length,
    registered: users.filter((user) => user.invited).length,
    disabled: users.filter((user) => !user.active).length,
  }), [users]);

  // devuelve el mensaje de error, o null si la cuenta se creó
  const createAccount = useCallback(async (payload: CreateAccountPayload): Promise<string | null> => {
    try {
      await userAdminService.createAccount(payload);
      await reload();
      return null;
    } catch (error) {
      return t(apiErrorKey(error));
    }
  }, [reload, t]);

  // devuelve el mensaje de error, o null si se cambió el estado
  const toggleActive = useCallback(async (id: string): Promise<string | null> => {
    const user = users.find((item) => item.id === id);
    if (!user) return null;
    try {
      const updated = await userAdminService.setActive(id, !user.active);
      setUsers((prev) => prev.map((item) => (item.id === id ? toManagedUser(updated) : item)));
      return null;
    } catch (error) {
      return t(apiErrorKey(error));
    }
  }, [users, t]);

  return { users, counts, loading, loadError, reload, createAccount, toggleActive };
}
