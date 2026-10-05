import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
import { bookingService } from '../../../core/services/booking/BookingService';
// calificaciones del cliente (operations-service)
import { operationsService, RatingResponse } from '../../../core/services/operations/OperationsService';
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
      // si operations no responde, las reservas se muestran igual (sin calificaciones)
      const [list, given] = await Promise.all([
        bookingService.myBookings(),
        operationsService.givenRatings().catch(() => [] as RatingResponse[]),
      ]);
      const byBooking = new Map(given.map((r) => [r.bookingId, r]));
      setBookings(
        list.map((b) => {
          const item = toClientBookingItem(b);
          const r = byBooking.get(item.id);
          return r ? { ...item, rating: r.rating, ratingComment: r.comment ?? undefined } : item;
        }),
      );
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

  // califica en operations-service (una sola vez y solo si está finalizada: lo valida el backend).
  // Devuelve null si quedó guardada o el texto del error.
  const rate = useCallback(
    async (id: number, rating: number, comment: string): Promise<string | null> => {
      try {
        const saved = await operationsService.rate(id, rating, comment || null);
        setBookings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, rating: saved.rating, ratingComment: saved.comment ?? undefined } : item)),
        );
        return null;
      } catch (error) {
        return t(apiErrorKey(error));
      }
    },
    [t],
  );

  return { bookings, loading, loadError, reload, cancel, rate };
}
