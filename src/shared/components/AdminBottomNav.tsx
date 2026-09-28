import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/theme';
import { GlassSurface } from './GlassSurface';

type IconName = keyof typeof MaterialIcons.glyphMap;

export interface BottomNavItem {
  key: string;
  icon: IconName;
  onPress: () => void;
}

interface AdminBottomNavProps {
  items: BottomNavItem[];
  actionItem: BottomNavItem;
  activeKey: string;
  isMoreOpen: boolean;
  onToggleMore: () => void;
}

export function AdminBottomNav({ items, actionItem, activeKey, isMoreOpen, onToggleMore }: AdminBottomNavProps) {
  const { colors } = useTheme();
  const actionActive = actionItem.key === activeKey && !isMoreOpen;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <GlassSurface radius={999} containerStyle={styles.pillContainer} contentStyle={styles.pillContent}>
        {items.map((item) => {
          const active = item.key === activeKey && !isMoreOpen;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={item.onPress}
              style={[styles.pillBtn, active && { backgroundColor: colors.primary }]}
            >
              <MaterialIcons name={item.icon} size={22} color={active ? colors.onPrimary : colors.textSecondary} />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={onToggleMore}
          style={[styles.pillBtn, isMoreOpen && { backgroundColor: colors.primary }]}
        >
          <MaterialIcons name="apps" size={22} color={isMoreOpen ? colors.onPrimary : colors.textSecondary} />
        </TouchableOpacity>
      </GlassSurface>

      <GlassSurface radius={28} containerStyle={styles.actionContainer} contentStyle={styles.actionContent}>
        <TouchableOpacity
          onPress={actionItem.onPress}
          style={[styles.actionBtn, actionActive && { backgroundColor: colors.primary }]}
        >
          <MaterialIcons
            name={actionItem.icon}
            size={24}
            color={actionActive ? colors.onPrimary : colors.primary}
          />
        </TouchableOpacity>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 20,
  },
  pillContainer: { flex: 1 },
  pillContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  pillBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actionContainer: { width: 56, height: 56 },
  actionContent: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
