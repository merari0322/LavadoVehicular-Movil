import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/theme';

export interface BottomNavItem {
  key: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

interface AdminBottomNavProps {
  items: BottomNavItem[];
  activeKey: string;
  onOpenMore: () => void;
}

export function AdminBottomNav({ items, activeKey, onOpenMore }: AdminBottomNavProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={[styles.pill, { backgroundColor: colors.text }]}>
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={item.onPress}
              style={[styles.pillBtn, active && { backgroundColor: colors.primary }]}
            >
              <MaterialIcons name={item.icon} size={22} color={active ? colors.onPrimary : colors.card} />
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.moreBtn, { backgroundColor: colors.primary }]} onPress={onOpenMore}>
        <MaterialIcons name="apps" size={22} color={colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 20, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderRadius: 999, paddingVertical: 10 },
  pillBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
});
