import { PAYMENT_API_URL } from '../../api/config';
import { request } from '../../api/httpClient';
import { Page } from '../../api/pagination';

// habla con payment-service, mismos endpoints que la web. El monto a cobrar lo pone el backend con
// el total de la reserva; aquí viajan la reserva, la cuenta, la referencia, el comprobante y el
// monto que el cliente dice haber pagado (el admin compara ambos al revisar).

// formatos de imagen para el QR y el comprobante (payment-service no acepta SVG ni otros)
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

export interface PaymentAccount {
  id: number;
  methodCode: string; // NEQUI, DAVIPLATA, TRANSFERENCIA, EFECTIVO
  methodName: string;
  accountHolder: string;
  accountNumber: string | null;
  qrImageUrl: string | null;
  instructions: string | null;
  active: boolean;
  requiresReceipt: boolean;
}

export interface PaymentBookingInfo {
  id: number;
  code: string;
  status: string;
  total: number;
  date: string;
  startTime: string;
  services: string;
  vehicle: string;
  plate: string;
  ownerUserId: number | null;
}

// pago como lo devuelve payment-service (cliente y admin)
export interface PaymentView {
  id: number;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  amount: number;
  processedAtUtc: string | null;
  rejectionReason: string | null;
  transactionReference: string | null;
  // lo que el cliente dice que pagó según su comprobante (null si no lo indicó); amount es lo esperado
  reportedAmount: number | null;
  receiptImage: string | null;
  reportedAtUtc: string | null;
  account: PaymentAccount | null;
  booking: PaymentBookingInfo | null;
  // E-10: la cola del admin no trae la imagen (receiptImage null) y dice aquí si la tiene
  hasReceiptImage?: boolean;
  // BIZ-07: la reserva de este pago se canceló (el admin debe reembolsar o rechazar)
  bookingCancelled?: boolean;
}

// lo que falta por pagar de una reserva: su total menos los cupones canjeados
export interface AmountDue {
  bookingId: number;
  bookingTotal: number;
  appliedDiscounts: number;
  amountDue: number;
}

// cupón canjeado en una reserva (E-09: como máximo uno por reserva)
export interface AppliedRedemption {
  promotionId: number;
  promotionCode: string;
  promotionName: string;
  discountAmount: number;
}

// lo que el cliente debe hoy por su reserva y el cupón que tiene aplicado (BIZ-02). Lo calcula
// payment-service: la app muestra amountDue tal cual y nunca saca el total por su cuenta
export interface BookingAmountDue extends AmountDue {
  redemption: AppliedRedemption | null;
}

export interface SaveAccountRequest {
  methodCode: string;
  accountHolder: string;
  accountNumber: string | null;
  qrImageUrl: string | null;
  instructions: string | null;
  active: boolean;
}

// D-01: PERCENT = porcentaje (1 a 99) y FIXED = monto en pesos; discountValue es el valor real
export type DiscountType = 'PERCENT' | 'FIXED';

// paquete a precio fijo (admin, Gestión > Promociones). status se calcula en el backend.
export interface PromotionView {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  featured: boolean;
  benefits: string[];
  validFrom: string; // ISO yyyy-MM-dd
  validTo: string;
  status: 'active' | 'scheduled' | 'paused';
  redemptions: number;
  // cupón real (ADR-015): % de descuento que aplica al canjear, y puntos necesarios para
  // desbloquearlo; icon/featured/benefits son solo la tarjeta. price y durationMinutes ya no se
  // usan: payment-service los acepta vacíos y la app no los envía
  discountPercent: number;
  requiredPoints: number;
  // D-01: el descuento real; discountPercent vale 0 en un FIXED (un backend viejo no los manda)
  discountType?: DiscountType;
  discountValue?: number;
}

export interface PromotionMetrics {
  redemptions: number;
  savings: number;
}

export interface SavePromotionRequest {
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  featured: boolean;
  benefits: string[];
  validFrom: string;
  validTo: string;
  discountPercent: number;
  requiredPoints: number;
  // D-01: se mandan tal cual, para que un FIXED no se convierta en porcentaje al editarlo
  discountType: DiscountType;
  discountValue: number;
}

// fidelización y cupones del cliente (payment-service, /api/v1/loyalty, ADR-015)
export interface LoyaltyBalance {
  points: number;
}

export interface PromotionForCustomer {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  featured: boolean;
  benefits: string[];
  discountPercent: number;
  requiredPoints: number;
  unlocked: boolean;
  // D-01: el descuento real (un cupón FIXED se muestra en pesos, no como "0 %")
  discountType?: DiscountType;
  discountValue?: number;
}

export interface RedeemPromotionResult {
  promotionId: number;
  promotionCode: string;
  promotionName: string;
  discountAmount: number;
  newTotal: number;
}

export interface ClientPayment {
  id: number;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  amount: number;
  rejectionReason: string | null;
  booking: { id: number; code: string } | null;
}

// cómo va el pago de cada reserva del cliente: último pago (null si no tiene) y si todavía se puede
// pagar. payable lo decide payment-service con su misma regla de reporte
export interface BookingPaymentState {
  bookingId: number;
  paymentStatus: ClientPayment['status'] | null;
  payable: boolean;
}

const base = { baseUrl: PAYMENT_API_URL };

export const paymentService = {
  accounts(): Promise<PaymentAccount[]> {
    return request<PaymentAccount[]>('GET', '/payment-accounts', base);
  },

  mine(): Promise<ClientPayment[]> {
    return request<ClientPayment[]>('GET', '/payments/me', base);
  },

  // por cada reserva del cliente: último pago y si todavía se puede pagar (decide payment-service)
  myBookings(): Promise<BookingPaymentState[]> {
    return request<BookingPaymentState[]>('GET', '/payments/me/bookings', base);
  },

  report(
    bookingId: number,
    paymentAccountId: number,
    transactionReference: string,
    receiptImage: string,
    reportedAmount: number | null = null,
  ): Promise<ClientPayment> {
    return request<ClientPayment>('POST', '/payments', {
      ...base,
      body: { bookingId, paymentAccountId, transactionReference, receiptImage, reportedAmount },
    });
  },

  /* ---------- admin ---------- */

  // E-10: la cola del admin llega por páginas (los más recientes primero) y sin la imagen del
  // comprobante, que pesaba demasiado; la imagen se pide con adminPayment al abrir el detalle
  adminPage(page: number, size: number, status?: PaymentView['status']): Promise<Page<PaymentView>> {
    return request<Page<PaymentView>>('GET', '/admin/payments', { ...base, query: { page, size, status } });
  },

  // un pago con la imagen de su comprobante
  adminPayment(id: number): Promise<PaymentView> {
    return request<PaymentView>('GET', '/admin/payments/' + id, base);
  },

  approve(id: number): Promise<PaymentView> {
    return request<PaymentView>('POST', '/admin/payments/' + id + '/approve', base);
  },

  reject(id: number, reason: string): Promise<PaymentView> {
    return request<PaymentView>('POST', '/admin/payments/' + id + '/reject', { ...base, body: { reason } });
  },

  // devuelve un pago aprobado y revierte los puntos que ganó la reserva (204, sin cuerpo)
  refund(id: number): Promise<void> {
    return request<void>('POST', '/admin/payments/' + id + '/refund', base);
  },

  // monto con el que quedaría un pago en caja (el mismo que usa registerManual)
  amountDue(bookingId: number): Promise<AmountDue> {
    return request<AmountDue>('GET', '/admin/payments/amount-due', { ...base, query: { bookingId } });
  },

  // pago recibido en el lavadero: queda aprobado con lo que falta por pagar de la reserva
  registerManual(bookingId: number, paymentAccountId: number, transactionReference: string | null = null): Promise<PaymentView> {
    return request<PaymentView>('POST', '/admin/payments', {
      ...base,
      body: { bookingId, paymentAccountId, transactionReference },
    });
  },

  adminAccounts(): Promise<PaymentAccount[]> {
    return request<PaymentAccount[]>('GET', '/admin/payment-accounts', base);
  },

  createAccount(body: SaveAccountRequest): Promise<PaymentAccount> {
    return request<PaymentAccount>('POST', '/admin/payment-accounts', { ...base, body });
  },

  updateAccount(id: number, body: SaveAccountRequest): Promise<PaymentAccount> {
    return request<PaymentAccount>('PUT', '/admin/payment-accounts/' + id, { ...base, body });
  },

  /* ---------- promociones (admin) ---------- */

  promotions(): Promise<PromotionView[]> {
    return request<PromotionView[]>('GET', '/admin/promotions', base);
  },

  promotionMetrics(): Promise<PromotionMetrics> {
    return request<PromotionMetrics>('GET', '/admin/promotions/metrics', base);
  },

  createPromotion(body: SavePromotionRequest): Promise<PromotionView> {
    return request<PromotionView>('POST', '/admin/promotions', { ...base, body });
  },

  updatePromotion(id: number, body: SavePromotionRequest): Promise<PromotionView> {
    return request<PromotionView>('PUT', '/admin/promotions/' + id, { ...base, body });
  },

  setPromotionActive(id: number, active: boolean): Promise<PromotionView> {
    return request<PromotionView>('PATCH', '/admin/promotions/' + id + '/active', { ...base, body: { active } });
  },

  deletePromotion(id: number): Promise<void> {
    return request<void>('DELETE', '/admin/promotions/' + id, base);
  },

  /* ---------- fidelización y cupones (cliente) ---------- */

  loyaltyBalance(): Promise<LoyaltyBalance> {
    return request<LoyaltyBalance>('GET', '/loyalty/balance', base);
  },

  loyaltyPromotions(): Promise<PromotionForCustomer[]> {
    return request<PromotionForCustomer[]>('GET', '/loyalty/promotions', base);
  },

  redeemCoupon(bookingId: number, code: string): Promise<RedeemPromotionResult> {
    return request<RedeemPromotionResult>('POST', '/loyalty/redeem', { ...base, body: { bookingId, code } });
  },

  // monto que se debe hoy y cupón aplicado (BIZ-02): se pide al abrir la pantalla de pago, así el
  // cupón sigue a la vista y se puede quitar aunque se salga y se vuelva a entrar
  bookingAmountDue(bookingId: number): Promise<BookingAmountDue> {
    return request<BookingAmountDue>('GET', `/loyalty/redemptions/${bookingId}`, base);
  },

  // "Quitar cupón" (E-08): anula el canje en el servidor y devuelve lo que ahora falta por pagar
  removeCoupon(bookingId: number, promotionId: number): Promise<AmountDue> {
    return request<AmountDue>('DELETE', `/loyalty/redemptions/${bookingId}/${promotionId}`, base);
  },
};
