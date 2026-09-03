export type LandingSectionKey = 'nosotros' | 'servicios' | 'contacto';

export interface LandingScreenProps {
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
}
