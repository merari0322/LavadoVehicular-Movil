import { useSyncExternalStore } from 'react';
import { bookingService } from '../../core/services/booking/BookingService';
import { EstablishmentResponse } from '../../core/services/booking/booking.types';

// datos reales del negocio (booking-service, tabla booking.establishment). Mientras se carga -o si
// falla la red- se usan estos mismos valores que antes estaban quemados en business.ts, para que
// la pantalla nunca se vea vacía.
const FALLBACK: EstablishmentResponse = {
  legalName: 'Express Car Wash S.A.S.',
  tradeName: 'Express Car Wash',
  taxId: '901.482.930-1',
  address: 'Calle 127 #19A-48, Bogotá, Colombia',
  phone: '+57 312 490 8821',
  email: 'contacto@expresscarwash.co',
  logoUrl: null,
};

let establishment: EstablishmentResponse = FALLBACK;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

// pide los datos del negocio una sola vez por sesión
export function loadEstablishment(): Promise<void> {
  if (!loadPromise) {
    loadPromise = bookingService
      .establishment()
      .then((response) => {
        establishment = response;
        notify();
      })
      .catch(() => {
        // sin conexión se queda con los valores de respaldo; se puede reintentar luego
        loadPromise = null;
      });
  }
  return loadPromise;
}

// hook reactivo: arranca la carga si hace falta y repinta la pantalla cuando llega
export function useEstablishment(): EstablishmentResponse {
  void loadEstablishment();
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => establishment,
    () => establishment,
  );
}
