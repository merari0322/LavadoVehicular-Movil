import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
// calificaciones reales que dejaron los clientes (operations-service)
import { operationsService, RatingResponse } from '../../../core/services/operations/OperationsService';
import { displayToISO } from '../../../shared/utils/format';
import { RatingItem } from '../models/operator';

export function toRatingItem(r: RatingResponse): RatingItem {
  return {
    id: r.bookingId,
    // nombre del cliente y la placa de su vehículo (si no hay nombre, solo la placa)
    client: r.clientName ? `${r.clientName} · ${r.plate}` : r.plate || '—',
    service: r.services,
    date: r.date,
    rating: r.rating,
    comment: r.comment ?? '',
    duration: '',
    serviceId: r.bookingCode,
  };
}

// promedio con un decimal (0 sin calificaciones): una sola regla para el inicio y las calificaciones
export function averageRating(ratings: { rating: number }[]): number {
  if (ratings.length === 0) return 0;
  return Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10;
}

// ViewModel de las calificaciones del operario (MOV-04): las carga, calcula el promedio y la
// satisfacción, y filtra por fecha, servicio y estrellas. Antes la pantalla llamaba al servicio
// y el inicio repetía el cálculo del promedio
export function useOperatorRatings() {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setRatings((await operationsService.myRatings()).map(toRatingItem));
      setLoadError(null);
    } catch (error) {
      setLoadError(t(apiErrorKey(error)));
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const [date, setDate] = useState('');
  const [type, setType] = useState('');
  const [stars, setStars] = useState('');

  // nombres de servicio que aparecen en sus calificaciones
  const serviceTypes = useMemo(() => [...new Set(ratings.map((r) => r.service))], [ratings]);

  const average = averageRating(ratings);
  // satisfacción: porcentaje del promedio sobre 5 estrellas
  const satisfaction = Math.round((average / 5) * 100);

  const visible = useMemo(() => {
    const iso = displayToISO(date);
    return ratings.filter((r) => {
      if (iso && r.date !== iso) return false;
      if (type && r.service !== type) return false;
      if (stars && r.rating !== Number(stars)) return false;
      return true;
    });
  }, [ratings, date, type, stars]);

  const hasFilters = date !== '' || type !== '' || stars !== '';
  const clear = () => {
    setDate('');
    setType('');
    setStars('');
  };

  return {
    ratings,
    loadError,
    reload,
    average,
    satisfaction,
    serviceTypes,
    visible,
    date,
    setDate,
    type,
    setType,
    stars,
    setStars,
    hasFilters,
    clear,
  };
}
