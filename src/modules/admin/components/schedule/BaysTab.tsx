import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { Bay, BayStatus } from '../../models/schedule';
import { useOperators } from '../../viewmodels/useOperators';
import { BayCard } from './BayCard';

interface BaysTabProps {
  bays: Bay[];
  onAdd: () => void;
  onEdit: (bay: Bay) => void;
  onChangeStatus: (id: string, status: BayStatus) => void;
  onDelete: (bay: Bay) => void;
}

const texts = SCHEDULE_TEXTS.bays;

// Pestaña de bahías: encabezado con botón de agregar y lista de tarjetas
export function BaysTab({ bays, onAdd, onEdit, onChangeStatus, onDelete }: BaysTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // operarios reales (operations-service); aquí se cargan si aún no se habían pedido
  const { operators } = useOperators();

  // Nombre del operario asignado a una bahía
  const getOperatorName = (operatorId: string) =>
    operators.find((operator) => operator.id === operatorId)?.name ?? '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{texts.title}</Text>
        <Text style={styles.subtitle}>{texts.subtitle}</Text>
        <Pressable style={styles.addButton} onPress={onAdd}>
          <MaterialIcons name="add" size={20} color={colors.onPrimary} />
          <Text style={styles.addText}>{texts.add}</Text>
        </Pressable>
      </View>

      {bays.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{texts.empty}</Text>
          <Text style={styles.subtitle}>{texts.emptyHint}</Text>
        </View>
      ) : (
        bays.map((bay) => (
          <BayCard
            key={bay.id}
            bay={bay}
            operatorName={getOperatorName(bay.operatorId)}
            onChangeStatus={(status) => onChangeStatus(bay.id, status)}
            onEdit={() => onEdit(bay)}
            onDelete={() => onDelete(bay)}
          />
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 14 },
    header: { gap: 4 },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 13, color: colors.textSecondary },
    addButton: {
      height: 46,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    addText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    empty: { alignItems: 'center', gap: 4, paddingVertical: 28 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  });
