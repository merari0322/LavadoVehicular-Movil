import { useSyncExternalStore } from 'react';
import { bookingService } from '../../core/services/booking/BookingService';
import { EstablishmentResponse } from '../../core/services/booking/booking.types';

// datos reales del negocio (booking-service, tabla booking.establishment). MOV-09: mientras cargan
// (o si falla la red) quedan vacíos y la pantalla muestra "Cargando..." con establishmentText; antes
// se mostraban los de un negocio de ejemplo ("Express Car Wash") como si fueran reales
const EMPTY: EstablishmentResponse = {
  legalName: '',
  tradeName: '',
  taxId: '',
  address: '',
  phone: null,
  email: null,
  logoUrl: null,
  website: null,
  instagram: null,
  facebook: null,
  supportLine: null,
  serviceHoursNote: null,
};

let establishment: EstablishmentResponse = EMPTY;
// ya respondió booking-service (aunque la sede venga con datos vacíos)
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

// pide los datos del negocio una sola vez por sesión
export function loadEstablishment(): Promise<void> {
  if (!loadPromise) {
    loadPromise = bookingService
      .establishment()
      .then((response) => {
        // la sede puede venir con datos vacíos o en null: quedan como texto vacío
        establishment = {
          ...response,
          tradeName: response.tradeName ?? '',
          legalName: response.legalName ?? '',
          taxId: response.taxId ?? '',
          address: response.address ?? '',
        };
        loaded = true;
        notify();
      })
      .catch(() => {
        // sin conexión siguen vacíos; la próxima pantalla que los pida lo vuelve a intentar
        loadPromise = null;
      });
  }
  return loadPromise;
}

// vuelve a pedir la sede (por ejemplo, después de que el admin guarda los datos del negocio)
export function refreshEstablishment(): Promise<void> {
  loadPromise = null;
  return loadEstablishment();
}

// texto de un dato del negocio para pintar: el valor; "Cargando..." mientras no llega, y una raya
// neutra si ya llegó vacío (la sede puede no tener ese dato)
export function establishmentText(value: string | null | undefined, loadingLabel: string): string {
  return value?.trim() || (loaded ? '—' : loadingLabel);
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
