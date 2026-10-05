import { PAYMENT_API_URL } from '../../api/config';
import { request } from '../../api/httpClient';

// habla con payment-service, mismos endpoints que la web. El monto lo pone el backend con el
// total de la reserva; aquí solo viajan la reserva, la cuenta, la referencia y el comprobante.

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
  receiptImage: string | null;
  reportedAtUtc: string | null;
  account: PaymentAccount | null;
  booking: PaymentBookingInfo | null;
}

export interface SaveAccountRequest {
  methodCode: string;
  accountHolder: string;
  accountNumber: string | null;
  qrImageUrl: string | null;
  instructions: string | null;
  active: boolean;
}

export interface ClientPayment {
  id: number;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  amount: number;
  rejectionReason: string | null;
  booking: { id: number; code: string } | null;
}

const base = { baseUrl: PAYMENT_API_URL };

export const paymentService = {
  accounts(): Promise<PaymentAccount[]> {
    return request<PaymentAccount[]>('GET', '/payment-accounts', base);
  },

  mine(): Promise<ClientPayment[]> {
    return request<ClientPayment[]>('GET', '/payments/me', base);
  },

  report(bookingId: number, paymentAccountId: number, transactionReference: string, receiptImage: string): Promise<ClientPayment> {
    return request<ClientPayment>('POST', '/payments', {
      ...base,
      body: { bookingId, paymentAccountId, transactionReference, receiptImage },
    });
  },

  /* ---------- admin ---------- */

  adminList(): Promise<PaymentView[]> {
    return request<PaymentView[]>('GET', '/admin/payments', base);
  },

  approve(id: number): Promise<PaymentView> {
    return request<PaymentView>('POST', '/admin/payments/' + id + '/approve', base);
  },

  reject(id: number, reason: string): Promise<PaymentView> {
    return request<PaymentView>('POST', '/admin/payments/' + id + '/reject', { ...base, body: { reason } });
  },

  // pago recibido en el lavadero: queda aprobado con el total de la reserva
  registerManual(bookingId: number, paymentAccountId: number): Promise<PaymentView> {
    return request<PaymentView>('POST', '/admin/payments', { ...base, body: { bookingId, paymentAccountId } });
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
};
