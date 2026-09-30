import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { registerAuthHooks } from '../../api/httpClient';
import { clearSession, loadSession, saveSession } from '../../storage/sessionStorage';
import { clearSharedState } from '../../../shared/hooks/useSharedState';
import { AuthUser, IAuthService, LoginCredentials, Session } from './auth.types';
import { HttpAuthService } from './HttpAuthService';

const defaultAuthService: IAuthService = new HttpAuthService();

const AuthServiceContext = createContext<IAuthService>(defaultAuthService);

type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

interface SessionContextValue {
  status: SessionStatus;
  user: AuthUser | null;
  // true cuando la sesión se cerró sola (token vencido o rechazado): el login lo avisa
  expired: boolean;
  signIn: (credentials: LoginCredentials) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  // actualiza el usuario guardado (ej. después de editar el perfil o cambiar el correo)
  updateUser: (user: AuthUser) => void;
  // limpia la sesión del celular sin llamar al servidor (ej. cuenta ya desactivada)
  endSessionLocally: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface AuthServiceProviderProps {
  service?: IAuthService;
  children: React.ReactNode;
}

// provee el servicio de autenticación y la sesión del usuario a toda la app.
// Se puede inyectar otra implementación de IAuthService (ej. un mock en pruebas) (DIP).
export function AuthServiceProvider({ service = defaultAuthService, children }: AuthServiceProviderProps) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [expired, setExpired] = useState(false);

  // el cliente HTTP lee el token de aquí sin depender de React
  const sessionRef = useRef<Session | null>(null);
  sessionRef.current = session;

  const applySession = useCallback(async (next: Session | null) => {
    setSession(next);
    if (next) {
      await saveSession(next);
      setStatus('signedIn');
    } else {
      await clearSession();
      // los datos en memoria de la sesión anterior no pasan a la siguiente
      clearSharedState();
      setStatus('signedOut');
    }
  }, []);

  const expire = useCallback(() => {
    setExpired(true);
    void applySession(null);
  }, [applySession]);

  // al abrir la app: recupera la sesión guardada si el token sigue vigente
  useEffect(() => {
    loadSession().then((saved) => {
      if (saved) {
        setSession(saved as Session);
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    });
  }, []);

  useEffect(() => {
    registerAuthHooks({
      getToken: () => sessionRef.current?.accessToken ?? null,
      onUnauthorized: expire,
    });
  }, [expire]);

  // cierra la sesión justo cuando vence el token (dura 1 hora, ADR-006)
  useEffect(() => {
    if (!session) return undefined;
    const msLeft = new Date(session.expiresAt).getTime() - Date.now();
    const timer = setTimeout(expire, Math.max(msLeft, 0));
    return () => clearTimeout(timer);
  }, [session, expire]);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const next = await service.login(credentials);
    setExpired(false);
    await applySession(next);
    return next.user;
  }, [service, applySession]);

  const signOut = useCallback(async () => {
    await service.logout();
    setExpired(false);
    await applySession(null);
  }, [service, applySession]);

  const updateUser = useCallback((user: AuthUser) => {
    const current = sessionRef.current;
    if (current) void applySession({ ...current, user });
  }, [applySession]);

  const endSessionLocally = useCallback(async () => {
    setExpired(false);
    await applySession(null);
  }, [applySession]);

  const value = useMemo<SessionContextValue>(() => ({
    status,
    user: session?.user ?? null,
    expired,
    signIn,
    signOut,
    updateUser,
    endSessionLocally,
  }), [status, session, expired, signIn, signOut, updateUser, endSessionLocally]);

  return (
    <AuthServiceContext.Provider value={service}>
      <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
    </AuthServiceContext.Provider>
  );
}

export function useAuthService(): IAuthService {
  return useContext(AuthServiceContext);
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de AuthServiceProvider');
  }
  return context;
}
