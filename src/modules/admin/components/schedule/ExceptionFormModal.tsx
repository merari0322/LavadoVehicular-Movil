import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { LabeledSelect } from '../../../../shared/components/forms/LabeledSelect';
import { SelectOption } from '../../../../shared/components/forms/SelectField';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import {
  EXCEPTION_TYPES,
  ExceptionFormValues,
  ExceptionType,
  ScheduleException,
} from '../../models/schedule';
import { displayToISO, getTodayISO, isValidTime, isoToDisplay, maskDate } from '../../utils/reservationUtils';
import { TimeField } from '../common/TimeField';

interface ExceptionFormModalProps {
  visible: boolean;
  exception: ScheduleException | null; // null = crear, con valor = editar
  isDateTaken: (date: string, ignoreId?: string) => boolean;
  onClose: () => void;
  onSubmit: (values: ExceptionFormValues) => void;
}

const texts = SCHEDULE_TEXTS.exceptions.form;

// Opciones del selector de tipo
const TYPE_OPTIONS: SelectOption[] = EXCEPTION_TYPES.map((type) => ({
  value: type,
  label: SCHEDULE_TEXTS.exceptions.types[type],
}));

// Modal para agregar o editar una excepción
export function ExceptionFormModal({ visible, exception, isDateTaken, onClose, onSubmit }: ExceptionFormModalProps) {
  const { colors } = useTheme();
  const isEditing = exception !== null;

  const [date, setDate] = useState('');
  const [type, setType] = useState<ExceptionType>('holiday');
  const [closedAllDay, setClosedAllDay] = useState(true);
  const [opening, setOpening] = useState('09:00');
  const [closing, setClosing] = useState('14:00');
  const [description, setDescription] = useState('');

  // Cada vez que se abre el modal se cargan los datos de la excepción (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setDate(exception ? isoToDisplay(exception.date) : '');
    setType(exception?.type ?? 'holiday');
    setClosedAllDay(exception?.closedAllDay ?? true);
    setOpening(exception?.opening ?? '09:00');
    setClosing(exception?.closing ?? '14:00');
    setDescription(exception?.description ?? '');
  }, [visible, exception]);

  // Al elegir "Horario especial" se sugiere un horario reducido en lugar de cerrar todo el día
  const handleTypeChange = (value: string) => {
    const next = value as ExceptionType;
    setType(next);
    setClosedAllDay(next !== 'special');
  };

  // Errores en vivo (la fecha solo se valida cuando está completa)
  const dateISO = displayToISO(date);
  const dateError =
    date.length === 10 && !dateISO
      ? texts.errors.date
      : dateISO && isDateTaken(dateISO, exception?.id)
        ? texts.errors.duplicate
        : undefined;

  const timesValid = isValidTime(opening) && isValidTime(closing);
  const timesError = closedAllDay
    ? undefined
    : !timesValid
      ? texts.errors.time
      : opening >= closing
        ? texts.errors.range
        : undefined;

  // El botón se habilita cuando todo es válido
  const isValid = Boolean(dateISO) && !dateError && !timesError && description.trim().length >= 3;

  const handleSubmit = () => {
    if (!isValid || !dateISO) return;
    onSubmit({
      date: dateISO,
      type,
      closedAllDay,
      opening,
      closing,
      description: description.trim(),
    });
  };

  // Fecha por defecto sugerida como ayuda visual en el campo vacío
  const placeholder = useMemo(() => isoToDisplay(getTodayISO()), []);

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      cancelLabel={SCHEDULE_TEXTS.common.cancel}
      submitLabel={texts.save}
      submitDisabled={!isValid}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <View style={styles.row}>
        <LabeledInput
          containerStyle={styles.flex}
          label={texts.date}
          value={date}
          onChangeText={(text) => setDate(maskDate(text))}
          placeholder={placeholder}
          error={dateError}
          keyboardType="number-pad"
          maxLength={10}
        />
        <LabeledSelect
          containerStyle={styles.flex}
          label={texts.type}
          value={type}
          options={TYPE_OPTIONS}
          onChange={handleTypeChange}
        />
      </View>

      <CheckboxField checked={closedAllDay} label={texts.closedAllDay} onChange={setClosedAllDay} />

      {/* Las horas solo aplican si no está cerrado todo el día */}
      {!closedAllDay ? (
        <View>
          <View style={styles.timesRow}>
            <TimeField label={texts.opening} value={opening} onChange={setOpening} hasError={Boolean(timesError)} />
            <TimeField label={texts.closing} value={closing} onChange={setClosing} hasError={Boolean(timesError)} />
          </View>
          {timesError ? <Text style={[styles.errorText, { color: colors.error }]}>{timesError}</Text> : null}
        </View>
      ) : null}

      <LabeledInput
        label={texts.description}
        value={description}
        onChangeText={setDescription}
        placeholder={texts.descriptionPlaceholder}
        multiline
      />
    </FormModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  timesRow: { flexDirection: 'row', gap: 12 },
  errorText: { marginTop: 4, fontSize: 12, fontWeight: '600' },
});
