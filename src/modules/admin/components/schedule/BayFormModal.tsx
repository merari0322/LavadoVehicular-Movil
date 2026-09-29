import React, { useEffect, useMemo, useState } from 'react';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { LabeledSelect } from '../../../../shared/components/forms/LabeledSelect';
import { SelectOption } from '../../../../shared/components/forms/SelectField';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { BAY_STATUSES, Bay, BayFormValues, BayStatus } from '../../models/schedule';
import { OPERATORS } from '../../services/reservationMock';

interface BayFormModalProps {
  visible: boolean;
  bay: Bay | null; // null = crear, con valor = editar
  isNameTaken: (name: string, ignoreId?: string) => boolean;
  onClose: () => void;
  onSubmit: (values: BayFormValues) => void;
}

const texts = SCHEDULE_TEXTS.bays.form;

// Opciones de los selectores
const STATUS_OPTIONS: SelectOption[] = BAY_STATUSES.map((status) => ({
  value: status,
  label: SCHEDULE_TEXTS.bays.status[status],
}));

const OPERATOR_OPTIONS: SelectOption[] = [
  { value: '', label: SCHEDULE_TEXTS.bays.unassigned },
  ...OPERATORS.map((operator) => ({ value: operator.id, label: operator.name })),
];

// Modal para agregar o editar una bahía
export function BayFormModal({ visible, bay, isNameTaken, onClose, onSubmit }: BayFormModalProps) {
  const isEditing = bay !== null;

  const [name, setName] = useState('');
  const [status, setStatus] = useState<BayStatus>('active');
  const [operatorId, setOperatorId] = useState('');
  const [touched, setTouched] = useState(false);

  // Cada vez que se abre el modal se cargan los datos de la bahía (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(bay?.name ?? '');
    setStatus(bay?.status ?? 'active');
    setOperatorId(bay?.operatorId ?? '');
    setTouched(false);
  }, [visible, bay]);

  // Errores del nombre (el aviso de "muy corto" solo aparece después de escribir)
  const nameError = useMemo(() => {
    if (name.trim().length >= 2) {
      return isNameTaken(name, bay?.id) ? texts.errors.duplicate : undefined;
    }
    return touched ? texts.errors.name : undefined;
  }, [name, touched, bay, isNameTaken]);

  const isValid = name.trim().length >= 2 && !isNameTaken(name, bay?.id);

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({ name: name.trim(), status, operatorId });
  };

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      subtitle={texts.subtitle}
      cancelLabel={SCHEDULE_TEXTS.common.cancel}
      submitLabel={isEditing ? texts.save : texts.create}
      submitDisabled={!isValid}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={texts.name}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setTouched(true);
        }}
        placeholder={texts.namePlaceholder}
        error={nameError}
        autoCapitalize="sentences"
      />

      <LabeledSelect
        label={texts.status}
        value={status}
        options={STATUS_OPTIONS}
        onChange={(value) => setStatus(value as BayStatus)}
      />

      <LabeledSelect
        label={texts.operator}
        value={operatorId}
        options={OPERATOR_OPTIONS}
        onChange={setOperatorId}
      />
    </FormModal>
  );
}
