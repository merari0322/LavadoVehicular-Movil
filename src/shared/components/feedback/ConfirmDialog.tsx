import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../../../app/theme';
import { DialogCard, DialogTone } from './DialogCard';
import { ModalShell } from './ModalShell';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean; // Botón de confirmar en rojo
  icon?: IconName;
  confirmIcon?: IconName;
  onConfirm: () => void;
  onCancel: () => void;
  // contenido extra bajo el mensaje
  children?: React.ReactNode;
}

// Diálogo de confirmación (por ejemplo, antes de eliminar algo)
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger = true,
  icon,
  confirmIcon,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const tone: DialogTone = danger ? 'danger' : 'primary';

  return (
    <ModalShell visible={visible} onRequestClose={onCancel} onBackdropPress={onCancel} padding={spacing.xl}>
      <DialogCard
        tone={tone}
        icon={icon ?? (danger ? 'warning-amber' : 'help-outline')}
        title={title}
        message={message}
        actions={[
          { label: cancelLabel, onPress: onCancel, kind: 'cancel' },
          { label: confirmLabel, onPress: onConfirm, kind: 'confirm', icon: confirmIcon },
        ]}
      >
        {children}
      </DialogCard>
    </ModalShell>
  );
}
