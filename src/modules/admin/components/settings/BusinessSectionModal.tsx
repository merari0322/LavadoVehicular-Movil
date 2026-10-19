import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { BusinessData } from '../../models/settings';
import { maskDate } from '../../utils/reservationUtils';
import { validateBusiness } from '../../viewmodels/useSettings';

// Un campo de la sección que se edita en el modal
export interface BusinessField {
  name: keyof BusinessData;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences';
  isDate?: boolean;
}

interface BusinessSectionModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  fields: BusinessField[];
  values: BusinessData;
  onClose: () => void;
  onApply: (partial: Partial<BusinessData>) => void;
}

const texts = SETTINGS_TEXTS.business;

// Modal del lápiz de Datos del negocio: edita una sección y la devuelve a la pantalla.
// Lo que se aplica queda como cambio pendiente hasta pulsar "Guardar cambios".
export function BusinessSectionModal({ visible, title, subtitle, fields, values, onClose, onApply }: BusinessSectionModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<Partial<BusinessData>>({});
  const [submitted, setSubmitted] = useState(false);

  // cada vez que se abre arranca con los valores actuales de la sección
  useEffect(() => {
    if (!visible) return;
    const initial: Partial<BusinessData> = {};
    fields.forEach((field) => {
      initial[field.name] = values[field.name];
    });
    setDraft(initial);
    setSubmitted(false);
  }, [visible, fields, values]);

  // misma validación que al guardar, pero solo de los campos de esta sección
  const allErrors = validateBusiness({ ...values, ...draft });
  const errorFor = (name: keyof BusinessData) => (submitted ? allErrors[name] : undefined);

  const handleApply = () => {
    setSubmitted(true);
    if (fields.some((field) => allErrors[field.name])) return;
    const trimmed: Partial<BusinessData> = {};
    fields.forEach((field) => {
      trimmed[field.name] = (draft[field.name] ?? '').trim();
    });
    onApply(trimmed);
  };

  return (
    <FormModal
      visible={visible}
      title={title}
      subtitle={subtitle}
      cancelLabel={SETTINGS_TEXTS.common.cancel}
      submitLabel={texts.apply}
      onClose={onClose}
      onSubmit={handleApply}
    >
      {fields.map((field) => (
        <LabeledInput
          key={field.name}
          label={texts.fields[field.name]}
          value={draft[field.name] ?? ''}
          onChangeText={(text) =>
            setDraft((prev) => ({ ...prev, [field.name]: field.isDate ? maskDate(text) : text }))
          }
          placeholder={field.isDate ? texts.datePlaceholder : texts.pending}
          error={errorFor(field.name)}
          keyboardType={field.isDate ? 'number-pad' : field.keyboardType}
          autoCapitalize={field.autoCapitalize}
          maxLength={field.isDate ? 10 : undefined}
        />
      ))}

      <View style={styles.hintBox}>
        <Text style={styles.hint}>{texts.modalHint}</Text>
      </View>
    </FormModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    hintBox: { paddingTop: 2 },
    hint: { fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  });
