import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledSelect } from '../../../../shared/components/forms/LabeledSelect';
import { SelectOption } from '../../../../shared/components/forms/SelectField';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import {
  AssignShiftValues,
  OPERATOR_STATUSES,
  Operator,
  OperatorStatus,
  WorkBay,
} from '../../models/operator';

interface AssignShiftModalProps {
  visible: boolean;
  operators: Operator[];
  initialOperatorId: string | null; // Operario preseleccionado (null = el primero)
  getAvailableBays: (operatorId?: string) => WorkBay[];
  onClose: () => void;
  onSubmit: (values: AssignShiftValues) => void;
}

const texts = OPERATOR_TEXTS.assign;

const STATUS_OPTIONS: SelectOption[] = OPERATOR_STATUSES.map((status) => ({
  value: status,
  label: OPERATOR_TEXTS.status[status],
}));

// Modal para asignar el estado y la bahía del turno de un operario
export function AssignShiftModal({
  visible,
  operators,
  initialOperatorId,
  getAvailableBays,
  onClose,
  onSubmit,
}: AssignShiftModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [operatorId, setOperatorId] = useState('');
  const [status, setStatus] = useState<OperatorStatus>('available');
  const [bayId, setBayId] = useState('');

  // Carga el estado y la bahía actuales del operario elegido
  const loadOperator = (id: string) => {
    const target = operators.find((item) => item.id === id);
    setOperatorId(id);
    setStatus(target?.status ?? 'available');
    setBayId(target?.bayId ?? '');
  };

  // Cada vez que se abre el modal se preselecciona el operario
  useEffect(() => {
    if (!visible) return;
    loadOperator(initialOperatorId ?? operators[0]?.id ?? '');
  }, [visible, initialOperatorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const operatorOptions = useMemo<SelectOption[]>(
    () => operators.map((item) => ({ value: item.id, label: item.name })),
    [operators],
  );

  const bayOptions = useMemo<SelectOption[]>(
    () => [
      { value: '', label: texts.noBay },
      ...getAvailableBays(operatorId).map((bay) => ({ value: bay.id, label: bay.name })),
    ],
    [getAvailableBays, operatorId],
  );

  const isAbsent = status === 'absent';

  const handleSubmit = () => {
    if (!operatorId) return;
    onSubmit({ operatorId, status, bayId: isAbsent ? '' : bayId });
  };

  return (
    <FormModal
      visible={visible}
      title={texts.title}
      subtitle={texts.subtitle}
      cancelLabel={OPERATOR_TEXTS.common.cancel}
      submitLabel={texts.submit}
      submitDisabled={!operatorId}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledSelect label={`${texts.operator} *`} value={operatorId} options={operatorOptions} onChange={loadOperator} />

      <LabeledSelect
        label={texts.status}
        value={status}
        options={STATUS_OPTIONS}
        onChange={(value) => setStatus(value as OperatorStatus)}
      />

      {/* En permiso médico no se puede asignar bahía */}
      {isAbsent ? (
        <View>
          <Text style={styles.label}>{texts.bay}</Text>
          <Text style={styles.hint}>{texts.hint}</Text>
        </View>
      ) : (
        <View>
          <LabeledSelect label={texts.bay} value={bayId} options={bayOptions} onChange={setBayId} />
          <Text style={[styles.hint, styles.hintSpacing]}>{texts.hint}</Text>
        </View>
      )}
    </FormModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { marginBottom: 6, fontSize: 13, fontWeight: '500', color: colors.textSecondary },
    hint: { fontSize: 13, color: colors.textSecondary },
    hintSpacing: { marginTop: 8 },
  });
