import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { RootStackParamList } from '../../../core/navigation/types';
import { LabeledInput } from '../../../shared/components/forms/LabeledInput';
import { Pill } from '../../../shared/components/ui/Pill';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { withAlpha } from '../../../shared/utils/color';
import { formatCOP } from '../../../shared/utils/format';
import { PAYEE, PAYMENT_RESERVATION } from '../services/clientMock';

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

// lo que se guarda del pago para que no se pierda al salir de la pantalla
interface SavedPayment {
  qrExpiresAt: number;
  flowStep: FlowStep;
  method: MethodId;
}

// TODO: reemplazar el guardado local por el estado real de la reserva (commercial-service)
const storageKey = (code: string) => `@lavado_vehicular/payment/${code}`;

// pago de la reserva: método, QR con temporizador, comprobante y referencia
export function ClientPaymentScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();
  const reservation = PAYMENT_RESERVATION;

  const [method, setMethod] = useState<MethodId>('NEQUI');
  const [flowStep, setFlowStep] = useState<FlowStep>('PENDING');
  const [qrExpiresAt, setQrExpiresAt] = useState(() => Date.now() + QR_DURATION_MS);
  const [secondsLeft, setSecondsLeft] = useState(QR_DURATION_MS / 1000);
  const [receipt, setReceipt] = useState<{ name: string; size: number } | null>(null);
  const [reference, setReference] = useState('');

  const discount = Math.round((reservation.subtotal * reservation.discountPercent) / 100);
  const total = reservation.subtotal - discount;
  const isVerifying = flowStep === 'VERIFYING';
  const isReferenceValid = REFERENCE_REGEX.test(reference);
  const canConfirm = !isVerifying && (method === 'CASH' || (receipt !== null && isReferenceValid));

  // recupera el pago guardado o empieza uno nuevo con el QR de 15 minutos
  useEffect(() => {
    AsyncStorage.getItem(storageKey(reservation.code))
      .then((raw) => {
        if (!raw) {
          // pago nuevo: se guarda la hora en que vence el QR para que siga contando al volver
          const fresh: SavedPayment = { qrExpiresAt, flowStep: 'PENDING', method: 'NEQUI' };
          return AsyncStorage.setItem(storageKey(reservation.code), JSON.stringify(fresh));
        }
        const saved = JSON.parse(raw) as SavedPayment;
        setQrExpiresAt(saved.qrExpiresAt);
        setFlowStep(saved.flowStep);
        setMethod(saved.method);
      })
      .catch(() => undefined);
    // solo al abrir la pantalla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation.code]);

  const save = (next: Partial<SavedPayment>) => {
    const state: SavedPayment = { qrExpiresAt, flowStep, method, ...next };
    AsyncStorage.setItem(storageKey(reservation.code), JSON.stringify(state)).catch(() => undefined);
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
    // con el pago en revisión ya no se puede cambiar el método
    if (isVerifying) return;
    setMethod(id);
    save({ method: id });
  };

  const pickReceipt = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'], copyToCacheDirectory: false });
    if (result.canceled || result.assets.length === 0) return;

    const file = result.assets[0];
    const validType = !file.mimeType || ['image/jpeg', 'image/png'].includes(file.mimeType);
    const validSize = (file.size ?? 0) <= MAX_RECEIPT_BYTES;
    if (!validType || !validSize) {
      feedback.showStatus({ type: 'error', title: t('PAYMENT.INVALID_FILE_TITLE'), message: t('PAYMENT.INVALID_FILE_MESSAGE') });
      return;
    }
    setReceipt({ name: file.name, size: file.size ?? 0 });
  };

  const confirmPayment = () => {
    if (!canConfirm) return;
    // TODO: enviar el pago a commercial-service (la web tampoco lo guarda aún)
    setFlowStep('VERIFYING');
    save({ flowStep: 'VERIFYING' });
    feedback.showStatus({ title: t('PAYMENT.SUCCESS_TITLE'), message: t('PAYMENT.SUCCESS_MESSAGE') });
  };

  const cancelReservation = () =>
    feedback.askConfirm({
      title: t('PAYMENT.CANCEL_CONFIRM.TITLE'),
      message: t('PAYMENT.CANCEL_CONFIRM.MESSAGE', { code: reservation.code }),
      confirmLabel: t('PAYMENT.CANCEL_CONFIRM.CONFIRM'),
      // "Volver" en vez de "Cancelar" para no confundir con "cancelar reserva"
      cancelLabel: t('PAYMENT.CANCEL_CONFIRM.BACK'),
      danger: true,
      onConfirm: () => {
        AsyncStorage.removeItem(storageKey(reservation.code)).catch(() => undefined);
        feedback.showStatus(
          {
            title: t('PAYMENT.CANCEL_CONFIRM.SUCCESS_TITLE'),
            message: t('PAYMENT.CANCEL_CONFIRM.SUCCESS_MESSAGE', { code: reservation.code }),
          },
          () => navigation.navigate('ClientHome'),
        );
      },
    });

  return (
    <ClientLayout activeKey="payment">
      <ScreenScroll>
        <Pill label={`${t('PAYMENT.STEP')} · #${reservation.code}`} tone="primary" icon="check-circle" />
        <PageHeader title={t('PAYMENT.TITLE')} subtitle={t('PAYMENT.SUBTITLE')} />

        {/* Método de pago */}
        <SectionCard title={t('PAYMENT.METHOD.TITLE')} icon="credit-card">
          <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.METHOD.NO_FEES')}</Text>
          <View style={styles.methodGrid}>
            {METHODS.map((item) => {
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
                <MaterialIcons name="qr-code-2" size={150} color={colors.text} />
                <Text style={[styles.muted, { color: colors.textMuted }]}>{t('PAYMENT.QR.SCAN_HINT')}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.strong, { color: colors.text }]}>{PAYEE.name}</Text>
                <Pill label={t('PAYMENT.QR.VERIFIED')} tone="success" icon="verified" />
              </View>
              <InfoRow label={t('PAYMENT.QR.KEY')} value={PAYEE.key} />
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
        <SectionCard title={t('PAYMENT.SUMMARY.TITLE')} icon="receipt" right={<Pill label={reservation.code} />}>
          <View style={[styles.serviceBox, { backgroundColor: withAlpha(colors.primary, 0.08) }]}>
            <MaterialIcons name="local-car-wash" size={24} color={colors.primary} />
            <View style={styles.flex}>
              <Text style={[styles.strong, { color: colors.text }]}>{reservation.serviceName}</Text>
              <Text style={[styles.muted, { color: colors.textSecondary }]}>{t('PAYMENT.SUMMARY.PREMIUM_DESC')}</Text>
            </View>
          </View>
          <InfoRow label={t('PAYMENT.SUMMARY.VEHICLE')} value={`${reservation.vehicleModel} · ${reservation.plate}`} />
          <InfoRow label={t('RESERVE.SUMMARY.DATE')} value={reservation.schedule} icon="event" />
          <InfoRow label={t('PAYMENT.SUMMARY.SUBTOTAL')} value={`${formatCOP(reservation.subtotal)} COP`} />
          <InfoRow
            label={`${t('PAYMENT.SUMMARY.DISCOUNT')} (-${reservation.discountPercent}%)`}
            value={`-${formatCOP(discount)} COP`}
          />
          <InfoRow label={`${t('PAYMENT.SUMMARY.COUPON')}: ${reservation.coupon}`} value={t('PAYMENT.SUMMARY.COUPON_OK')} />
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
});
