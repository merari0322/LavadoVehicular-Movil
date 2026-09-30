import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../../../app/theme';
import { PasswordField } from '../forms/PasswordField';
import { FormModal } from './FormModal';

interface PasswordPromptModalProps {
  visible: boolean;
  title: string;
  message: string;
  submitLabel: string;
  // ejecuta la acción con la contraseña; devuelve el mensaje de error o null si salió bien
  onConfirm: (password: string) => Promise<string | null>;
  onClose: () => void;
}

// pide la contraseña actual para confirmar una acción sensible
// (cambiar el correo de login, eliminar la cuenta). Muestra el error del servidor sin cerrarse.
export function PasswordPromptModal({ visible, title, message, submitLabel, onConfirm, onClose }: PasswordPromptModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // cada vez que se abre arranca limpio
  useEffect(() => {
    if (visible) {
      setPassword('');
      setError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!password || processing) return;
    setProcessing(true);
    setError(null);
    const failure = await onConfirm(password);
    setProcessing(false);
    if (failure) setError(failure);
  };

  return (
    <FormModal
      visible={visible}
      title={title}
      subtitle={message}
      cancelLabel={t('COMMON.CANCEL')}
      submitLabel={processing ? t('PASSWORD_CONFIRM_MODAL.PROCESSING') : submitLabel}
      submitDisabled={!password || processing}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <PasswordField
        label={t('PASSWORD_CONFIRM_MODAL.LABEL')}
        value={password}
        onChangeText={setPassword}
      />
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  error: { marginTop: 10, fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
