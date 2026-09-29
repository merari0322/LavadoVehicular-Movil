import { ChartPoint } from '../models/reports';

// Formatea un valor en pesos con punto de miles: 330000 -> $330.000
export const formatCurrency = (value: number): string =>
  `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

// Suma los servicios y los ingresos de una lista de puntos
export const sumPoints = (points: ChartPoint[]) =>
  points.reduce(
    (total, point) => ({
      services: total.services + point.services,
      revenue: total.revenue + point.revenue,
    }),
    { services: 0, revenue: 0 },
  );

// Marcas del eje Y (de menor a mayor) para el valor máximo de servicios
export const buildAxisTicks = (max: number): number[] => {
  const step = Math.max(1, Math.ceil(max / 5));
  const count = Math.max(1, Math.ceil(max / step));
  return Array.from({ length: count + 1 }, (_, index) => index * step);
};
