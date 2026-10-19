import { request } from '../../api/httpClient';
import { AuthUser, UserRole } from '../auth/auth.types';
import { toAuthUser } from '../auth/HttpAuthService';

// cuenta que crea el administrador con roles explícitos (POST /admin/users)
export interface CreateAccountPayload {
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  roles: UserRole[];
}

interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

type BackendUser = Parameters<typeof toAuthUser>[0] & { lastLogin?: string | null; createdAt?: string | null };

export interface AccountSummary extends AuthUser {
  lastLogin: string | null;
  // fecha de registro de la cuenta
  createdAt: string | null;
}

// gestión de cuentas del administrador contra el security-service (/admin/users).
// El backend exige el rol ADMIN en el token; otro rol recibe 403.
export const userAdminService = {
  async listAccounts(page = 0, size = 100): Promise<AccountSummary[]> {
    const response = await request<PageResponse<BackendUser>>('GET', '/admin/users', { query: { page, size } });
    return response.items.map((user) => ({
      ...toAuthUser(user),
      lastLogin: user.lastLogin ?? null,
      createdAt: user.createdAt ?? null,
    }));
  },

  // crea una cuenta con la que la persona ya puede iniciar sesión (ej. un operario nuevo)
  async createAccount(payload: CreateAccountPayload): Promise<AuthUser> {
    return toAuthUser(await request<BackendUser>('POST', '/admin/users', { body: payload }));
  },

  // cambia el tipo de usuario; el backend cierra sus sesiones para que entre con el rol nuevo
  async setRole(userId: string, role: UserRole): Promise<AccountSummary> {
    const user = await request<BackendUser>('PATCH', `/admin/users/${userId}/role`, { body: { role } });
    return { ...toAuthUser(user), lastLogin: user.lastLogin ?? null, createdAt: user.createdAt ?? null };
  },

  // activa o desactiva; al desactivar, el backend también cierra todas sus sesiones
  async setActive(userId: string, active: boolean): Promise<AccountSummary> {
    const user = await request<BackendUser>('PATCH', `/admin/users/${userId}/status`, { body: { active } });
    return { ...toAuthUser(user), lastLogin: user.lastLogin ?? null, createdAt: user.createdAt ?? null };
  },
};
