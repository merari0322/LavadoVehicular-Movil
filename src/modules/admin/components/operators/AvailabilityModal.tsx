import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { AvailabilityDay, Operator } from '../../models/operator';
import { isValidTime } from '../../utils/reservationUtils';
import { TimeField } from '../common/TimeField';

interface AvailabilityModalProps {
  visible: boolean;
  operator: Operator | null;
  onClose: () => void;
  onSubmit: (availability: AvailabilityDay[]) => void;
}

const texts = OPERATOR_TEXTS.availability;

// Un día activo es inválido si las horas están mal escritas o el inicio no es antes del fin
const hasError = (item: AvailabilityDay): boolean =>
  item.enabled && (!isValidTime(item.start) || !isValidTime(item.end) || item.start >= item.end);

// Modal para editar la disponibilidad semanal del operario
export function AvailabilityModal({ visible, operator, onClose, onSubmit }: AvailabilityModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [days, setDays] = useState<AvailabilityDay[]>([]);

  // Cada vez que se abre el modal se carga una copia de la disponibilidad actual
  useEffect(() => {
    if (visible && operator) setDays(operator.availability.map((item) => ({ ...item })));
  }, [visible, operator]);

  // Cambia solo los campos indicados de un día
  const updateDay = (day: AvailabilityDay['day'], partial: Partial<AvailabilityDay>) =>
    setDays((prev) => prev.map((item) => (item.day === day ? { ...item, ...partial } : item)));

  const isValid = days.every((item) => !hasError(item));

  return (
    <FormModal
      visible={visible}
      title={texts.title}
      subtitle={texts.subtitle}
      cancelLabel={OPERATOR_TEXTS.common.cancel}
      submitLabel={texts.save}
      submitDisabled={!isValid}
      onClose={onClose}
      onSubmit={() => isValid && onSubmit(days)}
    >
      <Text style={styles.hint}>{texts.hint}</Text>

      {days.map((item) => (
        <View key={item.day} style={styles.dayBlock}>
          <CheckboxField
            checked={item.enabled}
            label={SCHEDULE_TEXTS.days[item.day]}
            onChange={(checked) => updateDay(item.day, { enabled: checked })}
          />
          <View style={styles.timesRow}>
            <TimeField
              label={texts.start}
              value={item.start}
              onChange={(value) => updateDay(item.day, { start: value })}
              disabled={!item.enabled}
              hasError={hasError(item)}
            />
            <TimeField
              label={texts.end}
              value={item.end}
              onChange={(value) => updateDay(item.day, { end: value })}
              disabled={!item.enabled}
              hasError={hasError(item)}
            />
          </View>
          {hasError(item) ? <Text style={styles.error}>{texts.error}</Text> : null}
        </View>
      ))}
    </FormModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    hint: { fontSize: 13, color: colors.textSecondary },
    dayBlock: { gap: 8 },
    timesRow: { flexDirection: 'row', gap: 12 },
    error: { fontSize: 12, fontWeight: '600', color: colors.error },
  });
