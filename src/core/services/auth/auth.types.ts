export type UserRole = 'ADMIN' | 'OPERATOR' | 'CLIENT';

// usuario tal como lo devuelve el security-service (/users/me, /auth/login)
export interface AuthUser {
  id: string;
  // nombre completo ya armado, para las pantallas que solo muestran el nombre
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  documentNumber: string;
  phone?: string;
  roles: UserRole[];
  active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone: string | null;
}

export interface Session {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

// códigos que las pantallas de autenticación ya conocían (compatibilidad con el mock)
export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'INVALID_CODE' | 'UNKNOWN';

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}

// contrato del que dependen las pantallas/viewmodels (DIP): no conocen si detrás
// hay un mock local o la API real, solo esta interfaz.
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<Session>;
  register(payload: RegisterPayload): Promise<AuthUser>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  verifyPasswordResetCode(email: string, code: string): Promise<void>;
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
  getProfile(): Promise<AuthUser>;
  updateProfile(payload: UpdateProfilePayload): Promise<AuthUser>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  changeEmail(newEmail: string, currentPassword: string): Promise<AuthUser>;
  deactivateAccount(currentPassword: string): Promise<void>;
}
