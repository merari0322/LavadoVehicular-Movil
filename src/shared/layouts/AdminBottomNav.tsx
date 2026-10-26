import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontWeight, useTheme } from '../../app/theme';
import { ThemeColors } from '../../app/theme/colors';
import { GlassSurface } from '../components/ui/GlassSurface';
import { withAlpha } from '../utils/color';

type IconName = keyof typeof MaterialIcons.glyphMap;

export interface BottomNavItem {
  key: string;
  icon: IconName;
  // nombre corto bajo el ícono (ya traducido)
  label: string;
  onPress: () => void;
}

interface AdminBottomNavProps {
  items: BottomNavItem[];
  actionItem: BottomNavItem;
  activeKey: string;
  isMoreOpen: boolean;
  // la pantalla abierta está en el menú "más": se marca ese botón
  isMoreActive: boolean;
  moreLabel: string;
  onToggleMore: () => void;
}

interface NavButtonProps {
  icon: IconName;
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

// botón de la barra: ícono y nombre; el activo va sobre un fondo suave del color del tema
function NavButton({ icon, label, active, onPress, colors }: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.item,
        active && { backgroundColor: withAlpha(colors.primary, 0.14) },
        pressed && styles.pressed,
      ]}
    >
      <MaterialIcons name={icon} size={24} color={active ? colors.primary : colors.textSecondary} />
      <Text
        style={[styles.label, { color: active ? colors.primary : colors.textSecondary }, active && styles.labelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AdminBottomNav({
  items,
  actionItem,
  activeKey,
  isMoreOpen,
  isMoreActive,
  moreLabel,
  onToggleMore,
}: AdminBottomNavProps) {
  const { colors } = useTheme();
  const actionActive = actionItem.key === activeKey && !isMoreOpen;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <GlassSurface radius={26} containerStyle={styles.barContainer} contentStyle={styles.barContent}>
        {items.map((item) => (
          <NavButton
            key={item.key}
            icon={item.icon}
            label={item.label}
            active={item.key === activeKey && !isMoreOpen}
            onPress={item.onPress}
            colors={colors}
          />
        ))}
        <NavButton
          icon={isMoreOpen ? 'close' : 'apps'}
          label={moreLabel}
          active={isMoreOpen || isMoreActive}
          onPress={onToggleMore}
          colors={colors}
        />
      </GlassSurface>

      {/* notificaciones: botón aparte, relleno con el color del tema cuando está abierto */}
      <GlassSurface radius={26} containerStyle={styles.actionContainer} contentStyle={styles.actionContent}>
        <Pressable
          onPress={actionItem.onPress}
          accessibilityRole="tab"
          accessibilityLabel={actionItem.label}
          accessibilityState={{ selected: actionActive }}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: actionActive ? colors.primary : withAlpha(colors.primary, 0.14) },
            pressed && styles.pressed,
          ]}
        >
          <MaterialIcons name={actionItem.icon} size={24} color={actionActive ? colors.onPrimary : colors.primary} />
          <Text
            style={[styles.label, styles.labelActive, { color: actionActive ? colors.onPrimary : colors.primary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {actionItem.label}
          </Text>
        </Pressable>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 20,
  },
  barContainer: { flex: 1 },
  barContent: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  item: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
    borderRadius: 20,
  },
  label: { fontSize: 11, fontWeight: fontWeight.semibold, textAlign: 'center' },
  labelActive: { fontWeight: fontWeight.bold },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  actionContainer: { width: 72 },
  actionContent: { padding: 6 },
  action: { height: 54, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 20 },
});
