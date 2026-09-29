import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { AbsenceFormValues } from '../../models/operator';
import { displayToISO, getTodayISO, isoToDisplay, maskDate } from '../../utils/reservationUtils';

interface AbsenceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: AbsenceFormValues) => void;
}

const texts = OPERATOR_TEXTS.absence;

// Modal para registrar una incapacidad (período en que el operario no está disponible)
export function AbsenceModal({ visible, onClose, onSubmit }: AbsenceModalProps) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');

  // Cada vez que se abre el modal se reinician los campos (ambas fechas en hoy)
  useEffect(() => {
    if (!visible) return;
    const today = isoToDisplay(getTodayISO());
    setStart(today);
    setEnd(today);
    setReason('');
  }, [visible]);

  const startISO = displayToISO(start);
  const endISO = displayToISO(end);

  // Errores en vivo (las fechas solo se validan cuando están completas)
  const startError = start.length === 10 && !startISO ? texts.errors.date : undefined;
  const endError =
    end.length === 10 && !endISO
      ? texts.errors.date
      : startISO && endISO && endISO < startISO
        ? texts.errors.range
        : undefined;

  // El botón se habilita cuando todo es válido
  const isValid = Boolean(startISO) && Boolean(endISO) && !endError && reason.trim().length >= 3;

  const handleSubmit = () => {
    if (!isValid || !startISO || !endISO) return;
    onSubmit({ start: startISO, end: endISO, reason: reason.trim() });
  };

  return (
    <FormModal
      visible={visible}
      title={texts.title}
      subtitle={texts.subtitle}
      cancelLabel={OPERATOR_TEXTS.common.cancel}
      submitLabel={texts.save}
      submitDisabled={!isValid}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <View style={styles.row}>
        <LabeledInput
          containerStyle={styles.flex}
          label={texts.start}
          required
          value={start}
          onChangeText={(text) => setStart(maskDate(text))}
          error={startError}
          keyboardType="number-pad"
          maxLength={10}
        />
        <LabeledInput
          containerStyle={styles.flex}
          label={texts.end}
          required
          value={end}
          onChangeText={(text) => setEnd(maskDate(text))}
          error={endError}
          keyboardType="number-pad"
          maxLength={10}
        />
      </View>

      <LabeledInput
        label={texts.reason}
        required
        value={reason}
        onChangeText={setReason}
        placeholder={texts.reasonPlaceholder}
        multiline
      />
    </FormModal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
