import React, { useEffect, useState } from 'react';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { LabeledSelect } from '../../../../shared/components/forms/LabeledSelect';
import { SelectOption } from '../../../../shared/components/forms/SelectField';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import {
  PAYMENT_TYPES,
  PaymentMethod,
  PaymentMethodFormValues,
  PaymentType,
} from '../../models/settings';

interface PaymentMethodFormModalProps {
  visible: boolean;
  method: PaymentMethod | null; // null = crear, con valor = editar
  isNameTaken: (name: string, ignoreId?: string) => boolean;
  onClose: () => void;
  onSubmit: (values: PaymentMethodFormValues) => void;
}

const texts = SETTINGS_TEXTS.payments.form;

// Opciones del selector de tipo
const TYPE_OPTIONS: SelectOption[] = PAYMENT_TYPES.map((type) => ({
  value: type,
  label: SETTINGS_TEXTS.payments.types[type],
}));

// Modal para agregar o editar un método de pago
export function PaymentMethodFormModal({ visible, method, isNameTaken, onClose, onSubmit }: PaymentMethodFormModalProps) {
  const isEditing = method !== null;

  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentType>('wallet');
  const [holder, setHolder] = useState('');
  const [account, setAccount] = useState('');
  const [requiresQr, setRequiresQr] = useState(true);

  // Cada vez que se abre el modal se cargan los datos del método (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(method?.name ?? '');
    setType(method?.type ?? 'wallet');
    setHolder(method?.holder ?? '');
    setAccount(method?.account ?? '');
    setRequiresQr(method?.requiresQr ?? true);
  }, [visible, method]);

  // Errores en vivo (solo se avisa cuando el campo ya tiene contenido)
  const nameTaken = name.trim().length >= 2 && isNameTaken(name, method?.id);
  const nameError = nameTaken
    ? texts.errors.duplicate
    : name.trim().length > 0 && name.trim().length < 2
      ? texts.errors.name
      : undefined;
  const holderError =
    holder.trim().length > 0 && holder.trim().length < 2 ? texts.errors.holder : undefined;
  const accountError =
    account.trim().length > 0 && account.trim().length < 4 ? texts.errors.account : undefined;

  // El botón se habilita cuando todo es válido
  const isValid =
    name.trim().length >= 2 &&
    !nameTaken &&
    holder.trim().length >= 2 &&
    account.trim().length >= 4;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      name: name.trim(),
      type,
      holder: holder.trim(),
      account: account.trim(),
      requiresQr,
    });
  };

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      subtitle={texts.subtitle}
      cancelLabel={SETTINGS_TEXTS.common.cancel}
      submitLabel={isEditing ? texts.save : texts.create}
      submitDisabled={!isValid}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={texts.name}
        value={name}
        onChangeText={setName}
        placeholder={texts.namePlaceholder}
        error={nameError}
        autoCapitalize="sentences"
      />

      <LabeledSelect
        label={texts.type}
        value={type}
        options={TYPE_OPTIONS}
        onChange={(value) => setType(value as PaymentType)}
      />

      <LabeledInput
        label={texts.holder}
        value={holder}
        onChangeText={setHolder}
        placeholder={texts.holderPlaceholder}
        error={holderError}
        autoCapitalize="sentences"
      />

      <LabeledInput
        label={texts.account}
        value={account}
        onChangeText={setAccount}
        placeholder={texts.accountPlaceholder}
        error={accountError}
      />

      <CheckboxField checked={requiresQr} label={texts.requiresQr} onChange={setRequiresQr} />
    </FormModal>
  );
}
