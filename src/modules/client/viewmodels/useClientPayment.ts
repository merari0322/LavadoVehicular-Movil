import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
import { isActiveStatus } from '../../../core/services/booking/bookingDisplay';
// cuentas del lavadero (con su QR), estado del pago, monto que se debe y cupón: payment-service
import {
  ALLOWED_IMAGE_TYPES,
  BookingAmountDue,
  ClientPayment,
  PaymentAccount,
  paymentService,
} from '../../../core/services/payments/PaymentService';
import { compressReceipt } from '../../../core/services/payments/receiptImage';
import { ClientBookingItem } from '../models/booking-view';
import { useClientBookings } from './useClientBookings';

export type MethodId = 'NEQUI' | 'DAVIPLATA' | 'TRANSFER' | 'CASH';
// PENDING: falta pagar · VERIFYING: el admin lo está revisando · APPROVED: el admin lo aprobó
export type FlowStep = 'PENDING' | 'VERIFYING' | 'APPROVED';

// orden en que se muestran los medios (la pantalla les pone el ícono)
export const METHOD_IDS: MethodId[] = ['NEQUI', 'DAVIPLATA', 'TRANSFER', 'CASH'];

// la referencia debe tener entre 8 y 12 caracteres alfanuméricos
const REFERENCE_REGEX = /^[A-Za-z0-9]{8,12}$/;
// lo que se deja elegir; antes de enviarlo se comprime a máximo 2 MB (receiptImage)
const MAX_PICKED_BYTES = 10 * 1024 * 1024;

// medio de la pantalla para el código de payment-service
export function methodIdOf(code: string): MethodId {
  if (code === 'NEQUI') return 'NEQUI';
  if (code === 'DAVIPLATA') return 'DAVIPLATA';
  if (code === 'EFECTIVO') return 'CASH';
  return 'TRANSFER';
}

// con bookingId en la ruta se paga esa reserva; sin id, la primera activa (o la más reciente)
export function pickBooking(bookings: ClientBookingItem[], bookingId?: number): ClientBookingItem | null {
  if (bookingId) {
    return bookings.find((booking) => booking.id === bookingId) ?? null;
  }
  const bySchedule = (a: ClientBookingItem, b: ClientBookingItem) => `${a.date} ${a.timeRange}`.localeCompare(`${b.date} ${b.timeRange}`);
  const active = [...bookings].filter((booking) => isActiveStatus(booking.status)).sort(bySchedule);
  return active[0] ?? [...bookings].sort(bySchedule).reverse()[0] ?? null;
}

// el estado del pago lo dice payment-service: aprobado, en revisión o sin pagar (o rechazado).
// Los pagos llegan del más reciente al más antiguo: el primero de la reserva es el vigente
export function flowStepOf(payments: ClientPayment[], bookingId: number): { step: FlowStep; rejectionReason: string | null } {
  const current = payments.find((payment) => payment.booking?.id === bookingId);
  const step: FlowStep =
    current?.status === 'APPROVED'
      ? 'APPROVED'
      : current && ['PENDING', 'IN_REVIEW'].includes(current.status)
        ? 'VERIFYING'
        : 'PENDING';
  return { step, rejectionReason: current?.status === 'REJECTED' ? (current.rejectionReason ?? '—') : null };
}

// lo que se guarda del pago para que no se pierda al salir de la pantalla. El estado real (si el
// pago ya se reportó) lo trae payment-service; aquí solo queda el método elegido, que es de la sesión
interface SavedPayment {
  flowStep: FlowStep;
  method: MethodId | null;
}

const storageKey = (code: string) => `@lavado_vehicular/payment/${code}`;

// resultado de confirmar: efectivo (se paga en el lavadero), enviado, o el error para mostrar
export type ConfirmResult = { kind: 'cash' } | { kind: 'sent' } | { kind: 'error'; message: string };

// ViewModel de la pantalla de pago del cliente (MOV-04): reserva a pagar, cuentas del lavadero,
// estado del pago, monto que se debe con su cupón (BIZ-02), comprobante, referencia y envío.
// El total siempre es el amountDue que da payment-service: la app no lo calcula (E-08)
export function useClientPayment(bookingId?: number) {
  const { t } = useTranslation();
  const bookings = useClientBookings();
  const booking = useMemo(() => pickBooking(bookings.bookings, bookingId), [bookings.bookings, bookingId]);

  // cuentas activas del lavadero; el efectivo aparece solo si el admin tiene activa su cuenta
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [flowStep, setFlowStep] = useState<FlowStep>('PENDING');
  // motivo del último pago rechazado de esta reserva (para que el cliente sepa qué corregir)
  const [lastRejectionReason, setLastRejectionReason] = useState<string | null>(null);
  // monto que se debe y cupón aplicado según payment-service (null mientras carga o si falló)
  const [amount, setAmount] = useState<BookingAmountDue | null>(null);
  // no se pudo leer el estado del pago, las cuentas o el monto: se avisa con opción de reintentar
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // método que eligió el cliente (o el guardado); si ya no está activo se usa el primero disponible
  const [chosenMethod, setChosenMethod] = useState<MethodId | null>(null);
  // comprobante ya comprimido: dataUrl es lo que se envía a payment-service
  const [receipt, setReceipt] = useState<{ name: string; size: number; dataUrl: string } | null>(null);
  const [reference, setReferenceText] = useState('');
  // monto que el cliente pagó según su comprobante (solo dígitos); null = no lo ha cambiado, se asume el total
  const [paidAmountText, setPaidAmountText] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [redeemingCoupon, setRedeemingCoupon] = useState(false);

  // estado del pago, cuentas y monto de la reserva: todo lo decide payment-service.
  // silent: refresco al volver a la pantalla o al llegar una push (ej. el admin aprobó el pago)
  const loadPayment = useCallback(
    async (id: number, silent = false) => {
      if (!silent) setPaymentLoading(true);
      try {
        const [list, payments, due] = await Promise.all([
          paymentService.accounts(),
          paymentService.mine(),
          paymentService.bookingAmountDue(id),
        ]);
        const state = flowStepOf(payments, id);
        setAccounts(list);
        setFlowStep(state.step);
        setLastRejectionReason(state.rejectionReason);
        setAmount(due);
        setPaymentError(null);
      } catch (error) {
        // si falla un refresco silencioso se queda lo que ya se ve
        if (!silent) setPaymentError(t(apiErrorKey(error)));
      } finally {
        setPaymentLoading(false);
      }
    },
    [t],
  );

  // al cambiar de reserva se olvida el monto de la anterior y se pide el de esta
  useEffect(() => {
    setAmount(null);
    setPaymentError(null);
    if (booking) void loadPayment(booking.id);
  }, [booking?.id, loadPayment]); // eslint-disable-line react-hooks/exhaustive-deps

  // recupera el método guardado de esta reserva (el paso lo decide payment-service)
  useEffect(() => {
    if (!booking) return;
    AsyncStorage.getItem(storageKey(booking.code))
      .then((raw) => {
        if (raw) setChosenMethod((JSON.parse(raw) as SavedPayment).method);
      })
      .catch(() => undefined); // sin lo guardado se usa el primer medio disponible
  }, [booking?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  // vuelve a leer la reserva y su pago (el botón "Reintentar")
  const reload = useCallback(async () => {
    await bookings.reload();
    if (booking) await loadPayment(booking.id);
  }, [bookings, booking, loadPayment]);

  // lo mismo, sin indicador de carga: al volver a la pantalla o al llegar una push
  const refresh = useCallback(async () => {
    await bookings.refresh();
    if (booking) await loadPayment(booking.id, true);
  }, [bookings, booking, loadPayment]);

  const isVerifying = flowStep === 'VERIFYING';
  const isApproved = flowStep === 'APPROVED';
  // con el pago enviado (en revisión o aprobado) ya no se puede cambiar ni volver a pagar
  const isLocked = isVerifying || isApproved;

  // contrato pago-reserva: una reserva DIGITAL solo se paga con cuentas que piden comprobante (sin
  // efectivo). Las anteriores al cambio (null) y las CASH quedan como estaban
  const usableAccounts = useMemo(
    () => (booking?.paymentMode === 'DIGITAL' ? accounts.filter((a) => a.requiresReceipt && methodIdOf(a.methodCode) !== 'CASH') : accounts),
    [accounts, booking?.paymentMode],
  );
  // solo los medios con una cuenta activa (payment-service ya filtra las inactivas, efectivo incluido)
  const methods = useMemo(() => METHOD_IDS.filter((id) => usableAccounts.some((a) => methodIdOf(a.methodCode) === id)), [usableAccounts]);
  // reserva CASH (contrato pago-reserva): se preselecciona Efectivo si el lavadero tiene esa cuenta;
  // si no, no se preselecciona nada y la pantalla solo muestra el aviso de pago en efectivo
  const isCashBooking = booking?.paymentMode === 'CASH';
  const defaultMethod: MethodId | null = isCashBooking
    ? methods.includes('CASH')
      ? 'CASH'
      : null
    : (methods[0] ?? 'NEQUI');
  const method: MethodId | null = chosenMethod && methods.includes(chosenMethod) ? chosenMethod : defaultMethod;
  const account = usableAccounts.find((a) => methodIdOf(a.methodCode) === method) ?? null;

  const total = amount?.amountDue ?? null;
  const coupon = amount?.redemption ?? null;
  const isReferenceValid = REFERENCE_REGEX.test(reference);
  const paidAmount = paidAmountText === null ? (total ?? 0) : Number(paidAmountText);
  const isPaidAmountValid = Number.isFinite(paidAmount) && paidAmount > 0;
  // sin el monto del servidor no se deja pagar: no hay con qué comparar
  const canConfirm =
    !sending &&
    !compressing &&
    !isLocked &&
    total !== null &&
    method !== null &&
    (method === 'CASH' || (receipt !== null && isReferenceValid && isPaidAmountValid));
  // lo que le falta al cliente para poder confirmar: se muestra debajo del botón deshabilitado
  const missingRequirements: string[] =
    isLocked || method === 'CASH' || method === null
      ? []
      : [
          ...(receipt ? [] : ['PAYMENT.CONFIRM.MISSING.RECEIPT']),
          ...(isReferenceValid ? [] : ['PAYMENT.CONFIRM.MISSING.REFERENCE']),
          ...(isPaidAmountValid ? [] : ['PAYMENT.CONFIRM.MISSING.AMOUNT']),
        ];
  const canRedeemCoupon = !isLocked && amount !== null && !coupon && !redeemingCoupon && couponCode.trim().length >= 3;

  const save = (next: Partial<SavedPayment>) => {
    if (!booking) return;
    const state: SavedPayment = { flowStep, method, ...next };
    AsyncStorage.setItem(storageKey(booking.code), JSON.stringify(state)).catch(() => undefined); // solo comodidad
  };

  const selectMethod = (id: MethodId) => {
    if (isLocked) return;
    setChosenMethod(id);
    save({ method: id });
  };

  const setReference = (text: string) => setReferenceText(text.replace(/[^A-Za-z0-9]/g, ''));
  const setPaidAmount = (text: string) => setPaidAmountText(text.replace(/[^0-9]/g, ''));

  // elige y comprime el comprobante; devuelve la llave del error para mostrar, o null
  const pickReceipt = async (): Promise<string | null> => {
    const result = await DocumentPicker.getDocumentAsync({ type: ALLOWED_IMAGE_TYPES, copyToCacheDirectory: true });
    if (result.canceled || result.assets.length === 0) return null;

    const file = result.assets[0];
    const validType = !file.mimeType || ALLOWED_IMAGE_TYPES.includes(file.mimeType);
    const validSize = (file.size ?? 0) <= MAX_PICKED_BYTES;
    if (!validType || !validSize) return 'PAYMENT.INVALID_FILE_MESSAGE';
    // se comprime al elegirlo para mostrar ya el peso real que se va a enviar
    setCompressing(true);
    try {
      const compressed = await compressReceipt(file.uri);
      if (!compressed) return 'PAYMENT.RECEIPT_TOO_LARGE';
      setReceipt({ name: file.name, size: compressed.size, dataUrl: compressed.dataUrl });
      return null;
    } catch {
      return 'PAYMENT.INVALID_FILE_MESSAGE';
    } finally {
      setCompressing(false);
    }
  };

  // canjea el cupón en payment-service; el monto nuevo es el que devuelve el servidor
  const redeemCoupon = async () => {
    if (!canRedeemCoupon || !booking) return;
    setRedeemingCoupon(true);
    setCouponError(null);
    try {
      const result = await paymentService.redeemCoupon(booking.id, couponCode.trim().toUpperCase());
      const redemption = {
        promotionId: result.promotionId,
        promotionCode: result.promotionCode,
        promotionName: result.promotionName,
        discountAmount: result.discountAmount,
      };
      // se vuelve a pedir el monto completo; si esa lectura falla, basta con lo que dijo el canje
      const due = await paymentService.bookingAmountDue(booking.id).catch(() => null);
      setAmount((prev) => due ?? (prev ? { ...prev, amountDue: result.newTotal, redemption } : prev));
      setCouponCode('');
    } catch (error) {
      setCouponError(t(apiErrorKey(error)));
    } finally {
      setRedeemingCoupon(false);
    }
  };

  // E-08: el canje se anula en payment-service (DELETE). Con un pago en revisión o aprobado el
  // servidor responde 409 y el cupón sigue
  const removeCoupon = async () => {
    if (!booking || !coupon || redeemingCoupon) return;
    setRedeemingCoupon(true);
    setCouponError(null);
    try {
      const due = await paymentService.removeCoupon(booking.id, coupon.promotionId);
      setAmount({ ...due, redemption: null });
    } catch (error) {
      setCouponError(t(apiErrorKey(error)));
    } finally {
      setRedeemingCoupon(false);
    }
  };

  const confirmPayment = async (): Promise<ConfirmResult | null> => {
    if (!canConfirm || !booking) return null;

    // efectivo: se paga en el lavadero y lo registra el administrador ("Registrar pago en el
    // local"), que lo deja aprobado. Aquí no se reporta nada ni queda "en verificación"
    if (method === 'CASH') return { kind: 'cash' };
    if (!account || !receipt) return null;

    setSending(true);
    try {
      // el comprobante viaja como imagen (ya comprimida); el monto a cobrar lo pone payment-service
      // y paidAmount es lo que el cliente dice haber pagado (el admin compara ambos)
      await paymentService.report(booking.id, account.id, reference, receipt.dataUrl, paidAmount);
      setFlowStep('VERIFYING');
      setLastRejectionReason(null);
      save({ flowStep: 'VERIFYING' });
      return { kind: 'sent' };
    } catch (error) {
      return { kind: 'error', message: t(apiErrorKey(error)) };
    } finally {
      setSending(false);
    }
  };

  // cancela la reserva (la confirmación la pide la pantalla); devuelve el error o null
  const cancelReservation = async (): Promise<string | null> => {
    if (!booking) return null;
    const failure = await bookings.cancel(booking.id);
    if (!failure) await AsyncStorage.removeItem(storageKey(booking.code)).catch(() => undefined);
    return failure;
  };

  return {
    loading: bookings.loading,
    loadError: bookings.loadError,
    booking,
    reload,
    refresh,
    paymentLoading,
    paymentError,
    accounts,
    methods,
    method,
    isCashBooking,
    account,
    selectMethod,
    flowStep,
    isVerifying,
    isApproved,
    isLocked,
    lastRejectionReason,
    total,
    coupon,
    couponCode,
    setCouponCode,
    couponError,
    redeemingCoupon,
    canRedeemCoupon,
    redeemCoupon,
    removeCoupon,
    receipt,
    compressing,
    pickReceipt,
    reference,
    setReference,
    isReferenceValid,
    paidAmountText: paidAmountText ?? (total === null ? '' : String(total)),
    setPaidAmount,
    isPaidAmountValid,
    sending,
    canConfirm,
    missingRequirements,
    confirmPayment,
    cancelReservation,
  };
}
