import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { Operator } from '../../models/operator';
import { isoToDisplay } from '../../utils/reservationUtils';
import { OperatorAvatar } from './OperatorAvatar';
import { OperatorStatusPill } from './OperatorStatusPill';

interface OperatorProfileCardProps {
  operator: Operator;
  bayName: string;
  onRegisterAbsence: () => void;
  onRegisterReturn: () => void;
  onEditAvailability: () => void;
  // opcional: sin él no se muestra "asignar bahía" (la bahía va en cada reserva)
  onAssign?: () => void;
}

const texts = OPERATOR_TEXTS.detail;

// Fila de contacto o dato con icono
function InfoLine({ icon, text }: { icon: keyof typeof MaterialIcons.glyphMap; text: string }) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <MaterialIcons name={icon} size={16} color={colors.textSecondary} />
      <Text style={{ flexShrink: 1, fontSize: 14, color: colors.textSecondary }}>{text}</Text>
    </View>
  );
}

// Tarjeta principal del detalle: datos del operario y acciones
export function OperatorProfileCard({
  operator,
  bayName,
  onRegisterAbsence,
  onRegisterReturn,
  onEditAvailability,
  onAssign,
}: OperatorProfileCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isAbsent = operator.status === 'absent';
  const ratingText = texts.ratingLine(operator.rating.toFixed(1), operator.reviews);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <OperatorAvatar name={operator.name} size={64} />
        <View style={styles.flex}>
          <Text style={styles.name}>{operator.name}</Text>
          <View style={styles.pills}>
            <OperatorStatusPill status={operator.status} />
            <View style={styles.idChip}>
              <Text style={styles.idText}>{texts.idLabel(operator.code)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Datos del operario */}
      <View style={styles.info}>
        <View style={styles.specialtyRow}>
          <MaterialIcons name="verified" size={18} color={colors.primaryHover} />
          <Text style={styles.specialty}>{operator.specialty}</Text>
        </View>
        {operator.reviews > 0 ? <InfoLine icon="star" text={ratingText} /> : null}
        <InfoLine icon="directions-car" text={texts.bayLine(bayName || OPERATOR_TEXTS.card.noBay)} />
        <InfoLine icon="phone" text={operator.phone} />
        <InfoLine icon="email" text={operator.email} />
        {isAbsent && operator.absence ? (
          <InfoLine icon="event-busy" text={texts.absentUntil(isoToDisplay(operator.absence.end))} />
        ) : null}
      </View>

      {/* Acciones */}
      <View style={styles.actions}>
        {isAbsent ? (
          <Pressable style={[styles.button, styles.returnButton]} onPress={onRegisterReturn}>
            <MaterialIcons name="how-to-reg" size={20} color="#FFFFFF" />
            <Text style={styles.filledText}>{texts.registerReturn}</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.button, styles.dangerButton]} onPress={onRegisterAbsence}>
            <MaterialIcons name="event-busy" size={20} color={colors.error} />
            <Text style={[styles.outlineText, { color: colors.error }]}>{texts.registerAbsence}</Text>
          </Pressable>
        )}

        <Pressable style={[styles.button, styles.primaryButton]} onPress={onEditAvailability}>
          <MaterialIcons name="edit-calendar" size={20} color={colors.onPrimary} />
          <Text style={styles.filledText}>{texts.editAvailability}</Text>
        </Pressable>

        {onAssign ? (
          <Pressable style={[styles.button, styles.outlineButton]} onPress={onAssign}>
            <MaterialIcons name="meeting-room" size={20} color={colors.text} />
            <Text style={[styles.outlineText, { color: colors.text }]}>{texts.assignBay}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      gap: 14,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    name: { fontSize: 22, fontWeight: '800', color: colors.text },
    pills: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 },
    idChip: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: withAlpha(colors.textMuted, 0.18),
    },
    idText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
    info: { gap: 6 },
    specialtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    specialty: { flexShrink: 1, fontSize: 15, fontWeight: '600', color: colors.text },
    actions: { gap: 10 },
    button: {
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
    },
    primaryButton: { backgroundColor: colors.primary },
    returnButton: { backgroundColor: colors.warning },
    dangerButton: { borderWidth: 1, borderColor: colors.error, backgroundColor: colors.card },
    outlineButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    filledText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    outlineText: { fontSize: 14, fontWeight: '700' },
  });
