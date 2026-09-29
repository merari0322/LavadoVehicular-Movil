import React, { useEffect, useMemo, useState } from 'react';
import { CheckboxField } from '../../../shared/components/CheckboxField';
import { FormModal } from '../../../shared/components/FormModal';
import { LabeledInput } from '../../../shared/components/LabeledInput';
import { SelectField, SelectOption } from '../../../shared/components/SelectField';
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import { ManagedUser, Role, UserFormValues } from '../models/management';
import { isValidEmail } from '../utils/managementUtils';
import { ReservationField } from './ReservationField';

interface UserFormModalProps {
  visible: boolean;
  user: ManagedUser | null; // null = crear, con valor = editar
  roles: Role[];
  isEmailTaken: (email: string, ignoreId?: string) => boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
}

type Errors = { name?: string; email?: string; roleId?: string };

const texts = MANAGEMENT_TEXTS.users.form;

// Modal para crear o editar un usuario
export function UserFormModal({ visible, user, roles, isEmailTaken, onClose, onSubmit }: UserFormModalProps) {
  const isEditing = user !== null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [sendInvitation, setSendInvitation] = useState(true);
  const [errors, setErrors] = useState<Errors>({});

  // Cada vez que se abre el modal se cargan los datos del usuario (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setRoleId(user?.roleId ?? roles[0]?.id ?? '');
    setSendInvitation(true);
    setErrors({});
  }, [visible, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const roleOptions = useMemo<SelectOption[]>(
    () => roles.map((role) => ({ value: role.id, label: role.name })),
    [roles],
  );

  const handleSubmit = () => {
    const found: Errors = {};

    if (name.trim().length < 3) found.name = texts.errors.name;
    if (!isValidEmail(email.trim())) found.email = texts.errors.email;
    else if (isEmailTaken(email, user?.id)) found.email = texts.errors.emailTaken;
    if (!roleId) found.roleId = texts.errors.role;

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSubmit({ name: name.trim(), email: email.trim(), roleId, sendInvitation });
  };

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      subtitle={isEditing ? texts.editSubtitle : texts.createSubtitle}
      cancelLabel={MANAGEMENT_TEXTS.common.cancel}
      submitLabel={isEditing ? texts.save : texts.create}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={texts.name}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        placeholder={texts.namePlaceholder}
        error={errors.name}
        autoCapitalize="words"
      />

      <LabeledInput
        label={texts.email}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        placeholder={texts.emailPlaceholder}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <ReservationField label={texts.role} error={errors.roleId}>
        <SelectField
          value={roleId}
          options={roleOptions}
          onChange={(value) => {
            setRoleId(value);
            setErrors((prev) => ({ ...prev, roleId: undefined }));
          }}
          hasError={Boolean(errors.roleId)}
        />
      </ReservationField>

      {/* La invitación solo aplica al crear */}
      {!isEditing ? (
        <CheckboxField checked={sendInvitation} label={texts.invite} onChange={setSendInvitation} />
      ) : null}
    </FormModal>
  );
}
