import { request } from '../../api/httpClient';
import {
  AuthUser,
  IAuthService,
  LoginCredentials,
  RegisterPayload,
  Session,
  UpdateProfilePayload,
  UserRole,
} from './auth.types';

// forma exacta en que responde el security-service
interface BackendUser {
  id: number;
  email: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  roles: UserRole[];
  active: boolean;
}

interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: BackendUser;
}

export function toAuthUser(user: BackendUser): AuthUser {
  return {
    id: String(user.id),
    fullName: `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    documentNumber: user.documentNumber,
    phone: user.phone ?? undefined,
    roles: user.roles,
    active: user.active,
  };
}

// implementación real de IAuthService contra el security-service (mismos endpoints que la web)
export class HttpAuthService implements IAuthService {
  async login({ email, password }: LoginCredentials): Promise<Session> {
    const response = await request<LoginResponse>('POST', '/auth/login', {
      body: { email, password },
      isPublic: true,
    });
    return { accessToken: response.accessToken, expiresAt: response.expiresAt, user: toAuthUser(response.user) };
  }

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const user = await request<BackendUser>('POST', '/auth/register', { body: payload, isPublic: true });
    return toAuthUser(user);
  }

  // cierra la sesión en el servidor (deja el rastro); si falla, igual se limpia el celular
  async logout(): Promise<void> {
    try {
      await request<void>('POST', '/auth/logout', { body: {} });
    } catch {
      // sin conexión o token vencido: no impide cerrar sesión en el celular
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    await request<void>('POST', '/auth/password/forgot', { body: { email }, isPublic: true });
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    await request<void>('POST', '/auth/password/verify', { body: { email, code }, isPublic: true });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    await request<void>('POST', '/auth/password/reset', { body: { email, code, newPassword }, isPublic: true });
  }

  async getProfile(): Promise<AuthUser> {
    return toAuthUser(await request<BackendUser>('GET', '/users/me'));
  }

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    return toAuthUser(await request<BackendUser>('PATCH', '/users/me', { body: payload }));
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await request<void>('PUT', '/users/me/password', { body: { currentPassword, newPassword } });
  }

  async changeEmail(newEmail: string, currentPassword: string): Promise<AuthUser> {
    return toAuthUser(await request<BackendUser>('PUT', '/users/me/email', { body: { newEmail, currentPassword } }));
  }

  async deactivateAccount(currentPassword: string): Promise<void> {
    await request<void>('POST', '/users/me/deactivate', { body: { currentPassword } });
  }
}
