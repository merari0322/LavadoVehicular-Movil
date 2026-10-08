import { MaterialIcons } from '@expo/vector-icons';

// el nombre, dirección, teléfono y correo del negocio (antes quemados aquí) ahora vienen del
// booking-service: ver shared/services/establishmentCatalog.ts (useEstablishment()).
// Los precios y tipos de servicio también vienen del catálogo real (bookingService.adminServices()).

// ícono según el tipo de vehículo
export function vehicleIcon(type: string): keyof typeof MaterialIcons.glyphMap {
  if (type === 'MOTO') return 'two-wheeler';
  if (type === 'TRUCK' || type === 'PICKUP') return 'local-shipping';
  return 'directions-car';
}
