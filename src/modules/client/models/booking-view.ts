import { BookingResponse, BookingStatusCode } from '../../../core/services/booking/booking.types';
import { isActiveStatus, isoToDisplayDate, vehicleLabel } from '../../../core/services/booking/bookingDisplay';
import { BookingPaymentState, ClientPayment } from '../../../core/services/payments/PaymentService';

export type ClientPaymentStatus = ClientPayment['status'];

// fila del historial del cliente: la reserva cruda del backend ya lista para pintar.
// el booking-service no maneja el estado de pago: el último pago y si la reserva todavía se puede
// pagar los dice payment-service (GET /payments/me/bookings). La app no repite esa regla.
export interface ClientBookingItem {
  id: number;
  code: string;
  status: BookingStatusCode;
  date: string; // aaaa-mm-dd: se usa para el filtro por fecha
  displayDate: string; // dd/mm/aaaa
  timeRange: string; // "08:00 - 08:45"
  services: string[]; // nombres de los servicios
  vehicle: string;
  plate: string;
  subtotal: number;
  // descuento por puntos redimidos (booking.pointsDiscountAmount)
  pointsDiscount: number;
  total: number;
  // estado del último pago de la reserva (null = todavía no hay pago)
  paymentStatus: ClientPaymentStatus | null;
  canPay: boolean;
  canCancel: boolean;
  canRate: boolean;
  rating?: number;
  ratingComment?: string;
}

/** @param payment estado del pago de la reserva según payment-service (null si no respondió) */
export function toClientBookingItem(
  booking: BookingResponse,
  payment: BookingPaymentState | null = null,
): ClientBookingItem {
  const active = isActiveStatus(booking.status);
  return {
    id: booking.id,
    code: booking.code,
    status: booking.status,
    date: booking.date,
    displayDate: isoToDisplayDate(booking.date),
    timeRange: `${booking.startTime} - ${booking.endTime}`,
    services: booking.services.map((service) => service.name),
    vehicle: vehicleLabel(booking.vehicle),
    plate: booking.vehicle?.licensePlateFormatted ?? '',
    subtotal: booking.subtotal,
    pointsDiscount: booking.pointsDiscountAmount,
    total: booking.total,
    paymentStatus: payment?.paymentStatus ?? null,
    // sin respuesta de payment-service no se ofrece pagar: de todos modos no se podría
    canPay: payment?.payable ?? false,
    // changeable lo decide el backend (RF-007: ni empezada ni pasada)
    canCancel: active && booking.changeable,
    canRate: booking.status === 'COMPLETED',
  };
}
