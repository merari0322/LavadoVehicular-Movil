import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../../../app/theme';
import { getPasswordStrength, isPasswordStrong } from '../../validators/authValidators';
import { PasswordField } from '../forms/PasswordField';
import { PasswordRequirements } from '../forms/PasswordRequirements';
import { FormModal } from './FormModal';

interface ChangePasswordModalProps {
  visible: boolean;
  // guarda en el backend; devuelve el mensaje de error o null si salió bien
  onSubmit: (currentPassword: string, newPassword: string) => Promise<string | null>;
  onClose: () => void;
}

// mismo modal que la web: contraseña actual + nueva (con sus 4 requisitos) + confirmación
export function ChangePasswordModal({ visible, onSubmit, onClose }: ChangePasswordModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
    }
  }, [visible]);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const samePassword = currentPassword.length > 0 && currentPassword === newPassword;
  const notMatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  const canSave = currentPassword.length > 0 && isPasswordStrong(strength) && !samePassword
    && confirmPassword === newPassword && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    const failure = await onSubmit(currentPassword, newPassword);
    setSaving(false);
    if (failure) setError(failure);
  };

  return (
    <FormModal
      visible={visible}
      title={t('CHANGE_PASSWORD_MODAL.TITLE')}
      subtitle={t('CHANGE_PASSWORD_MODAL.SUBTITLE')}
      cancelLabel={t('COMMON.CANCEL')}
      submitLabel={saving ? t('PASSWORD_CONFIRM_MODAL.PROCESSING') : t('CHANGE_PASSWORD_MODAL.SAVE')}
      submitDisabled={!canSave}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <PasswordField
        label={t('CHANGE_PASSWORD_MODAL.CURRENT')}
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <PasswordField
        label={t('CHANGE_PASSWORD_MODAL.NEW')}
        value={newPassword}
        onChangeText={setNewPassword}
        error={samePassword ? t('CHANGE_PASSWORD_MODAL.SAME_PASSWORD') : undefined}
      />
      <PasswordRequirements strength={strength} translationPrefix="REGISTER.REQUIREMENTS" />

      <PasswordField
        label={t('CHANGE_PASSWORD_MODAL.CONFIRM')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={notMatch ? t('CHANGE_PASSWORD_MODAL.NOT_MATCH') : undefined}
      />

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  error: { marginTop: 10, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
