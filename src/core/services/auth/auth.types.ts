export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'INVALID_CODE' | 'UNKNOWN';

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}

// contrato del que dependen las pantallas/viewmodels (DIP): no conocen si detrás
// hay un mock local o una API real, solo esta interfaz.
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  register(payload: RegisterPayload): Promise<AuthUser>;
  requestPasswordReset(email: string): Promise<void>;
  verifyPasswordResetCode(email: string, code: string): Promise<void>;
  resetPassword(email: string, newPassword: string): Promise<void>;
}
