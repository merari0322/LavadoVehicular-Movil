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
import { TEXTS } from '../../constants/reservationTexts';
import {
  RESERVATION_STATUSES,
  Reservation,
  ReservationFormValues,
  ReservationStatus,
} from '../../models/reservation';
import { BAYS, OPERATORS, SERVICES, getServiceById } from '../../services/reservationMock';
import {
  displayToISO,
  getTodayISO,
  isValidTime,
  isoToDisplay,
  maskDate,
  maskTime,
} from '../../utils/reservationUtils';
import { ReservationField } from './ReservationField';

interface ReservationFormModalProps {
  visible: boolean;
  reservation: Reservation | null; // null = crear, con valor = editar
  onClose: () => void;
  onSubmit: (values: ReservationFormValues) => void;
}

// Estado del formulario: todo como texto para poder escribirlo en los inputs
interface FormState {
  customerName: string;
  phone: string;
  email: string;
  vehicle: string;
  plate: string;
  serviceId: string;
  date: string; // dd/mm/aaaa
  time: string; // hh:mm
  duration: string;
  bayId: string;
  operatorId: string;
  status: ReservationStatus;
  notes: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Opciones de los selectores
const SERVICE_OPTIONS: SelectOption[] = SERVICES.map((item) => ({ value: item.id, label: item.name }));
const BAY_OPTIONS: SelectOption[] = [
  { value: '', label: TEXTS.form.noBay },
  ...BAYS.map((item) => ({ value: item.id, label: item.name })),
];
const OPERATOR_OPTIONS: SelectOption[] = [
  { value: '', label: TEXTS.form.noOperator },
  ...OPERATORS.map((item) => ({ value: item.id, label: item.name })),
];
const STATUS_OPTIONS: SelectOption[] = RESERVATION_STATUSES.map((status) => ({
  value: status,
  label: TEXTS.status[status],
}));

// Valores iniciales: los de la reserva (editar) o unos por defecto (crear)
const buildInitialState = (reservation: Reservation | null): FormState => {
  if (reservation) {
    return {
      customerName: reservation.customerName,
      phone: reservation.phone,
      email: reservation.email,
      vehicle: reservation.vehicle,
      plate: reservation.plate,
      serviceId: reservation.serviceId,
      date: isoToDisplay(reservation.date),
      time: reservation.time,
      duration: String(reservation.duration),
      bayId: reservation.bayId,
      operatorId: reservation.operatorId,
      status: reservation.status,
      notes: reservation.notes,
    };
  }

  return {
    customerName: '',
    phone: '',
    email: '',
    vehicle: '',
    plate: '',
    serviceId: SERVICES[0].id,
    date: isoToDisplay(getTodayISO()),
    time: '09:00',
    duration: String(SERVICES[0].duration),
    bayId: '',
    operatorId: '',
    status: 'confirmed',
    notes: '',
  };
};

// Valida el formulario y devuelve los errores por campo
const validate = (state: FormState): FormErrors => {
  const errors: FormErrors = {};
  const messages = TEXTS.form.errors;

  if (state.customerName.trim().length < 3) errors.customerName = messages.customer;
  if (state.phone.replace(/\D/g, '').length < 7) errors.phone = messages.phone;
  if (state.email.trim() && !EMAIL_PATTERN.test(state.email.trim())) errors.email = messages.email;
  if (!state.vehicle.trim()) errors.vehicle = messages.vehicle;
  if (!state.plate.trim()) errors.plate = messages.plate;
  if (!state.serviceId) errors.serviceId = messages.service;
  if (!displayToISO(state.date)) errors.date = messages.date;
  if (!isValidTime(state.time)) errors.time = messages.time;

  const duration = Number(state.duration);
  if (!Number.isInteger(duration) || duration <= 0) errors.duration = messages.duration;

  return errors;
};

export function ReservationFormModal({ visible, reservation, onClose, onSubmit }: ReservationFormModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isEditing = reservation !== null;
  const [state, setState] = useState<FormState>(() => buildInitialState(reservation));
  const [errors, setErrors] = useState<FormErrors>({});

  // Cada vez que se abre el modal se reinicia el formulario
  useEffect(() => {
    if (visible) {
      setState(buildInitialState(reservation));
      setErrors({});
    }
  }, [visible, reservation]);

  // Cambia un campo y limpia su error
  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Al cambiar el servicio se sugiere su duración por defecto
  const handleServiceChange = (serviceId: string) => {
    const service = getServiceById(serviceId);
    setState((prev) => ({
      ...prev,
      serviceId,
      duration: service ? String(service.duration) : prev.duration,
    }));
    setErrors((prev) => ({ ...prev, serviceId: undefined, duration: undefined }));
  };

  const handleSubmit = () => {
    const found = validate(state);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSubmit({
      customerName: state.customerName.trim(),
      phone: state.phone.trim(),
      email: state.email.trim(),
      vehicle: state.vehicle.trim(),
      plate: state.plate.trim(),
      serviceId: state.serviceId,
      date: displayToISO(state.date) as string,
      time: state.time,
      duration: Number(state.duration),
      bayId: state.bayId,
      operatorId: state.operatorId,
      status: state.status,
      notes: state.notes.trim(),
    });
  };

  // Estilo de un input (con borde rojo si tiene error)
  const inputStyle = (field: keyof FormState) => [styles.input, errors[field] ? styles.inputError : null];

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
              <Text style={styles.title}>{isEditing ? TEXTS.form.editTitle : TEXTS.form.createTitle}</Text>
              <Text style={styles.subtitle}>{TEXTS.form.subtitle}</Text>
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
            <ReservationField label={TEXTS.form.customer} required error={errors.customerName}>
              <TextInput
                style={inputStyle('customerName')}
                value={state.customerName}
                onChangeText={(text) => setField('customerName', text)}
                placeholder={TEXTS.form.customerPlaceholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </ReservationField>

            <ReservationField label={TEXTS.form.phone} required error={errors.phone}>
              <TextInput
                style={inputStyle('phone')}
                value={state.phone}
                onChangeText={(text) => setField('phone', text)}
                placeholder={TEXTS.form.phonePlaceholder}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </ReservationField>

            <ReservationField label={TEXTS.form.email} error={errors.email}>
              <TextInput
                style={inputStyle('email')}
                value={state.email}
                onChangeText={(text) => setField('email', text)}
                placeholder={TEXTS.form.emailPlaceholder}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </ReservationField>

            <View style={styles.row}>
              <ReservationField label={TEXTS.form.vehicle} required error={errors.vehicle} style={styles.flex}>
                <TextInput
                  style={inputStyle('vehicle')}
                  value={state.vehicle}
                  onChangeText={(text) => setField('vehicle', text)}
                  placeholder={TEXTS.form.vehiclePlaceholder}
                  placeholderTextColor={colors.textMuted}
                />
              </ReservationField>
              <ReservationField label={TEXTS.form.plate} required error={errors.plate} style={styles.flex}>
                <TextInput
                  style={inputStyle('plate')}
                  value={state.plate}
                  onChangeText={(text) => setField('plate', text.toUpperCase())}
                  placeholder={TEXTS.form.platePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  maxLength={8}
                />
              </ReservationField>
            </View>

            <ReservationField label={TEXTS.form.service} required error={errors.serviceId}>
              <SelectField
                value={state.serviceId}
                options={SERVICE_OPTIONS}
                onChange={handleServiceChange}
                hasError={Boolean(errors.serviceId)}
              />
            </ReservationField>

            <View style={styles.row}>
              <ReservationField label={TEXTS.form.date} required error={errors.date} style={styles.dateField}>
                <TextInput
                  style={inputStyle('date')}
                  value={state.date}
                  onChangeText={(text) => setField('date', maskDate(text))}
                  placeholder={TEXTS.filters.datePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </ReservationField>
              <ReservationField label={TEXTS.form.time} required error={errors.time} style={styles.smallField}>
                <TextInput
                  style={inputStyle('time')}
                  value={state.time}
                  onChangeText={(text) => setField('time', maskTime(text))}
                  placeholder="hh:mm"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </ReservationField>
            </View>

            <View style={styles.row}>
              <ReservationField label={TEXTS.form.duration} error={errors.duration} style={styles.flex}>
                <TextInput
                  style={inputStyle('duration')}
                  value={state.duration}
                  onChangeText={(text) => setField('duration', text.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </ReservationField>
              <ReservationField label={TEXTS.form.bay} style={styles.flex}>
                <SelectField
                  value={state.bayId}
                  options={BAY_OPTIONS}
                  onChange={(value) => setField('bayId', value)}
                />
              </ReservationField>
            </View>

            <ReservationField label={TEXTS.form.operator}>
              <SelectField
                value={state.operatorId}
                options={OPERATOR_OPTIONS}
                onChange={(value) => setField('operatorId', value)}
              />
            </ReservationField>

            <ReservationField label={TEXTS.form.status}>
              <SelectField
                value={state.status}
                options={STATUS_OPTIONS}
                onChange={(value) => setField('status', value as ReservationStatus)}
              />
            </ReservationField>

            <ReservationField label={TEXTS.form.notes}>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={state.notes}
                onChangeText={(text) => setField('notes', text)}
                placeholder={TEXTS.form.notesPlaceholder}
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </ReservationField>
          </ScrollView>

          {/* Botones */}
          <View style={styles.footer}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>{TEXTS.form.cancel}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={styles.submitText}>{isEditing ? TEXTS.form.save : TEXTS.form.create}</Text>
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
    dateField: { flex: 1.5 },
    smallField: { flex: 1 },
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
    inputError: { borderColor: colors.error },
    notesInput: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
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
  });
