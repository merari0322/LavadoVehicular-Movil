import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { ImageZoomModal } from '../../../shared/components/feedback/ImageZoomModal';
import { LabeledInput } from '../../../shared/components/forms/LabeledInput';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { useRefreshOnFocus } from '../../../shared/hooks/useRefreshOnFocus';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { useEstablishment } from '../../../shared/services/establishmentCatalog';
import { withAlpha } from '../../../shared/utils/color';
import { formatCOP } from '../../../shared/utils/format';
// textos de pagos que ya existen en los 4 idiomas (los de la pantalla del admin)
import { PAYMENT_TEXTS } from '../../admin/constants/paymentTexts';
import { MethodId, useClientPayment } from '../viewmodels/useClientPayment';

type Props = NativeStackScreenProps<RootStackParamList, 'ClientPayment'>;
type IconName = keyof typeof MaterialIcons.glyphMap;

const METHOD_ICONS: Record<MethodId, IconName> = {
  NEQUI: 'smartphone',
  DAVIPLATA: 'account-balance',
  TRANSFER: 'receipt-long',
  CASH: 'payments',
};

// monto del servidor en pesos; mientras no llega se muestra una raya (la app no lo calcula)
const money = (value: number | null) => (value === null ? '—' : `${formatCOP(value)} COP`);

// pago de la reserva real (booking-service): método, QR de la cuenta, comprobante y referencia.
// La lógica vive en useClientPayment; aquí solo se pinta
export function ClientPaymentScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();
  const vm = useClientPayment(route.params?.bookingId);
  // datos frescos al volver a la pantalla o al llegar una push (ej. el admin aprobó el pago)
  useRefreshOnFocus(vm.refresh);
  // línea de soporte del negocio (la misma que el admin edita en los datos del negocio)
  const establishment = useEstablishment();
  const [qrZoomOpen, setQrZoomOpen] = useState(false);

  const {
    booking,
    methods,
    method,
    account,
    isVerifying,
    isApproved,
    isLocked,
    lastRejectionReason,
    total,
    coupon,
    couponCode,
    couponError,
    redeemingCoupon,
    canRedeemCoupon,
    receipt,
    compressing,
    reference,
    isReferenceValid,
    paidAmountText,
    isPaidAmountValid,
    canConfirm,
    missingRequirements,
  } = vm;

  const pickReceipt = async () => {
    const errorKey = await vm.pickReceipt();
    if (errorKey) feedback.showStatus({ type: 'error', title: t('PAYMENT.INVALID_FILE_TITLE'), message: t(errorKey) });
  };

  const confirmPayment = async () => {
    const result = await vm.confirmPayment();
    if (!result) return;
    if (result.kind === 'cash') {
      feedback.showStatus({ title: t('PAYMENT.CASH_INFO_TITLE'), message: t('PAYMENT.CASH_INFO_MESSAGE') });
    } else if (result.kind === 'sent') {
      feedback.showStatus({ title: t('PAYMENT.SUCCESS_TITLE'), message: t('PAYMENT.SUCCESS_MESSAGE') });
    } else {
      feedback.showError(result.message);
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
        const failure = await vm.cancelReservation();
        if (failure) {
          feedback.showError(failure);
          return;
        }
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

        {/* el administrador ya aprobó el pago: no hay nada más que hacer */}
        {isApproved ? (
          <View style={[styles.hint, { backgroundColor: colors.successSoft }]} accessibilityRole="summary">
            <MaterialIcons name="verified" size={20} color={colors.success} />
            <View style={styles.flex}>
              <Text style={[styles.strong, { color: colors.success }]}>{t('PAYMENT.SUMMARY.APPROVED_TITLE')}</Text>
              <Text style={[styles.hintText, { color: colors.text }]}>{t('PAYMENT.SUMMARY.APPROVED_MESSAGE')}</Text>
            </View>
          </View>
        ) : null}

        {/* contrato pago-reserva: reserva digital con plazo y sin comprobante reportado */}
        {booking.payBefore && !isLocked ? (
          <View style={[styles.hint, { backgroundColor: colors.warningSoft }]} accessibilityRole="alert">
            <MaterialIcons name="timer" size={20} color={colors.warning} />
            <View style={styles.flex}>
              <Text style={[styles.strong, { color: colors.warning }]}>
                {t('PAYMENT.DEADLINE_NOTICE', { time: booking.payBefore })}
              </Text>
            </View>
          </View>
        ) : null}

        {/* payment-service no respondió: sin el estado ni el monto no se deja pagar */}
        {vm.paymentError ? (
          <View style={[styles.hint, { backgroundColor: colors.errorSoft }]}>
            <MaterialIcons name="cloud-off" size={20} color={colors.error} />
            <View style={styles.flex}>
              <Text style={[styles.strong, { color: colors.error }]}>{t('PAYMENT.LOAD_ERROR')}</Text>
              <Text style={[styles.hintText, { color: colors.text }]}>{vm.paymentError}</Text>
              <ActionButton label={t('MOBILE_NAV.RETRY')} variant="link" onPress={vm.reload} />
            </View>
          </View>
        ) : null}

        {/* el último pago de esta reserva fue rechazado: se explica por qué antes de reportar otro */}
        {lastRejectionReason && !isLocked ? (
          <View style={[styles.hint, { backgroundColor: colors.errorSoft }]}>
            <MaterialIcons name="error-outline" size={20} color={colors.error} />
            <View style={styles.flex}>
              <Text style={[styles.strong, { color: colors.error }]}>{PAYMENT_TEXTS.review.rejectionSection}</Text>
              <Text style={[styles.hintText, { color: colors.text }]}>{lastRejectionReason}</Text>
            </View>
          </View>
        ) : null}

        {/* con el pago aprobado ya no se elige método ni se reporta nada: solo queda el resumen */}
        {isApproved ? null : (
        <>
        {/* Método de pago */}
        <SectionCard title={t('PAYMENT.METHOD.TITLE')} icon="credit-card">
          <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.METHOD.NO_FEES')}</Text>
          <View style={styles.methodGrid}>
            {methods.map((id) => {
              const active = id === method;
              return (
                <Pressable
                  key={id}
                  onPress={() => vm.selectMethod(id)}
                  style={[
                    styles.method,
                    { borderColor: active ? colors.primary : colors.border },
                    active && { backgroundColor: withAlpha(colors.primary, 0.08) },
                    isLocked && !active && { opacity: 0.5 },
                  ]}
                >
                  {active ? (
                    <MaterialIcons name="check-circle" size={18} color={colors.primary} style={styles.methodCheck} />
                  ) : null}
                  <MaterialIcons name={METHOD_ICONS[id]} size={26} color={colors.primary} />
                  <Text style={[styles.methodLabel, { color: colors.text }]}>{t(`PAYMENT.METHOD.${id}`)}</Text>
                  <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>{t(`PAYMENT.METHOD.${id}_DESC`)}</Text>
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
            >
              <View style={[styles.qrBox, { borderColor: colors.border }]}>
                {account?.qrImageUrl ? (
                  // tocar el QR lo abre en pantalla completa con lupa
                  <Pressable
                    onPress={() => setQrZoomOpen(true)}
                    accessibilityRole="imagebutton"
                    accessibilityLabel={t('PAYMENT.QR.ZOOM')}
                  >
                    <Image source={{ uri: account.qrImageUrl }} style={styles.qrImage} resizeMode="contain" />
                    <View style={[styles.qrLens, { backgroundColor: colors.primary }]}>
                      <MaterialIcons name="zoom-in" size={22} color={colors.onPrimary} />
                    </View>
                  </Pressable>
                ) : (
                  <MaterialIcons name="qr-code-2" size={150} color={colors.text} />
                )}
                <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.QR.SCAN_HINT')}</Text>
                {account?.qrImageUrl ? (
                  <Pressable onPress={() => setQrZoomOpen(true)} hitSlop={6} style={styles.row}>
                    <MaterialIcons name="search" size={16} color={colors.primary} />
                    <Text style={[styles.zoomLink, { color: colors.primary }]}>{t('PAYMENT.QR.ZOOM')}</Text>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.row}>
                <Text style={[styles.strong, { color: colors.text }]}>{account?.accountHolder ?? ''}</Text>
                <Pill label={t('PAYMENT.QR.VERIFIED')} tone="success" icon="verified" />
              </View>
              <InfoRow label={t('PAYMENT.QR.KEY')} value={account?.accountNumber ?? '—'} />
              <InfoRow label={t('PAYMENT.QR.ACCOUNT_TYPE')} value={t('PAYMENT.QR.ACCOUNT_TYPE_VALUE')} />
              <InfoRow label={t('PAYMENT.QR.AMOUNT')} value={money(total)} strong />
              <View style={[styles.hint, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
                <MaterialIcons name="smartphone" size={18} color={colors.primary} />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>{t('PAYMENT.QR.HINT')}</Text>
              </View>
            </SectionCard>

            {/* Confirmar pago: comprobante + referencia */}
            <SectionCard title={t('PAYMENT.CONFIRM.TITLE')} icon="fact-check">
              <Pressable
                onPress={pickReceipt}
                disabled={isLocked || compressing}
                style={[styles.dropzone, { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.05) }]}
              >
                <MaterialIcons
                  name={compressing ? 'hourglass-top' : receipt ? 'check-circle' : 'cloud-upload'}
                  size={30}
                  color={receipt && !compressing ? colors.success : colors.primary}
                />
                <Text style={[styles.strong, { color: colors.text }]}>
                  {compressing ? t('PAYMENT.RECEIPT_COMPRESSING') : receipt ? receipt.name : t('PAYMENT.RECEIPT_PICK')}
                </Text>
                <Text style={[styles.muted, { color: colors.textMuted }]}>
                  {receipt ? `${(receipt.size / (1024 * 1024)).toFixed(1)}MB · ${t('PAYMENT.RECEIPT_CHANGE')}` : t('PAYMENT.CONFIRM.FORMATS')}
                </Text>
              </Pressable>

              <LabeledInput
                label={t('PAYMENT.CONFIRM.REFERENCE')}
                required
                value={reference}
                onChangeText={vm.setReference}
                placeholder="M18492048"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={12}
                editable={!isLocked}
              />
              <Text style={[styles.muted, { color: isReferenceValid ? colors.success : colors.textMuted }]}>
                {t('PAYMENT.CONFIRM.REFERENCE_HINT')}
              </Text>

              <LabeledInput
                label={t('PAYMENT.CONFIRM.AMOUNT')}
                required
                prefix="$"
                value={paidAmountText}
                onChangeText={vm.setPaidAmount}
                keyboardType="number-pad"
                editable={!isLocked}
              />
              <Text style={[styles.muted, { color: isPaidAmountValid ? colors.textMuted : colors.error }]}>
                {t('PAYMENT.CONFIRM.AMOUNT_HINT')}
              </Text>

              <View style={[styles.hint, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
                <MaterialIcons name="info-outline" size={18} color={colors.primary} />
                <Text style={[styles.hintText, { color: colors.textSecondary }]}>{t('PAYMENT.CONFIRM.INFO')}</Text>
              </View>
            </SectionCard>
          </>
        )}
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
          {coupon ? (
            <View style={[styles.couponApplied, { backgroundColor: colors.successSoft }]}>
              <MaterialIcons name="local-offer" size={18} color={colors.success} />
              <Text style={[styles.flex, styles.muted, { color: colors.success }]}>
                {t('PAYMENT.COUPON.APPLIED', { name: coupon.promotionName })}
              </Text>
              <Text style={[styles.strong, { color: colors.success }]}>-{formatCOP(coupon.discountAmount)} COP</Text>
              {/* con el pago enviado o aprobado el cupón ya no se puede quitar */}
              {isLocked ? null : (
                <Pressable onPress={vm.removeCoupon} hitSlop={6}>
                  <MaterialIcons name="close" size={18} color={colors.success} />
                </Pressable>
              )}
            </View>
          ) : isApproved ? null : (
            <View style={styles.couponRow}>
              <LabeledInput
                containerStyle={styles.flex}
                value={couponCode}
                onChangeText={vm.setCouponCode}
                placeholder={t('PAYMENT.COUPON.PLACEHOLDER')}
                autoCapitalize="characters"
                editable={!isLocked}
              />
              <Pressable
                onPress={vm.redeemCoupon}
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
          <InfoRow label={t('PAYMENT.SUMMARY.TOTAL')} value={money(total)} strong />
          <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.SUMMARY.TAX')}</Text>

          {/* aprobado: no hay nada que pagar, solo se puede cancelar la reserva */}
          {isApproved ? null : (
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
          )}
          {/* por qué el botón sigue bloqueado: lo que falta completar */}
          {missingRequirements.length > 0 ? (
            <View style={[styles.missingBox, { backgroundColor: colors.warningSoft }]}>
              <Text style={[styles.strong, { color: colors.text }]}>{t('PAYMENT.CONFIRM.MISSING.TITLE')}</Text>
              {missingRequirements.map((key) => (
                <View key={key} style={styles.row}>
                  <MaterialIcons name="radio-button-unchecked" size={14} color={colors.warning} />
                  <Text style={[styles.muted, styles.flex, { color: colors.textSecondary }]}>{t(key)}</Text>
                </View>
              ))}
            </View>
          ) : null}
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
                {t('PAYMENT.HELP.DESC')}{' '}
                <Text style={{ fontWeight: fontWeight.bold }}>{establishment.supportLine || establishment.phone}</Text>
              </Text>
            </View>
          </View>
        </SectionCard>
      </ScreenScroll>
      {feedback.modals}
      <ImageZoomModal
        visible={qrZoomOpen}
        uri={account?.qrImageUrl ?? null}
        title={`${t('PAYMENT.QR.VIA')} ${t(`PAYMENT.METHOD.${method}`)}`}
        onClose={() => setQrZoomOpen(false)}
      />
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
  qrImage: { width: 220, height: 220 },
  qrLens: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomLink: { fontSize: fontSize.small, fontWeight: fontWeight.bold },
  hint: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  hintText: { flex: 1, fontSize: fontSize.small, lineHeight: 18 },
  dropzone: { alignItems: 'center', gap: 4, padding: spacing.lg, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: radius.md },
  serviceBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.md },
  divider: { height: 1 },
  couponRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  missingBox: { gap: 6, padding: spacing.md, borderRadius: radius.md },
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
