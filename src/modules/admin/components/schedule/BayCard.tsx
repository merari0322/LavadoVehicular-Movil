import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { withAlpha } from '../../../../shared/utils/color';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { BAY_STATUSES, Bay, BayStatus } from '../../models/schedule';
import { IconButton, Pill, PillTone } from '../common/Pills';

type IconName = keyof typeof MaterialIcons.glyphMap;

interface BayCardProps {
  bay: Bay;
  operatorName: string; // Vacío = sin asignar
  onChangeStatus: (status: BayStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const texts = SCHEDULE_TEXTS.bays;

// Color e icono de cada estado
const STATUS_TONE: Record<BayStatus, PillTone> = {
  active: 'success',
  maintenance: 'warning',
  inactive: 'neutral',
};

const STATUS_ICON: Record<BayStatus, IconName> = {
  active: 'check-circle',
  maintenance: 'build',
  inactive: 'pause-circle-filled',
};

// Opciones del selector de estado
const STATUS_OPTIONS: SelectOption[] = BAY_STATUSES.map((status) => ({
  value: status,
  label: texts.status[status],
}));

// Tarjeta de una bahía: estado, operario actual y acciones
export function BayCard({ bay, operatorName, onChangeStatus, onEdit, onDelete }: BayCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="directions-car" size={24} color={colors.primary} />
        </View>
        <Pill label={texts.status[bay.status]} tone={STATUS_TONE[bay.status]} icon={STATUS_ICON[bay.status]} />
      </View>

      <Text style={styles.name}>{bay.name}</Text>

      <View style={styles.operatorRow}>
        <MaterialIcons name="badge" size={18} color={colors.textSecondary} />
        <Text style={styles.operatorText}>
          {texts.currentOperator(operatorName || texts.unassigned)}
        </Text>
      </View>

      {/* El estado se cambia directamente desde la tarjeta */}
      <Text style={styles.stateLabel}>{texts.state}</Text>
      <SelectField
        value={bay.status}
        options={STATUS_OPTIONS}
        onChange={(value) => onChangeStatus(value as BayStatus)}
      />

      <View style={styles.actions}>
        <IconButton icon="edit" onPress={onEdit} />
        <IconButton icon="delete" danger onPress={onDelete} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: 6,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    iconBox: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    name: { marginTop: 4, fontSize: 18, fontWeight: '800', color: colors.text },
    operatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    operatorText: { flexShrink: 1, fontSize: 14, color: colors.textSecondary },
    stateLabel: { marginTop: 6, fontSize: 13, color: colors.textSecondary },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
