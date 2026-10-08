import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { isActiveStatus } from '../../../core/services/booking/bookingDisplay';
// cuentas del lavadero (con su QR), reporte del pago y canje de cupón: payment-service
import { PaymentAccount, paymentService, RedeemPromotionResult } from '../../../core/services/payments/PaymentService';
import { apiErrorKey } from '../../../core/api/apiError';
import { LabeledInput } from '../../../shared/components/forms/LabeledInput';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { withAlpha } from '../../../shared/utils/color';
import { formatCOP } from '../../../shared/utils/format';
import { ClientBookingItem } from '../models/booking-view';
import { useClientBookings } from '../viewmodels/useClientBookings';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientPayment'>;
type MethodId = 'NEQUI' | 'DAVIPLATA' | 'TRANSFER' | 'CASH';
type FlowStep = 'PENDING' | 'VERIFYING';
type IconName = keyof typeof MaterialIcons.glyphMap;

const METHODS: { id: MethodId; icon: IconName }[] = [
  { id: 'NEQUI', icon: 'smartphone' },
  { id: 'DAVIPLATA', icon: 'account-balance' },
  { id: 'TRANSFER', icon: 'receipt-long' },
  { id: 'CASH', icon: 'payments' },
];

// vigencia del QR
const QR_DURATION_MS = 15 * 60 * 1000;
// la referencia debe tener entre 8 y 12 caracteres alfanuméricos
const REFERENCE_REGEX = /^[A-Za-z0-9]{8,12}$/;
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

// medio de la pantalla para el código de payment-service
function methodIdOf(code: string): MethodId {
  if (code === 'NEQUI') return 'NEQUI';
  if (code === 'DAVIPLATA') return 'DAVIPLATA';
  if (code === 'EFECTIVO') return 'CASH';
  return 'TRANSFER';
}

// lo que se guarda del pago para que no se pierda al salir de la pantalla
interface SavedPayment {
  qrExpiresAt: number;
  flowStep: FlowStep;
  method: MethodId;
}

// el estado real (si el pago ya se reportó) lo trae el efecto de paymentService.mine() de
// arriba y pisa esto; aquí solo queda el cronómetro del QR y el método elegido, que son de
// la sesión y no tienen dónde vivir en el backend
const storageKey = (code: string) => `@lavado_vehicular/payment/${code}`;

// con bookingId en la ruta se paga esa reserva; sin id, la primera activa (o la más reciente)
function pickBooking(bookings: ClientBookingItem[], bookingId?: number): ClientBookingItem | null {
  if (bookingId) {
    return bookings.find((booking) => booking.id === bookingId) ?? null;
  }
  const bySchedule = (a: ClientBookingItem, b: ClientBookingItem) => `${a.date} ${a.timeRange}`.localeCompare(`${b.date} ${b.timeRange}`);
  const active = [...bookings].filter((booking) => isActiveStatus(booking.status)).sort(bySchedule);
  return active[0] ?? [...bookings].sort(bySchedule).reverse()[0] ?? null;
}

// pago de la reserva real (booking-service): método, QR con temporizador, comprobante y referencia
export function ClientPaymentScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();
  const vm = useClientBookings();
  // cuentas activas del lavadero; el efectivo siempre está
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [sending, setSending] = useState(false);

  const booking = useMemo(() => pickBooking(vm.bookings, route.params?.bookingId), [vm.bookings, route.params?.bookingId]);

  const [method, setMethod] = useState<MethodId>('NEQUI');
  const [flowStep, setFlowStep] = useState<FlowStep>('PENDING');
  const [qrExpiresAt, setQrExpiresAt] = useState(() => Date.now() + QR_DURATION_MS);
  const [secondsLeft, setSecondsLeft] = useState(QR_DURATION_MS / 1000);
  const [receipt, setReceipt] = useState<{ name: string; size: number; uri: string; mimeType: string } | null>(null);
  const [reference, setReference] = useState('');

  // canje de cupón de fidelización (payment-service, ADR-015): puntos acumulados desbloquean
  // la promoción, se aplica un % de descuento real sobre el total
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<RedeemPromotionResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [redeemingCoupon, setRedeemingCoupon] = useState(false);

  const total = Math.max(0, (booking?.total ?? 0) - (couponResult?.discountAmount ?? 0));
  const isVerifying = flowStep === 'VERIFYING';
  const isReferenceValid = REFERENCE_REGEX.test(reference);
  const canConfirm = !sending && !isVerifying && (method === 'CASH' || (receipt !== null && isReferenceValid));

  const methods = useMemo(
    () => METHODS.filter((item) => item.id === 'CASH' || accounts.some((a) => methodIdOf(a.methodCode) === item.id)),
    [accounts],
  );
  const account = accounts.find((a) => methodIdOf(a.methodCode) === method) ?? null;

  // cuentas reales del lavadero (las configura el admin, con su QR)
  useEffect(() => {
    paymentService
      .accounts()
      .then((list) => {
        setAccounts(list);
        if (!isVerifying && list.length > 0) setMethod(methodIdOf(list[0].methodCode));
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // si ya hay un pago reportado para esta reserva, la pantalla queda en revisión
  useEffect(() => {
    if (!booking) return;
    paymentService
      .mine()
      .then((payments) => {
        const current = payments.find((payment) => payment.booking?.id === booking.id);
        const open = !!current && ['PENDING', 'IN_REVIEW', 'APPROVED'].includes(current.status);
        setFlowStep(open ? 'VERIFYING' : 'PENDING');
      })
      .catch(() => undefined);
  }, [booking?.id]);

  // recupera el pago guardado o empieza uno nuevo con el QR de 15 minutos
  useEffect(() => {
    if (!booking) return;
    AsyncStorage.getItem(storageKey(booking.code))
      .then((raw) => {
        if (!raw) {
          const fresh: SavedPayment = { qrExpiresAt, flowStep: 'PENDING', method: 'NEQUI' };
          return AsyncStorage.setItem(storageKey(booking.code), JSON.stringify(fresh));
        }
        const saved = JSON.parse(raw) as SavedPayment;
        setQrExpiresAt(saved.qrExpiresAt);
        setFlowStep(saved.flowStep);
        setMethod(saved.method);
      })
      .catch(() => undefined);
    // solo al cargar la reserva a pagar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.code]);

  const save = (next: Partial<SavedPayment>) => {
    if (!booking) return;
    const state: SavedPayment = { qrExpiresAt, flowStep, method, ...next };
    AsyncStorage.setItem(storageKey(booking.code), JSON.stringify(state)).catch(() => undefined);
  };

  // temporizador del QR
  useEffect(() => {
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((qrExpiresAt - Date.now()) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [qrExpiresAt]);

  const timeLeft = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  const selectMethod = (id: MethodId) => {
    if (isVerifying) return;
    setMethod(id);
    save({ method: id });
  };

  const pickReceipt = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'], copyToCacheDirectory: true });
    if (result.canceled || result.assets.length === 0) return;

    const file = result.assets[0];
    const validType = !file.mimeType || ['image/jpeg', 'image/png'].includes(file.mimeType);
    const validSize = (file.size ?? 0) <= MAX_RECEIPT_BYTES;
    if (!validType || !validSize) {
      feedback.showStatus({ type: 'error', title: t('PAYMENT.INVALID_FILE_TITLE'), message: t('PAYMENT.INVALID_FILE_MESSAGE') });
      return;
    }
    setReceipt({ name: file.name, size: file.size ?? 0, uri: file.uri, mimeType: file.mimeType ?? 'image/jpeg' });
  };

  const canRedeemCoupon = !isVerifying && !couponResult && !redeemingCoupon && couponCode.trim().length >= 3;

  const redeemCoupon = async () => {
    if (!canRedeemCoupon || !booking) return;
    setRedeemingCoupon(true);
    setCouponError(null);
    try {
      const result = await paymentService.redeemCoupon(booking.id, couponCode.trim().toUpperCase());
      setCouponResult(result);
    } catch (error) {
      setCouponError(t(apiErrorKey(error)));
    } finally {
      setRedeemingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponCode('');
    setCouponError(null);
  };

  const confirmPayment = async () => {
    if (!canConfirm || !booking) return;

    // efectivo: se paga en el lavadero, no hay comprobante que reportar
    if (method === 'CASH' || !account || !receipt) {
      setFlowStep('VERIFYING');
      save({ flowStep: 'VERIFYING' });
      feedback.showStatus({ title: t('PAYMENT.SUCCESS_TITLE'), message: t('PAYMENT.SUCCESS_MESSAGE') });
      return;
    }

    setSending(true);
    try {
      // el comprobante viaja como imagen; el monto lo pone payment-service con el total de la reserva
      const base64 = await FileSystem.readAsStringAsync(receipt.uri, { encoding: FileSystem.EncodingType.Base64 });
      await paymentService.report(booking.id, account.id, reference, `data:${receipt.mimeType};base64,${base64}`);
      setFlowStep('VERIFYING');
      save({ flowStep: 'VERIFYING' });
      feedback.showStatus({ title: t('PAYMENT.SUCCESS_TITLE'), message: t('PAYMENT.SUCCESS_MESSAGE') });
    } catch (error) {
      feedback.showError(t(apiErrorKey(error)));
    } finally {
      setSending(false);
    }
  };

  const cancelReservation = () => {
    if (!booking) return;
    const code = booking.code;
    feedback.askConfirm({
      title: t('PAYMENT.CANCEL_CONFIRM.TITLE'),
      message: t('PAYMENT.CANCEL_CONFIRM.MESSAGE', { code }),
      confirmLabel: t('PAYMENT.CANCEL_CONFIRM.CONFIRM'),
      cancelLabel: t('PAYMENT.CANCEL_CONFIRM.BACK'),
      danger: true,
      onConfirm: async () => {
        const failure = await vm.cancel(booking.id);
        if (failure) {
          feedback.showError(failure);
          return;
        }
        await AsyncStorage.removeItem(storageKey(code)).catch(() => undefined);
        feedback.showStatusAfterClose(
          { title: t('PAYMENT.CANCEL_CONFIRM.SUCCESS_TITLE'), message: t('PAYMENT.CANCEL_CONFIRM.SUCCESS_MESSAGE', { code }) },
          () => navigation.navigate('ClientHome'),
        );
      },
    });
  };

  if (vm.loading) {
    return (
      <ClientLayout activeKey="payment">
        <ScreenScroll>
          <EmptyState loading title={t('MOBILE_NAV.LOADING')} />
        </ScreenScroll>
      </ClientLayout>
    );
  }

  if (vm.loadError || !booking) {
    return (
      <ClientLayout activeKey="payment">
        <ScreenScroll>
          <EmptyState
            icon="cloud-off"
            title={t(vm.loadError ? 'HISTORY.LOAD_ERROR' : 'PAYMENT.EMPTY')}
            subtitle={vm.loadError ?? undefined}
            actionLabel={t('MOBILE_NAV.RETRY')}
            onAction={vm.reload}
          />
        </ScreenScroll>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout activeKey="payment">
      <ScreenScroll>
        <Pill label={`${t('PAYMENT.STEP')} · #${booking.code}`} tone="primary" icon="check-circle" />
        <PageHeader title={t('PAYMENT.TITLE')} subtitle={t('PAYMENT.SUBTITLE')} />

        {/* Método de pago */}
        <SectionCard title={t('PAYMENT.METHOD.TITLE')} icon="credit-card">
          <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.METHOD.NO_FEES')}</Text>
          <View style={styles.methodGrid}>
            {methods.map((item) => {
              const active = item.id === method;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => selectMethod(item.id)}
                  style={[
                    styles.method,
                    { borderColor: active ? colors.primary : colors.border },
                    active && { backgroundColor: withAlpha(colors.primary, 0.08) },
                    isVerifying && !active && { opacity: 0.5 },
                  ]}
                >
                  {active ? (
                    <MaterialIcons name="check-circle" size={18} color={colors.primary} style={styles.methodCheck} />
                  ) : null}
                  <MaterialIcons name={item.icon} size={26} color={colors.primary} />
                  <Text style={[styles.methodLabel, { color: colors.text }]}>{t(`PAYMENT.METHOD.${item.id}`)}</Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>{t(`PAYMENT.METHOD.${item.id}_DESC`)}</Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        {method === 'CASH' ? (
          <SectionCard title={t('PAYMENT.CASH.TITLE')} icon="storefront">
            <Text style={[styles.body, { color: colors.textSecondary }]}>{t('PAYMENT.CASH.DESC')}</Text>
          </SectionCard>
        ) : (
          <>
            {/* Pago digital con QR */}
            <SectionCard
              title={`${t('PAYMENT.QR.VIA')} ${t(`PAYMENT.METHOD.${method}`)}`}
              icon="qr-code-2"
              right={<Pill label={timeLeft} tone={secondsLeft > 0 ? 'primary' : 'error'} icon="schedule" />}
            >
              <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.QR.VALID_FOR')}</Text>
              <View style={[styles.qrBox, { borderColor: colors.border }]}>
                {account?.qrImageUrl ? (
                  <Image source={{ uri: account.qrImageUrl }} style={{ width: 180, height: 180 }} resizeMode="contain" />
                ) : (
                  <MaterialIcons name="qr-code-2" size={150} color={colors.text} />
                )}
                <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.QR.SCAN_HINT')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.strong, { color: colors.text }]}>{account?.accountHolder ?? ''}</Text>
                <Pill label={t('PAYMENT.QR.VERIFIED')} tone="success" icon="verified" />
              </View>
              <InfoRow label={t('PAYMENT.QR.KEY')} value={account?.accountNumber ?? '—'} />
              <InfoRow label={t('PAYMENT.QR.ACCOUNT_TYPE')} value={t('PAYMENT.QR.ACCOUNT_TYPE_VALUE')} />
              <InfoRow label={t('PAYMENT.QR.AMOUNT')} value={`${formatCOP(total)} COP`} strong />
              <View style={[styles.hint, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
                <MaterialIcons name="smartphone" size={18} color={colors.primary} />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>{t('PAYMENT.QR.HINT')}</Text>
              </View>
            </SectionCard>

            {/* Confirmar pago: comprobante + referencia */}
            <SectionCard title={t('PAYMENT.CONFIRM.TITLE')} icon="fact-check">
              <Pressable
                onPress={pickReceipt}
                disabled={isVerifying}
                style={[styles.dropzone, { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.05) }]}
              >
                <MaterialIcons name={receipt ? 'check-circle' : 'cloud-upload'} size={30} color={receipt ? colors.success : colors.primary} />
                <Text style={[styles.strong, { color: colors.text }]}>
                  {receipt ? receipt.name : t('PAYMENT.RECEIPT_PICK')}
                </Text>
                <Text style={[styles.muted, { color: colors.textMuted }]}>
                  {receipt ? `${(receipt.size / (1024 * 1024)).toFixed(1)}MB · ${t('PAYMENT.RECEIPT_CHANGE')}` : t('PAYMENT.CONFIRM.FORMATS')}
                </Text>
              </Pressable>

              <LabeledInput
                label={t('PAYMENT.CONFIRM.REFERENCE')}
                required
                value={reference}
                onChangeText={(text) => setReference(text.replace(/[^A-Za-z0-9]/g, ''))}
                placeholder="M18492048"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                editable={!isVerifying}
              />
              <Text style={[styles.muted, { color: isReferenceValid ? colors.success : colors.textMuted }]}>
                {t('PAYMENT.CONFIRM.REFERENCE_HINT')}
              </Text>

              <View style={[styles.hint, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
                <MaterialIcons name="info-outline" size={18} color={colors.primary} />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>{t('PAYMENT.CONFIRM.INFO')}</Text>
              </View>
            </SectionCard>
          </>
        )}

        {/* Resumen de la reserva */}
        <SectionCard title={t('PAYMENT.SUMMARY.TITLE')} icon="receipt" right={<Pill label={booking.code} />}>
          <View style={[styles.serviceBox, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
            <MaterialIcons name="local-car-wash" size={24} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[styles.strong, { color: colors.text }]}>{booking.services.join(', ')}</Text>
            </View>
          </View>
          <InfoRow label={t('PAYMENT.SUMMARY.VEHICLE')} value={`${booking.vehicle} · ${booking.plate}`} />
          <InfoRow label={t('RESERVE.SUMMARY.DATE')} value={`${booking.displayDate} · ${booking.timeRange}`} icon="event" />
          <InfoRow label={t('PAYMENT.SUMMARY.SUBTOTAL')} value={`${formatCOP(booking.subtotal)} COP`} />
          {booking.pointsDiscount > 0 ? (
            <InfoRow label={t('PAYMENT.SUMMARY.DISCOUNT')} value={`-${formatCOP(booking.pointsDiscount)} COP`} />
          ) : null}

          {/* canjear un cupón de fidelización (ADR-015): puntos acumulados desbloquean la
              promoción, se aplica un % de descuento real sobre el total */}
          {couponResult ? (
            <View style={[styles.couponApplied, { backgroundColor: colors.successSoft }]}>
              <MaterialIcons name="local-offer" size={18} color={colors.success} />
              <Text style={[styles.flex, styles.muted, { color: colors.success }]}>
                {t('PAYMENT.COUPON.APPLIED', { name: couponResult.promotionName })}
              </Text>
              <Text style={[styles.strong, { color: colors.success }]}>-{formatCOP(couponResult.discountAmount)} COP</Text>
              <Pressable onPress={removeCoupon} disabled={isVerifying} hitSlop={6}>
                <MaterialIcons name="close" size={18} color={colors.success} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <LabeledInput
                containerStyle={styles.flex}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder={t('PAYMENT.COUPON.PLACEHOLDER')}
                autoCapitalize="characters"
                editable={!isVerifying}
              />
              <Pressable
                onPress={redeemCoupon}
                disabled={!canRedeemCoupon}
                style={[styles.couponApply, { backgroundColor: colors.primary, opacity: canRedeemCoupon ? 1 : 0.5 }]}
              >
                {redeemingCoupon ? (
                  <MaterialIcons name="hourglass-top" size={18} color={colors.onPrimary} />
                ) : (
                  <Text style={[styles.couponApplyText, { color: colors.onPrimary }]}>{t('PAYMENT.COUPON.APPLY')}</Text>
                )}
              </Pressable>
            </View>
          )}
          {couponError ? <Text style={[styles.muted, { color: colors.error }]}>{couponError}</Text> : null}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label={t('PAYMENT.SUMMARY.TOTAL')} value={`${formatCOP(total)} COP`} strong />
          <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.SUMMARY.TAX')}</Text>

          <ActionButton
            label={t(
              isVerifying
                ? 'PAYMENT.SUMMARY.VERIFYING_BUTTON'
                : method === 'CASH'
                  ? 'PAYMENT.SUMMARY.CASH_BUTTON'
                  : 'PAYMENT.SUMMARY.PAY_BUTTON',
            )}
            icon={isVerifying ? 'hourglass-top' : 'verified-user'}
            disabled={!canConfirm}
            onPress={confirmPayment}
          />
          <ActionButton label={t('PAYMENT.SUMMARY.CANCEL')} variant="link" onPress={cancelReservation} />
          <View style={styles.row}>
            <MaterialIcons name="verified-user" size={16} color={colors.success} />
            <Text style={[styles.muted, styles.flex, { color: colors.textMuted }]}>{t('PAYMENT.SUMMARY.SECURE')}</Text>
          </View>
        </SectionCard>

        <SectionCard>
          <View style={styles.row}>
            <MaterialIcons name="support-agent" size={26} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[styles.strong, { color: colors.text }]}>{t('PAYMENT.HELP.TITLE')}</Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>
                {t('PAYMENT.HELP.DESC')} <Text style={{ fontWeight: fontWeight.bold }}>01 8000 942 000</Text>
              </Text>
            </View>
          </View>
        </SectionCard>
      </ScreenScroll>
      {feedback.modals}
    </ClientLayout>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  muted: { fontSize: fontSize.caption },
  body: { fontSize: fontSize.body, lineHeight: 20 },
  strong: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  method: { flexBasis: '48%', gap: 4, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5 },
  methodCheck: { position: 'absolute', top: 8, right: 8 },
  methodLabel: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  methodDesc: { fontSize: fontSize.caption },
  qrBox: { alignItems: 'center', gap: 4, paddingVertical: spacing.md, borderWidth: 1, borderRadius: radius.md },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  hintText: { flex: 1, fontSize: fontSize.small, lineHeight: 18 },
  dropzone: { alignItems: 'center', gap: 4, padding: spacing.lg, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.md },
  serviceBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md },
  divider: { height: 1 },
  couponRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  couponApply: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: radius.md },
  couponApplyText: { fontSize: fontSize.small, fontWeight: fontWeight.bold },
  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
