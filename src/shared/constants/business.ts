import { MaterialIcons } from '@expo/vector-icons';

// datos del negocio que usa la web en core/constants (mismos valores)
// TODO: traerlos del backend / "Datos del negocio" del administrador

// sede única del lavadero: el cliente lleva su vehículo (el servicio NO es a domicilio)
export const BUSINESS_LOCATION = {
  name: 'Express Car Wash',
  address: 'Calle 127 #19A-48, Bogotá, Colombia',
};

// canales de atención (Centro de ayuda)
export const BUSINESS_CONTACT = {
  whatsapp: '+57 312 490 8821',
  supportLine: '018000-123-456',
  email: 'contacto@expresscarwash.co',
};

// precio de cada servicio en COP
export const SERVICE_PRICES: Record<string, number> = {
  BASIC: 20000,
  PREMIUM: 35000,
  FULL: 50000,
};

export const SERVICE_TYPES = ['BASIC', 'PREMIUM', 'FULL'] as const;

// ícono según el tipo de vehículo
export function vehicleIcon(type: string): keyof typeof MaterialIcons.glyphMap {
  if (type === 'MOTO') return 'two-wheeler';
  if (type === 'TRUCK' || type === 'PICKUP') return 'local-shipping';
  return 'directions-car';
}
