import {
  AuthError,
  AuthUser,
  IAuthService,
  LoginCredentials,
  RegisterPayload,
} from './auth.types';

const DEMO_USER = {
  email: 'admin@gmail.com',
  password: 'Admin123!',
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// misma "simulación de backend" que hoy tiene la web (login.ts): mismo usuario demo,
// registro y recuperación de contraseña siempre exitosos. Se reemplaza por una
// implementación real de IAuthService sin tocar pantallas ni viewmodels.
export class MockAuthService implements IAuthService {
  async login({ email, password }: LoginCredentials): Promise<AuthUser> {
    await delay(700);

    if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
      throw new AuthError('INVALID_CREDENTIALS');
    }

    return { id: '1', fullName: 'Administrador Demo', email };
  }

  async register(payload: RegisterPayload): Promise<AuthUser> {
    await delay(1200);
    return {
      id: String(Date.now()),
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
    };
  }

  async requestPasswordReset(_email: string): Promise<void> {
    await delay(600);
  }

  async verifyPasswordResetCode(_email: string, code: string): Promise<void> {
    await delay(500);
    if (code.length !== 6) {
      throw new AuthError('INVALID_CODE');
    }
  }

  async resetPassword(_email: string, _newPassword: string): Promise<void> {
    await delay(800);
  }
}
