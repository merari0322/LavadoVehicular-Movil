import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../../../../app/theme';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { UserRole } from '../../../../core/services/auth';
import { CreateAccountPayload } from '../../../../core/services/users/UserAdminService';
import { MANAGEMENT_TEXTS } from '../../constants/managementTexts';
import { Role } from '../../models/management';
import { isValidEmail } from '../../utils/managementUtils';
import { ReservationField } from '../reservations/ReservationField';

interface UserFormModalProps {
  visible: boolean;
  roles: Role[];
  onClose: () => void;
  // crea la cuenta en el backend; devuelve el mensaje de error o null si se creó
  onSubmit: (values: CreateAccountPayload) => Promise<string | null>;
}

type Errors = Partial<Record<'documentNumber' | 'firstName' | 'lastName' | 'email' | 'password', string>>;

const texts = MANAGEMENT_TEXTS.users.form;

const DOCUMENT_REGEX = /^[0-9]{5,20}$/;
// mismas 4 reglas que el backend: 8+ caracteres, mayúscula, número y carácter especial
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])\S{8,72}$/;

// el administrador crea una cuenta real con uno de los 3 roles y una contraseña temporal
// (el usuario la cambia desde su perfil). Editar/eliminar a otros no existe (ADR-010).
export function UserFormModal({ visible, roles, onClose, onSubmit }: UserFormModalProps) {
  const { colors } = useTheme();

  const [documentNumber, setDocumentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleId, setRoleId] = useState<UserRole>('OPERATOR');
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // cada vez que se abre el modal arranca vacío
  useEffect(() => {
    if (!visible) return;
    setDocumentNumber('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    setRoleId('OPERATOR');
    setErrors({});
    setServerError(null);
  }, [visible]);

  const roleOptions = useMemo<SelectOption[]>(
    () => roles.map((role) => ({ value: role.id, label: role.name })),
    [roles],
  );

  const handleSubmit = async () => {
    const found: Errors = {};
    if (!DOCUMENT_REGEX.test(documentNumber)) found.documentNumber = texts.errors.document;
    if (firstName.trim().length < 2) found.firstName = texts.errors.name;
    if (lastName.trim().length < 2) found.lastName = texts.errors.lastName;
    if (!isValidEmail(email.trim())) found.email = texts.errors.email;
    if (!PASSWORD_REGEX.test(password)) found.password = texts.errors.password;

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    if (saving) return;

    setSaving(true);
    setServerError(null);
    const failure = await onSubmit({
      documentNumber,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      password,
      roles: [roleId],
    });
    setSaving(false);
    if (failure) setServerError(failure);
  };

  const clearError = (field: keyof Errors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  return (
    <FormModal
      visible={visible}
      title={texts.createTitle}
      subtitle={texts.createSubtitle}
      cancelLabel={MANAGEMENT_TEXTS.common.cancel}
      submitLabel={saving ? texts.creating : texts.create}
      submitDisabled={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={texts.firstName}
        value={firstName}
        onChangeText={(text) => { setFirstName(text); clearError('firstName'); }}
        error={errors.firstName}
        autoCapitalize="words"
        maxLength={60}
      />

      <LabeledInput
        label={texts.lastName}
        value={lastName}
        onChangeText={(text) => { setLastName(text); clearError('lastName'); }}
        error={errors.lastName}
        autoCapitalize="words"
        maxLength={60}
      />

      <LabeledInput
        label={texts.document}
        value={documentNumber}
        // la cédula solo admite dígitos
        onChangeText={(text) => { setDocumentNumber(text.replace(/\D/g, '').substring(0, 20)); clearError('documentNumber'); }}
        error={errors.documentNumber}
        keyboardType="number-pad"
        maxLength={20}
      />

      <LabeledInput
        label={texts.email}
        value={email}
        onChangeText={(text) => { setEmail(text); clearError('email'); }}
        placeholder={texts.emailPlaceholder}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={60}
      />

      <LabeledInput
        label={texts.phone}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={20}
      />

      <ReservationField label={texts.role}>
        <SelectField
          value={roleId}
          options={roleOptions}
          onChange={(value) => setRoleId(value as UserRole)}
        />
      </ReservationField>

      <LabeledInput
        label={texts.password}
        value={password}
        onChangeText={(text) => { setPassword(text); clearError('password'); }}
        error={errors.password}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={72}
      />
      <CheckboxField checked={showPassword} label={texts.showPassword} onChange={setShowPassword} />

      {/* error devuelto por el servidor (correo o cédula ya registrados, sin conexión...) */}
      {serverError ? <Text style={[styles.serverError, { color: colors.error }]}>{serverError}</Text> : null}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  serverError: { marginTop: 8, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
