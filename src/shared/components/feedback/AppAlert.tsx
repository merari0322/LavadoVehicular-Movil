import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { spacing } from '../../../app/theme';
import { DialogAction, DialogCard, DialogTone } from './DialogCard';
import { ModalShell, msUntilModalCanOpen } from './ModalShell';

type IconName = keyof typeof MaterialIcons.glyphMap;

// mismos botones que Alert.alert de React Native
export interface AppAlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AppAlertOptions {
  // success: verde · error: rojo · warning: amarillo · info: color del tema
  type?: 'success' | 'error' | 'warning' | 'info';
  icon?: IconName;
}

interface AlertRequest {
  id: number;
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
  options?: AppAlertOptions;
}

const TYPE_STYLE: Record<NonNullable<AppAlertOptions['type']>, { tone: DialogTone; icon: IconName }> = {
  success: { tone: 'success', icon: 'check-circle' },
  error: { tone: 'danger', icon: 'error-outline' },
  warning: { tone: 'warning', icon: 'warning-amber' },
  info: { tone: 'primary', icon: 'info-outline' },
};

// tiempo para que termine de cerrarse antes de ejecutar la acción o mostrar la siguiente
// alerta (en iOS no se puede abrir un modal mientras otro se está cerrando)
const AFTER_CLOSE_MS = 300;

let nextId = 1;
let listener: ((request: AlertRequest) => void) | null = null;

// reemplazo de Alert.alert con el diálogo de la app (respeta el tema y el idioma).
// Se llama igual que Alert.alert, más un cuarto parámetro opcional con el tipo de aviso.
export const AppAlert = {
  alert(title: string, message?: string, buttons?: AppAlertButton[], options?: AppAlertOptions) {
    listener?.({ id: nextId++, title, message, buttons, options });
  },
};

// sin tipo: con un botón destructivo es una confirmación en rojo; con varios botones, una
// pregunta; con uno solo, un aviso
function resolveStyle(request: AlertRequest): { tone: DialogTone; icon: IconName } {
  const { options, buttons = [] } = request;
  if (options?.type) return { ...TYPE_STYLE[options.type], ...(options.icon ? { icon: options.icon } : {}) };
  if (buttons.some((button) => button.style === 'destructive')) {
    return { tone: 'danger', icon: options?.icon ?? 'warning-amber' };
  }
  if (buttons.length > 1) return { tone: 'primary', icon: options?.icon ?? 'help-outline' };
  return { tone: 'primary', icon: options?.icon ?? 'info-outline' };
}

// se monta una vez en AppProviders; muestra las alertas en orden, una a la vez
export function AppAlertHost() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState<AlertRequest[]>([]);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // si un modal se acaba de cerrar (ej. el formulario que se guardó) espera a que termine
    listener = (request) => {
      const enqueue = () => setQueue((current) => [...current, request]);
      const wait = msUntilModalCanOpen();
      if (wait > 0) setTimeout(enqueue, wait);
      else enqueue();
    };
    return () => {
      listener = null;
    };
  }, []);

  const current = queue[0] ?? null;
  const buttons: AppAlertButton[] =
    current?.buttons && current.buttons.length > 0 ? current.buttons : [{ text: t('COMMON.ACCEPT') }];

  const press = (button?: AppAlertButton) => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setQueue((items) => items.slice(1));
      setClosing(false);
      button?.onPress?.();
    }, AFTER_CLOSE_MS);
  };

  // atrás de Android o tocar fuera: como el botón de cancelar, o el único botón si es un aviso
  const cancelButton = buttons.find((button) => button.style === 'cancel') ?? (buttons.length === 1 ? buttons[0] : undefined);
  const dismiss = () => {
    if (cancelButton) press(cancelButton);
  };

  const { tone, icon } = current ? resolveStyle(current) : { tone: 'primary' as DialogTone, icon: 'info-outline' as IconName };
  const actions: DialogAction[] = buttons.map((button) => ({
    label: button.text,
    kind: button.style === 'cancel' ? 'cancel' : 'confirm',
    onPress: () => press(button),
  }));

  return (
    <ModalShell
      visible={current !== null && !closing}
      onRequestClose={dismiss}
      onBackdropPress={cancelButton ? dismiss : undefined}
      padding={spacing.xl}
    >
      {current ? (
        <DialogCard key={current.id} tone={tone} icon={icon} title={current.title} message={current.message} actions={actions} />
      ) : null}
    </ModalShell>
  );
}
