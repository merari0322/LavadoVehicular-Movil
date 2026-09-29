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
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { SelectField, SelectOption } from '../../../shared/components/SelectField';
import { withAlpha } from '../../../shared/utils/color';
import { PAYMENT_TEXTS } from '../constants/paymentTexts';
import { ManualPaymentValues, PAYMENT_METHODS, PaymentMethod } from '../models/payment';
import { maskAmount, parseAmount } from '../utils/paymentUtils';
import { ReservationField } from './ReservationField';

interface ManualPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: ManualPaymentValues) => void;
}

// Opciones del selector de método de pago
const METHOD_OPTIONS: SelectOption[] = PAYMENT_METHODS.map((method) => ({
  value: method,
  label: PAYMENT_TEXTS.methodsForm[method],
}));

// Modal para registrar un pago hecho en caja
export function ManualPaymentModal({ visible, onClose, onSubmit }: ManualPaymentModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = PAYMENT_TEXTS.form;

  const [customerName, setCustomerName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');

  // Cada vez que se abre el modal se reinicia el formulario
  useEffect(() => {
    if (visible) {
      setCustomerName('');
      setServiceName('');
      setAmount('');
      setMethod('cash');
    }
  }, [visible]);

  // El botón se habilita solo cuando los datos son válidos
  const isValid =
    customerName.trim().length >= 3 && serviceName.trim().length >= 3 && parseAmount(amount) > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      customerName: customerName.trim(),
      serviceName: serviceName.trim(),
      amount: parseAmount(amount),
      method,
    });
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
            <ReservationField label={texts.customer}>
              <TextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder={texts.customerPlaceholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </ReservationField>

            <ReservationField label={texts.service}>
              <TextInput
                style={styles.input}
                value={serviceName}
                onChangeText={setServiceName}
                placeholder={texts.servicePlaceholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="sentences"
              />
            </ReservationField>

            <View style={styles.row}>
              <ReservationField label={texts.amount} style={styles.flex}>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={(text) => setAmount(maskAmount(text))}
                  placeholder={texts.amountPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={11}
                />
              </ReservationField>
              <ReservationField label={texts.method} style={styles.methodField}>
                <SelectField
                  value={method}
                  options={METHOD_OPTIONS}
                  onChange={(value) => setMethod(value as PaymentMethod)}
                />
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
