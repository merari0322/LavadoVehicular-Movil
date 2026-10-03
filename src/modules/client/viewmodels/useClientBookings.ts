import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
import { ClientBookingItem, toClientBookingItem } from '../models/booking-view';

// reservas reales del cliente contra el booking-service, mismo patrón que useClientVehicles.
export function useClientBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<ClientBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await bookingService.myBookings();
      setBookings(list.map(toClientBookingItem));
    } catch (error) {
      setLoadError(t(apiErrorKey(error)));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // confirmación + cancelación real (POST /bookings/{id}/cancel)
  const cancel = useCallback(
    async (id: number): Promise<string | null> => {
      try {
        await bookingService.cancelMyBooking(id);
        await reload();
        return null;
      } catch (error) {
        return t(apiErrorKey(error));
      }
    },
    [reload, t],
  );

  // calificar queda solo en memoria: el booking-service todavía no guarda calificaciones
  const rate = useCallback((id: number, rating: number, comment: string) => {
    setBookings((prev) => prev.map((item) => (item.id === id ? { ...item, rating, ratingComment: comment } : item)));
  }, []);

  return { bookings, loading, loadError, reload, cancel, rate };
}
