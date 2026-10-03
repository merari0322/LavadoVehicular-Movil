// modelos del módulo cliente

// avance del servicio según su estado (Confirmado → En lavado → Listo → Finalizado)
export const PROGRESS_BY_STATUS: Record<string, number> = {
  CONFIRMED: 25,
  IN_WASH: 50,
  READY: 75,
  COMPLETED: 100,
};

// vehículo como lo muestra la tarjeta (armado desde la respuesta del customer-service)
export interface VehicleCard {
  id: number;
  type: string;
  // id del tipo de vehículo en el customer-service: el booking-service lo usa para
  // calcular precios y disponibilidad (availability recibe vehicleTypeId)
  typeId: number;
  brand: string;
  model: string;
  plate: string; // con guion para mostrar (ABC-123)
  color: string;
}

// formulario de registrar / editar vehículo
export interface VehicleFormValue {
  type: string;
  brand: string;
  model: string;
  plate: string; // sin guion (ABC123)
  color: string;
}

export const VEHICLE_TYPES = ['CAR', 'SEDAN', 'SUV', 'PICKUP', 'TRUCK', 'MOTO'] as const;

// formatos oficiales de placas en Colombia (mismas reglas que la web)
// carros: 3 letras + 3 números (ABC123) · motos: 3 letras + 2 números + 1 letra (ABC12D)
const CAR_PLATE_REGEX = /^[A-Z]{3}[0-9]{3}$/;
const MOTO_PLATE_REGEX = /^[A-Z]{3}[0-9]{2}[A-Z]$/;
export const PLATE_LENGTH = 6;

export function isValidPlate(plate: string, type: string): boolean {
  return (type === 'MOTO' ? MOTO_PLATE_REGEX : CAR_PLATE_REGEX).test(plate);
}

// deja la placa solo con letras y números en mayúscula ("abc-123" -> "ABC123")
export function normalizePlate(plate: string): string {
  return (plate ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PLATE_LENGTH);
}
