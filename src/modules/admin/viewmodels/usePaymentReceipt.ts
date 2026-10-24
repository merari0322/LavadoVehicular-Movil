import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
import { paymentService } from '../../../core/services/payments/PaymentService';
import { Payment } from '../models/payment';

// E-10: la cola del admin llega sin la imagen del comprobante; al abrir un pago que la tiene se pide
// con GET /admin/payments/{id}. Devuelve el pago con su imagen y, si no se pudo traer, el error
export function usePaymentReceipt(payment: Payment | null): { payment: Payment | null; receiptError: string | null } {
  const { t } = useTranslation();
  const [receipt, setReceipt] = useState<{ id: string; image: string | null; error: string | null } | null>(null);

  useEffect(() => {
    if (!payment || payment.receiptImage || !payment.hasReceiptImage) return undefined;
    let current = true;
    paymentService
      .adminPayment(Number(payment.id))
      .then((detail) => {
        if (current) setReceipt({ id: payment.id, image: detail.receiptImage, error: null });
      })
      .catch((error) => {
        if (current) setReceipt({ id: payment.id, image: null, error: t(apiErrorKey(error)) });
      });
    return () => {
      current = false;
    };
    // solo al abrir otro pago
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment?.id]);

  if (!payment || receipt?.id !== payment.id) return { payment, receiptError: null };
  return { payment: receipt.image ? { ...payment, receiptImage: receipt.image } : payment, receiptError: receipt.error };
}
