import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../../app/theme/colors';
import { NotificationCategory } from '../../models/notifications';
import { PillTone } from '../../../../shared/components/ui/Pill';

type IconName = keyof typeof MaterialIcons.glyphMap;

// Icono de cada categoría
export const CATEGORY_ICON: Record<NotificationCategory, IconName> = {
  reminder: 'warning',
  promotion: 'local-offer',
  confirmation: 'check-circle',
  other: 'desktop-windows',
};

// Color de la etiqueta de cada categoría
export const CATEGORY_TONE: Record<NotificationCategory, PillTone> = {
  reminder: 'primary',
  promotion: 'warning',
  confirmation: 'primary',
  other: 'neutral',
};

// Color principal de un tono (se usa para el icono y su fondo)
export const getToneColor = (colors: ThemeColors, tone: PillTone): string => {
  const palette: Record<PillTone, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    neutral: colors.textSecondary,
  };
  return palette[tone];
};
