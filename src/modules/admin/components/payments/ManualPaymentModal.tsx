import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { withAlpha } from '../../../../shared/utils/color';
import { PAYMENT_TEXTS } from '../../constants/paymentTexts';
import { ManualPaymentValues } from '../../models/payment';
import { bookingService } from '../../../../core/services/booking/BookingService';
import { paymentService } from '../../../../core/services/payments/PaymentService';
import { toISODate } from '../../../../shared/utils/format';
import { formatCOP } from '../../../../shared/utils/format';
import { ReservationField } from '../reservations/ReservationField';

interface ManualPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: ManualPaymentValues) => void;
}


// Modal para registrar un pago hecho en caja
export function ManualPaymentModal({ visible, onClose, onSubmit }: ManualPaymentModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = PAYMENT_TEXTS.form;

  // reservas que se pueden pagar (últimos 30 días y la próxima semana) y cuentas activas
  const [bookings, setBookings] = useState<{ id: number; label: string; total: number }[]>([]);
  const [accounts, setAccounts] = useState<SelectOption[]>([]);
  const [bookingId, setBookingId] = useState('');
  const [accountId, setAccountId] = useState('');

  // Cada vez que se abre el modal se recargan las opciones
  useEffect(() => {
    if (!visible) return;
    setBookingId('');
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const to = new Date();
    to.setDate(to.getDate() + 7);
    bookingService
      .adminBookings(toISODate(from), toISODate(to))
      .then((list) =>
        setBookings(
          list
            .filter((b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS' || b.status === 'COMPLETED')
            .map((b) => ({
              id: b.id,
              total: b.total,
              label: `${b.code} · ${b.services.map((x) => x.name).join(', ')} · ${b.vehicle?.licensePlateFormatted ?? ''}`,
            })),
        ),
      )
      .catch(() => setBookings([]));
    paymentService
      .adminAccounts()
      .then((list) => {
        const active = list.filter((a) => a.active);
        setAccounts(active.map((a) => ({ value: String(a.id), label: `${a.methodName} · ${a.accountHolder}` })));
        // efectivo primero: es lo más común en caja
        const cash = active.find((a) => a.methodCode === 'EFECTIVO') ?? active[0];
        setAccountId(cash ? String(cash.id) : '');
      })
      .catch(() => setAccounts([]));
  }, [visible]);

  const selected = bookings.find((b) => String(b.id) === bookingId);
  const isValid = !!selected && accountId !== '';

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ bookingId: Number(bookingId), paymentAccountId: Number(accountId) });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Encabezado */}
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.title}>{texts.title}</Text>
              <Text style={styles.subtitle}>{texts.subtitle}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          {/* Campos */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            <ReservationField label={texts.service}>
              <SelectField
                value={bookingId}
                options={bookings.map((b) => ({ value: String(b.id), label: b.label }))}
                onChange={setBookingId}
              />
            </ReservationField>

            <View style={styles.row}>
              <ReservationField label={texts.amount} style={styles.flex}>
                <TextInput style={styles.input} value={selected ? formatCOP(selected.total) : '—'} editable={false} />
              </ReservationField>
              <ReservationField label={texts.method} style={styles.methodField}>
                <SelectField value={accountId} options={accounts} onChange={setAccountId} />
              </ReservationField>
            </View>
          </ScrollView>

          {/* Botones */}
          <View style={styles.footer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>{texts.cancel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.submitButton, !isValid && styles.disabled]}
              onPress={handleSubmit}
              disabled={!isValid}
            >
              <Text style={styles.submitText}>{texts.submit}</Text>
            </Pressable>
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
      maxHeight: '92%',
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
    subtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    body: { flexShrink: 1 },
    bodyContent: { gap: 14, padding: 20 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    methodField: { flex: 1.3 },
    input: {
      height: 46,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
      fontSize: 14,
      color: colors.text,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
    cancelButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    cancelText: { fontSize: 14, fontWeight: '700', color: colors.text },
    submitButton: { backgroundColor: colors.primary },
    submitText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    disabled: { opacity: 0.45 },
  });
