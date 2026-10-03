import { useSyncExternalStore } from 'react';
import { bookingService } from '../../../core/services/booking/BookingService';
import { BayResponse, CatalogServiceResponse } from '../../../core/services/booking/booking.types';

// catálogo real que usan las tarjetas y formularios de reservas para resolver nombres de
// servicios y bahías (antes venían de reservationMock). Se carga una vez por sesión con
// loadReservationCatalog(); las pantallas que necesitan reaccionar usan useReservationCatalog().
let services: CatalogServiceResponse[] = [];
let bays: BayResponse[] = [];
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

// pide los servicios y bahías del booking-service (una sola vez por sesión)
export function loadReservationCatalog(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all([bookingService.adminServices(), bookingService.bays()])
      .then(([serviceList, bayList]) => {
        services = serviceList;
        bays = bayList;
        notify();
      })
      .catch((error) => {
        // si falla la red se puede volver a intentar en la siguiente carga
        loadPromise = null;
        throw error;
      });
  }
  return loadPromise;
}

// búsquedas no reactivas: sirven mientras la pantalla ya se re-renderiza con los datos
export function getServiceById(id: string): CatalogServiceResponse | undefined {
  return services.find((item) => String(item.id) === String(id));
}

export function getBayById(id: string): BayResponse | undefined {
  return bays.find((item) => String(item.id) === String(id));
}

// hook reactivo: devuelve la foto actual y repinta la pantalla cuando llega el catálogo
export function useReservationCatalog(): { services: CatalogServiceResponse[]; bays: BayResponse[] } {
  useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    () => services,
    () => services,
  );
  return { services, bays };
}