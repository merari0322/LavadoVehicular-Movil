import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { fontSize, fontWeight, useTheme } from '../../../app/theme';
import { FormModal } from '../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../shared/components/forms/LabeledInput';
import { SelectField, SelectOption } from '../../../shared/components/forms/SelectField';
import { ReservationField } from '../../admin/components/reservations/ReservationField';
import { PLATE_LENGTH, VEHICLE_TYPES, VehicleFormValue, isValidPlate, normalizePlate } from '../models/client';

interface VehicleFormModalProps {
  visible: boolean;
  // si viene, el modal abre en modo edición
  vehicle: VehicleFormValue | null;
  // placas ya registradas por el cliente (sin guion) para no repetirlas
  takenPlates: string[];
  onClose: () => void;
  // guarda en el backend; devuelve el mensaje de error o null si se guardó
  onSubmit: (value: VehicleFormValue) => Promise<string | null>;
}

type Errors = Partial<Record<keyof VehicleFormValue, string>>;

const BRAND_REGEX = /^[a-zA-ZÀ-ÿ0-9\s-]+$/;
const COLOR_REGEX = /^[a-zA-ZÀ-ÿ\s]*$/;

const EMPTY: VehicleFormValue = { type: '', brand: '', model: '', plate: '', color: '' };

// registrar o editar un vehículo (mismas validaciones que el modal de la web)
export function VehicleFormModal({ visible, vehicle, takenPlates, onClose, onSubmit }: VehicleFormModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isEdit = vehicle !== null;

  const [form, setForm] = useState<VehicleFormValue>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // cada vez que se abre arranca con los datos del vehículo o vacío (solo al abrir: si
  // dependiera de "vehicle", se borraría lo escrito en cada render del padre)
  useEffect(() => {
    if (!visible) return;
    setForm(vehicle ? { ...vehicle, plate: normalizePlate(vehicle.plate) } : EMPTY);
    setErrors({});
    setServerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const typeOptions = useMemo<SelectOption[]>(
    () => VEHICLE_TYPES.map((type) => ({ value: type, label: t(`VEHICLE.${type}`) })),
    [t],
  );

  const isMoto = form.type === 'MOTO';

  const change = (field: keyof VehicleFormValue, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): Errors => {
    const found: Errors = {};
    if (!form.type) found.type = t('VEHICLES.VALIDATION.TYPE_REQUIRED');

    const brand = form.brand.trim();
    if (!brand) found.brand = t('VEHICLES.VALIDATION.BRAND_REQUIRED');
    else if (brand.length < 2) found.brand = t('VEHICLES.VALIDATION.BRAND_MIN');
    else if (!BRAND_REGEX.test(brand)) found.brand = t('VEHICLES.VALIDATION.BRAND_INVALID');

    if (!form.plate) found.plate = t('VEHICLES.VALIDATION.PLATE_REQUIRED');
    else if (form.type && !isValidPlate(form.plate, form.type)) {
      found.plate = t(isMoto ? 'VEHICLES.VALIDATION.PLATE_MOTO_INVALID' : 'VEHICLES.VALIDATION.PLATE_CAR_INVALID');
    } else if (takenPlates.includes(form.plate)) found.plate = t('VEHICLES.VALIDATION.PLATE_TAKEN');

    if (!COLOR_REGEX.test(form.color.trim())) found.color = t('VEHICLES.VALIDATION.COLOR_INVALID');
    return found;
  };

  const handleSubmit = async () => {
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    if (saving) return;

    setSaving(true);
    setServerError(null);
    const failure = await onSubmit(form);
    setSaving(false);
    if (failure) setServerError(failure);
  };

  return (
    <FormModal
      visible={visible}
      title={t(isEdit ? 'VEHICLES.MODAL.EDIT_TITLE' : 'VEHICLES.MODAL.TITLE')}
      subtitle={t(isEdit ? 'VEHICLES.MODAL.EDIT_SUBTITLE' : 'VEHICLES.MODAL.SUBTITLE')}
      cancelLabel={t('VEHICLES.MODAL.CANCEL')}
      submitLabel={t(isEdit ? 'VEHICLES.MODAL.EDIT_SAVE' : 'VEHICLES.MODAL.SAVE')}
      submitDisabled={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <ReservationField label={t('VEHICLES.MODAL.TYPE')} required error={errors.type}>
        <SelectField
          value={form.type}
          options={typeOptions}
          placeholder={t('VEHICLES.MODAL.TYPE_PLACEHOLDER')}
          hasError={Boolean(errors.type)}
          onChange={(value) => change('type', value)}
        />
      </ReservationField>

      <LabeledInput
        label={t('VEHICLES.MODAL.BRAND')}
        required
        value={form.brand}
        onChangeText={(text) => change('brand', text)}
        placeholder="Mazda"
        error={errors.brand}
        maxLength={30}
      />

      <LabeledInput
        label={t('VEHICLES.MODAL.MODEL')}
        value={form.model}
        onChangeText={(text) => change('model', text)}
        placeholder="3 Sedán"
        maxLength={30}
      />

      <LabeledInput
        label={t('VEHICLES.MODAL.PLATE')}
        required
        value={form.plate}
        // mayúsculas, sin espacios ni símbolos y máximo 6 caracteres
        onChangeText={(text) => change('plate', normalizePlate(text))}
        placeholder={isMoto ? 'ABC12D' : 'ABC123'}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={PLATE_LENGTH}
        error={errors.plate}
      />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {t(isMoto ? 'VEHICLES.MODAL.PLATE_HINT_MOTO' : 'VEHICLES.MODAL.PLATE_HINT_CAR')}
      </Text>

      <LabeledInput
        label={t('VEHICLES.MODAL.COLOR')}
        value={form.color}
        onChangeText={(text) => change('color', text)}
        placeholder="Gris"
        error={errors.color}
        maxLength={20}
      />

      {/* error del servidor (placa ya registrada, sin conexión...) */}
      {serverError ? <Text style={[styles.serverError, { color: colors.error }]}>{serverError}</Text> : null}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: -8, fontSize: fontSize.caption },
  serverError: { marginTop: 4, fontSize: fontSize.small, fontWeight: fontWeight.semibold, textAlign: 'center' },
});
