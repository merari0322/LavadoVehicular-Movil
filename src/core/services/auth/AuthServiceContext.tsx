import React, { createContext, useContext } from 'react';

import { IAuthService } from './auth.types';
import { MockAuthService } from './MockAuthService';

const defaultAuthService: IAuthService = new MockAuthService();

const AuthServiceContext = createContext<IAuthService>(defaultAuthService);

interface AuthServiceProviderProps {
  service?: IAuthService;
  children: React.ReactNode;
}

// permite inyectar una implementación distinta (p.ej. HttpAuthService) sin tocar
// ninguna pantalla ni viewmodel: solo se cambia lo que se pasa aquí (DIP).
export function AuthServiceProvider({ service = defaultAuthService, children }: AuthServiceProviderProps) {
  return <AuthServiceContext.Provider value={service}>{children}</AuthServiceContext.Provider>;
}

export function useAuthService(): IAuthService {
  return useContext(AuthServiceContext);
}
