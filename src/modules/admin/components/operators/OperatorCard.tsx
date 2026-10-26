import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { Operator } from '../../models/operator';
import { IconButton, Pill } from '../common/Pills';
import { OperatorAvatar } from './OperatorAvatar';
import { OperatorStatusPill } from './OperatorStatusPill';

interface OperatorCardProps {
  operator: Operator;
  bayName: string; // Vacío = sin asignar
  onEdit: () => void;
  onOpen: () => void; // Ver disponibilidad
  onRegisterReturn: () => void;
}

const texts = OPERATOR_TEXTS.card;

// Tarjeta de un operario en la lista
export function OperatorCard({ operator, bayName, onEdit, onOpen, onRegisterReturn }: OperatorCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isAbsent = operator.status === 'absent';
  const ratingText =
    operator.reviews > 0 ? `★ ${operator.rating.toFixed(1)} (${operator.reviews})` : texts.noRating;

  return (
    <View style={styles.card}>
      {/* Avatar, estado y botón de editar */}
      <View style={styles.topRow}>
        <OperatorAvatar name={operator.name} />
        <View style={styles.topRight}>
          <OperatorStatusPill status={operator.status} />
          <IconButton icon="edit" onPress={onEdit} />
        </View>
      </View>

      <Text style={styles.name}>{operator.name}</Text>
      <Text style={styles.specialty}>{operator.specialty}</Text>

      {/* Calificación y bahía */}
      <View style={styles.metaRow}>
        <View style={styles.flex}>
          <Text style={styles.metaLabel}>{texts.rating}</Text>
          <Text style={styles.metaValue}>{ratingText}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.metaLabel}>{texts.bay}</Text>
          <Text style={styles.metaValue}>{bayName || texts.noBay}</Text>
        </View>
      </View>

      {/* Servicios de la semana */}
      <View style={styles.servicesRow}>
        <MaterialIcons name="check-circle" size={18} color={colors.primaryHover} />
        <Text style={styles.servicesText}>
          {isAbsent
            ? texts.servicesAbsent(operator.weeklyServices, OPERATOR_TEXTS.status.absent)
            : texts.services(operator.weeklyServices)}
        </Text>
      </View>

      {/* Etiquetas */}
      {operator.tags.length > 0 ? (
        <View style={styles.tags}>
          {operator.tags.map((tag) => (
            <Pill key={tag} label={tag} />
          ))}
        </View>
      ) : null}

      {/* Botón principal */}
      <Pressable
        style={[styles.mainButton, isAbsent && styles.returnButton]}
        onPress={isAbsent ? onRegisterReturn : onOpen}
      >
        <Text style={styles.mainButtonText}>{isAbsent ? texts.registerReturn : texts.viewAvailability}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      gap: 6,
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { marginTop: 4, fontSize: 19, fontWeight: '800', color: colors.text },
    specialty: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
    metaLabel: { fontSize: 13, color: colors.textSecondary },
    metaValue: { marginTop: 2, fontSize: 14, fontWeight: '700', color: colors.text },
    servicesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
    servicesText: { flexShrink: 1, fontSize: 14, color: colors.textSecondary },
    tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
    mainButton: {
      height: 46,
      marginTop: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    returnButton: { backgroundColor: colors.warning },
    mainButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  });
