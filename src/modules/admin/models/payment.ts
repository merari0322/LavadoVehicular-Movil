// Modelos y tipos del módulo de pagos

// pending agrupa PENDING e IN_REVIEW de payment-service (los dos esperan decisión del admin)
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type PaymentMethod = 'cash' | 'nequi' | 'daviplata' | 'bancolombia';

// Orden en el que aparecen las opciones en los selectores
export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'approved', 'rejected', 'refunded'];
export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'nequi', 'daviplata', 'bancolombia'];

export interface Payment {
  id: string;
  code: string; // Ejemplo: #PAG-4902
  customerName: string;
  document: string; // Documento de identidad del cliente
  phone: string;
  email: string;
  reference: string; // Referencia de la transacción (ej. NQ-8841920)
  method: PaymentMethod;
  amount: number; // Monto a pagar según el servicio (COP)
  declaredAmount: number | null; // Monto que el cliente dice haber pagado (COP); null si no lo indicó
  date: string; // Formato ISO: YYYY-MM-DD
  time: string; // Formato HH:mm
  serviceName: string;
  vehicle: string;
  plate: string;
  reservationCode: string; // Cita vinculada (ej. #RES-8921)
  scheduleStart: string; // HH:mm
  scheduleEnd: string; // HH:mm
  bay: string;
  operator: string;
  status: PaymentStatus;
  rejectionReason: string;
  auditedBy: string;
  // imagen real del comprobante (payment-service); null en pagos registrados en caja
  receiptImage?: string | null;
  // titular de la cuenta que recibió el pago
  payee?: string;
}

// Datos del formulario de pago manual
// pago recibido en caja: reserva real y cuenta del lavadero; el monto lo pone payment-service
export interface ManualPaymentValues {
  bookingId: number;
  paymentAccountId: number;
  // opcional: payment-service la usa para no aceptar la misma transferencia en dos reservas
  transactionReference: string | null;
}

// Filtros de la lista de pagos
export interface PaymentFilters {
  search: string;
  method: '' | PaymentMethod; // '' = todos
  status: '' | PaymentStatus; // '' = todos
}

// Números de las tarjetas de estadísticas
export interface PaymentStatsData {
  pending: number;
  approved: number;
  rejected: number;
  collected: number; // Suma de los pagos aprobados hoy
  transactions: number; // Pagos registrados hoy
}
