import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

export type DialogTone = 'primary' | 'success' | 'warning' | 'danger';

// cancel: botón neutro · confirm: relleno del color del diálogo
export interface DialogAction {
  label: string;
  onPress: () => void;
  kind?: 'cancel' | 'confirm';
  icon?: IconName;
}

interface DialogCardProps {
  tone: DialogTone;
  icon: IconName;
  title: string;
  message?: string;
  actions: DialogAction[];
  // contenido extra entre el mensaje y los botones (ej. el usuario al cerrar sesión)
  children?: React.ReactNode;
}

export function toneColor(colors: ThemeColors, tone: DialogTone): string {
  if (tone === 'success') return colors.success;
  if (tone === 'warning') return colors.warning;
  if (tone === 'danger') return colors.error;
  return colors.primary;
}

// tarjeta de los diálogos (confirmar, éxito, error, aviso): ícono en un doble círculo del
// color del diálogo, textos centrados y botones. Dos botones van en fila; tres o más, apilados.
export function DialogCard({ tone, icon, title, message, actions, children }: DialogCardProps) {
  const { colors } = useTheme();
  const color = toneColor(colors, tone);
  const stacked = actions.length > 2;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: withAlpha(color, 0.18) }]}>
      <View style={[styles.accent, { backgroundColor: color }]} />

      <View style={[styles.iconRing, { backgroundColor: withAlpha(color, 0.1) }]}>
        <View style={[styles.iconCircle, { backgroundColor: withAlpha(color, 0.18) }]}>
          <MaterialIcons name={icon} size={30} color={color} />
        </View>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text> : null}

      {children}

      <View style={[styles.actions, stacked && styles.actionsStacked]}>
        {actions.map((action) => {
          const isCancel = action.kind === 'cancel';
          const textColor = isCancel ? colors.text : tone === 'warning' ? '#1a1a2e' : colors.onPrimary;
          return (
            <Pressable
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.button,
                !stacked && styles.buttonFlex,
                isCancel
                  ? { backgroundColor: withAlpha(colors.textMuted, 0.16) }
                  : { backgroundColor: color, shadowColor: color },
                !isCancel && styles.buttonRaised,
                pressed && styles.pressed,
              ]}
            >
              {action.icon ? <MaterialIcons name={action.icon} size={18} color={textColor} /> : null}
              <Text style={[styles.buttonText, { color: textColor }]} numberOfLines={1}>
                {action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 22,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // franja de color arriba de la tarjeta
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  iconRing: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  iconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: fontSize.cardTitle + 3, fontWeight: fontWeight.extrabold, textAlign: 'center' },
  message: { fontSize: fontSize.body + 1, lineHeight: 21, textAlign: 'center', paddingHorizontal: spacing.xs },
  actions: { alignSelf: 'stretch', flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  actionsStacked: { flexDirection: 'column-reverse', gap: spacing.sm },
  button: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
  },
  buttonFlex: { flex: 1 },
  buttonRaised: { shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  buttonText: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
