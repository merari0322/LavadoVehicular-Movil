import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { FindingSeverity, InspectionPhase, InspectionPhaseStatus } from '../../../../core/services/operations/InspectionService';
import { PillTone } from '../../../../shared/components/ui/Pill';

type IconName = keyof typeof MaterialIcons.glyphMap;

// ícono de cada fase (los mismos de la web, PHASE_ICONS)
export const PHASE_ICONS: Record<InspectionPhase, IconName> = {
  RECEPTION: 'login',
  EXTERIOR: 'local-car-wash',
  INTERIOR: 'airline-seat-recline-normal',
  ENGINE: 'build',
  DELIVERY: 'task-alt',
};

// color de la etiqueta de estado de cada fase
export const PHASE_STATUS_TONES: Record<InspectionPhaseStatus, PillTone> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'warning',
  DONE: 'success',
};

// fondo y texto de cada tipo de hallazgo (observación, daño leve, daño importante)
export const SEVERITY_TONES: Record<FindingSeverity, (colors: ThemeColors) => { background: string; text: string }> = {
  INFO: (colors) => ({ background: withAlpha(colors.primary, 0.14), text: colors.primary }),
  MINOR: (colors) => ({ background: colors.warningSoft, text: colors.warning }),
  MAJOR: (colors) => ({ background: colors.errorSoft, text: colors.error }),
};

export const SEVERITY_PILL_TONES: Record<FindingSeverity, PillTone> = {
  INFO: 'primary',
  MINOR: 'warning',
  MAJOR: 'error',
};
