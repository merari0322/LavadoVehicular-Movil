import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../../shared/utils/color';
import { PAYMENT_TEXTS } from '../constants/paymentTexts';
import { Payment } from '../models/payment';
import { CURRENT_AUDITOR } from '../services/paymentMock';
import {
  formatCOP,
  formatDateTime,
  formatDuration,
  minutesBetween,
} from '../utils/paymentUtils';
import { PaymentStatusBadge } from './PaymentBadges';
import { PaymentReceipt } from './PaymentReceipt';

interface PaymentReviewModalProps {
  payment: Payment | null; // null = modal cerrado
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const texts = PAYMENT_TEXTS.review;

// Hook para obtener colores y estilos del tema activo
const useThemedStyles = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return { colors, styles };
};

// Bloque de información: etiqueta + valor destacado + detalle
function InfoBlock({ label, value, detail }: { label: string; value: string; detail: string }) {
  const { styles } = useThemedStyles();

  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoDetail}>{detail}</Text>
    </View>
  );
}

// Comparación entre el monto a pagar y el declarado en el comprobante
function AmountComparison({ payment }: { payment: Payment }) {
  const { colors, styles } = useThemedStyles();

  const difference = payment.declaredAmount - payment.amount;
  const matches = difference === 0;
  const percent = payment.amount > 0 ? (Math.abs(difference) / payment.amount) * 100 : 0;
  const percentText = String(Math.round(percent * 10) / 10).replace('.', ',');

  const accent = matches ? colors.primaryHover : colors.error;
  const background = matches ? withAlpha(colors.primary, 0.14) : colors.errorSoft;

  // Mensaje de detalle cuando los montos no coinciden
  const mismatchText =
    difference < 0
      ? texts.below(formatCOP(Math.abs(difference)))
      : texts.above(formatCOP(Math.abs(difference)));

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{texts.comparison}</Text>

      <View style={styles.twoColumns}>
        <View style={styles.flex}>
          <Text style={styles.infoLabel}>{texts.amountDue}</Text>
          <Text style={styles.infoValue}>{formatCOP(payment.amount)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.infoLabel}>{texts.amountDeclared}</Text>
          <Text style={styles.infoValue}>{formatCOP(payment.declaredAmount)}</Text>
        </View>
      </View>

      <View style={[styles.resultBox, { backgroundColor: background }]}>
        <MaterialIcons name={matches ? 'check-circle' : 'error'} size={22} color={accent} />
        <View style={styles.flex}>
          <Text style={[styles.resultTitle, { color: accent }]}>
            {matches ? texts.matchTitle : texts.mismatchTitle}
          </Text>
          <Text style={styles.resultText}>{matches ? texts.matchText : mismatchText}</Text>
        </View>
      </View>

      <View style={[styles.resultChip, { borderColor: accent }]}>
        <Text style={[styles.resultChipText, { color: accent }]}>
          {matches ? texts.matchChip : texts.mismatchChip(percentText)}
        </Text>
      </View>
    </View>
  );
}

// Modal para revisar un pago: aprobar, rechazar o consultar el recibo
export function PaymentReviewModal({ payment, onClose, onApprove, onReject }: PaymentReviewModalProps) {
  const { colors, styles } = useThemedStyles();

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  // Al abrir otro pago se reinicia el modo de rechazo
  useEffect(() => {
    setRejecting(false);
    setReason('');
    setReasonError(false);
  }, [payment?.id]);

  if (!payment) return null;

  const isPending = payment.status === 'pending';
  const isApproved = payment.status === 'approved';
  const isRejected = payment.status === 'rejected';
  const isCash = payment.method === 'cash';

  // Horario, por ejemplo "15:00 - 16:00 (1 hora)"
  const schedule =
    payment.scheduleStart && payment.scheduleEnd
      ? `${payment.scheduleStart} - ${payment.scheduleEnd} (${formatDuration(
          minutesBetween(payment.scheduleStart, payment.scheduleEnd),
        )})`
      : '-';

  const bayAndOperator =
    [payment.bay, payment.operator ? `${texts.operator}: ${payment.operator}` : '']
      .filter(Boolean)
      .join(' · ') || '-';

  const vehicleLine = [payment.vehicle, payment.plate].filter(Boolean).join(' · ') || '-';
  const contactLine = [payment.phone, payment.email].filter(Boolean).join(' · ') || '-';

  // Confirma el rechazo solo si hay un motivo válido
  const handleConfirmReject = () => {
    if (reason.trim().length < 5) {
      setReasonError(true);
      return;
    }
    onReject(payment.id, reason.trim());
  };

  // Comparte el recibo como texto usando el menú de compartir
  const handleShareReceipt = async () => {
    const message = [
      texts.receiptTitle,
      `${payment.code}`,
      `${texts.customer}: ${payment.customerName}`,
      `${texts.service}: ${payment.serviceName}`,
      `${texts.method}: ${PAYMENT_TEXTS.methods[payment.method]}`,
      `${texts.reference}: ${payment.reference}`,
      `${texts.amount}: ${formatCOP(payment.declaredAmount)}`,
      `${texts.dateTime}: ${formatDateTime(payment.date, payment.time)}`,
    ].join('\n');

    await Share.share({ message });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Encabezado: título, estado y descripción */}
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.title}>
                {isPending ? texts.reviewTitle(payment.code) : texts.detailTitle(payment.code)}
              </Text>
              <View style={styles.badgeWrapper}>
                <PaymentStatusBadge status={payment.status} />
              </View>
              <Text style={styles.subtitle}>{texts.subtitle}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Comprobante */}
            <Text style={styles.sectionLabel}>{texts.attachment}</Text>
            <PaymentReceipt payment={payment} />

            {/* Cliente y cita vinculada */}
            <View style={styles.customerBlock}>
              <Text style={styles.customerName}>{payment.customerName}</Text>
              {payment.reservationCode ? (
                <View style={styles.linkChip}>
                  <Text style={styles.linkChipText}>
                    {texts.linkedAppointment(payment.reservationCode)}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.infoDetail}>{contactLine}</Text>
              {payment.document ? (
                <Text style={styles.infoDetail}>
                  {texts.document}: {payment.document}
                </Text>
              ) : null}
            </View>

            {/* Servicio y horario */}
            <View style={styles.twoColumns}>
              <InfoBlock label={texts.serviceVehicle} value={payment.serviceName} detail={vehicleLine} />
              <InfoBlock label={texts.scheduleBay} value={schedule} detail={bayAndOperator} />
            </View>

            {/* Conciliación bancaria */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, styles.flex]}>{texts.reconciliation}</Text>
                <View style={styles.smallChip}>
                  <Text style={styles.smallChipText}>{isCash ? texts.cashVerified : texts.verified}</Text>
                </View>
              </View>
              <View style={styles.twoColumns}>
                <View style={styles.flex}>
                  <Text style={styles.infoLabel}>{texts.method}</Text>
                  <Text style={styles.infoValue}>{PAYMENT_TEXTS.methods[payment.method]}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.infoLabel}>{texts.transactionRef}</Text>
                  <Text style={styles.infoValue}>{payment.reference}</Text>
                </View>
              </View>
            </View>

            {/* Comparativa de montos */}
            <AmountComparison payment={payment} />

            {/* Motivo del rechazo (solo si ya fue rechazado) */}
            {isRejected && payment.rejectionReason ? (
              <View style={[styles.reasonBox, { backgroundColor: colors.errorSoft }]}>
                <Text style={[styles.sectionTitle, { color: colors.error }]}>{texts.rejectionSection}</Text>
                <Text style={styles.reasonText}>{payment.rejectionReason}</Text>
              </View>
            ) : null}

            {/* Campo para escribir el motivo al rechazar */}
            {rejecting ? (
              <View style={styles.reasonInputWrapper}>
                <Text style={styles.infoLabel}>{texts.reasonLabel}</Text>
                <TextInput
                  style={[styles.reasonInput, reasonError && styles.reasonInputError]}
                  value={reason}
                  onChangeText={(text) => {
                    setReason(text);
                    setReasonError(false);
                  }}
                  placeholder={texts.reasonPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  autoFocus
                />
                {reasonError ? <Text style={styles.errorText}>{texts.reasonError}</Text> : null}
              </View>
            ) : null}
          </ScrollView>

          {/* Pie: auditor y botones */}
          <View style={styles.footer}>
            <Text style={styles.auditText}>
              {texts.auditedBy(payment.auditedBy || CURRENT_AUDITOR)}
            </Text>

            <View style={styles.footerButtons}>
              {rejecting ? (
                <>
                  <Pressable
                    style={[styles.button, styles.outlineButton]}
                    onPress={() => setRejecting(false)}
                  >
                    <Text style={styles.outlineText}>{texts.back}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.dangerButton]}
                    onPress={handleConfirmReject}
                  >
                    <Text style={styles.filledText}>{texts.confirmReject}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable style={[styles.button, styles.outlineButton]} onPress={onClose}>
                    <Text style={styles.outlineText}>{texts.close}</Text>
                  </Pressable>

                  {isPending ? (
                    <>
                      <Pressable
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => setRejecting(true)}
                      >
                        <Text style={styles.rejectText}>{texts.reject}</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.button, styles.approveButton]}
                        onPress={() => onApprove(payment.id)}
                      >
                        <MaterialIcons name="check" size={18} color="#FFFFFF" />
                        <Text style={styles.filledText}>{texts.approve}</Text>
                      </Pressable>
                    </>
                  ) : null}

                  {isApproved ? (
                    <Pressable
                      style={[styles.button, styles.approveButton]}
                      onPress={handleShareReceipt}
                    >
                      <MaterialIcons name="share" size={18} color="#FFFFFF" />
                      <Text style={styles.filledText}>{texts.shareReceipt}</Text>
                    </Pressable>
                  ) : null}
                </>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
      maxHeight: '94%',
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    badgeWrapper: { marginTop: 8 },
    subtitle: { marginTop: 8, fontSize: 13, color: colors.textSecondary },
    body: { flexShrink: 1 },
    bodyContent: { gap: 14, padding: 20 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    customerBlock: { gap: 6 },
    customerName: { fontSize: 18, fontWeight: '800', color: colors.text },
    linkChip: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    linkChipText: { fontSize: 12, fontWeight: '700', color: colors.primaryHover },
    twoColumns: { flexDirection: 'row', gap: 14 },
    infoBlock: { flex: 1, gap: 2 },
    infoLabel: { fontSize: 13, color: colors.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '800', color: colors.text },
    infoDetail: { fontSize: 13, color: colors.textSecondary },
    section: {
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.08),
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: colors.textSecondary,
    },
    smallChip: {
      paddingVertical: 3,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: withAlpha(colors.textMuted, 0.2),
    },
    smallChipText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
    resultBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12 },
    resultTitle: { fontSize: 14, fontWeight: '800' },
    resultText: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    resultChip: {
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
    },
    resultChipText: { fontSize: 12, fontWeight: '700' },
    reasonBox: { gap: 6, padding: 14, borderRadius: 14 },
    reasonText: { fontSize: 14, color: colors.text },
    reasonInputWrapper: { gap: 6 },
    reasonInput: {
      minHeight: 80,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
      fontSize: 14,
      color: colors.text,
      textAlignVertical: 'top',
    },
    reasonInputError: { borderColor: colors.error },
    errorText: { fontSize: 12, fontWeight: '600', color: colors.error },
    footer: {
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    auditText: { fontSize: 13, color: colors.textSecondary },
    footerButtons: { flexDirection: 'row', gap: 8 },
    button: {
      flex: 1,
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
    },
    outlineButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    outlineText: { fontSize: 13, fontWeight: '700', color: colors.text },
    rejectButton: { borderWidth: 1, borderColor: colors.error, backgroundColor: colors.card },
    rejectText: { fontSize: 13, fontWeight: '700', color: colors.error },
    approveButton: { flex: 1.4, backgroundColor: colors.primaryHover },
    dangerButton: { flex: 1.4, backgroundColor: colors.error },
    filledText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  });
