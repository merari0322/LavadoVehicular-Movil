import React, { useEffect, useMemo, useState } from 'react';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { MANAGEMENT_TEXTS } from '../../constants/managementTexts';
import {
  ManagedService,
  SERVICE_CATEGORIES,
  SERVICE_DURATIONS,
  ServiceCategory,
  ServiceFormValues,
} from '../../models/management';
import { maskAmount, parseAmount } from '../../utils/paymentUtils';
import { ReservationField } from '../reservations/ReservationField';

interface ServiceFormModalProps {
  visible: boolean;
  service: ManagedService | null; // null = crear, con valor = editar
  onClose: () => void;
  onSubmit: (values: ServiceFormValues) => void;
}

const texts = MANAGEMENT_TEXTS.services.form;

const CATEGORY_OPTIONS: SelectOption[] = SERVICE_CATEGORIES.map((category) => ({
  value: category,
  label: MANAGEMENT_TEXTS.services.categories[category],
}));

// Modal para agregar o editar un servicio
export function ServiceFormModal({ visible, service, onClose, onSubmit }: ServiceFormModalProps) {
  const isEditing = service !== null;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(String(SERVICE_DURATIONS[1]));
  const [category, setCategory] = useState<ServiceCategory>('wash');
  const [loyaltyPoints, setLoyaltyPoints] = useState('0');

  // Cada vez que se abre el modal se cargan los datos del servicio (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(service?.name ?? '');
    setPrice(service ? maskAmount(String(service.price)) : '');
    setDescription(service?.description ?? '');
    setDuration(String(service?.duration ?? SERVICE_DURATIONS[1]));
    setCategory(service?.category ?? 'wash');
    setLoyaltyPoints(String(service?.loyaltyPoints ?? 0));
  }, [visible, service]);

  // Opciones de duración (incluye la actual si no está en la lista)
  const durationOptions = useMemo<SelectOption[]>(() => {
    const durations = Array.from(new Set([...SERVICE_DURATIONS, Number(duration)]))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);
    return durations.map((value) => ({
      value: String(value),
      label: MANAGEMENT_TEXTS.services.duration(value),
    }));
  }, [duration]);

  // El botón se habilita cuando hay nombre y precio válidos
  const isValid = name.trim().length >= 3 && parseAmount(price) > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit({
      name: name.trim(),
      price: parseAmount(price),
      description: description.trim(),
      duration: Number(duration),
      category,
      // solo dígitos: vacío equivale a 0 (el servicio no da puntos)
      loyaltyPoints: Number(loyaltyPoints) || 0,
    });
  };

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      subtitle={isEditing ? texts.editSubtitle : texts.createSubtitle}
      cancelLabel={MANAGEMENT_TEXTS.common.cancel}
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
        autoCapitalize="sentences"
      />

      <LabeledInput
        label={texts.price}
        value={price}
        onChangeText={(text) => setPrice(maskAmount(text))}
        placeholder={texts.pricePlaceholder}
        hint={texts.priceHint}
        keyboardType="number-pad"
        maxLength={11}
        prefix="$"
      />

      <LabeledInput
        label={texts.description}
        value={description}
        onChangeText={setDescription}
        placeholder={texts.descriptionPlaceholder}
        multiline
      />

      <ReservationField label={texts.duration}>
        <SelectField value={duration} options={durationOptions} onChange={setDuration} />
      </ReservationField>

      <ReservationField label={texts.category}>
        <SelectField
          value={category}
          options={CATEGORY_OPTIONS}
          onChange={(value) => setCategory(value as ServiceCategory)}
        />
      </ReservationField>

      {/* puntos de fidelización: los gana el cliente cuando su pago queda aprobado */}
      <LabeledInput
        label={texts.points}
        value={loyaltyPoints}
        onChangeText={(text) => setLoyaltyPoints(text.replace(/\D/g, ''))}
        placeholder="0"
        hint={texts.pointsHint}
        keyboardType="number-pad"
        maxLength={5}
      />
    </FormModal>
  );
}
