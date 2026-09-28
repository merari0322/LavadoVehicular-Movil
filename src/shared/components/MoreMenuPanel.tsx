import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/theme';
import { withAlpha } from '../utils/color';
import { GlassSurface } from './GlassSurface';

type IconName = keyof typeof MaterialIcons.glyphMap;

export interface MoreMenuItem {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
  tone?: 'default' | 'danger';
}

export interface MoreMenuUser {
  initials: string;
  name: string;
  email: string;
}

interface MoreMenuPanelProps {
  visible: boolean;
  onClose: () => void;
  items: MoreMenuItem[];
  user: MoreMenuUser;
}

export function MoreMenuPanel({ visible, onClose, items, user }: MoreMenuPanelProps) {
  const { colors, themeName } = useTheme();
  const isDark = themeName === 'greenDark' || themeName === 'pinkDark';
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    } else {
      Animated.timing(progress, { toValue: 0, duration: 160, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, progress]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView intensity={25} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(colors.text, 0.18) }]} />
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.panelWrapper, { opacity: progress, transform: [{ translateY }] }]}>
        <GlassSurface radius={28} intensity={70} contentStyle={styles.panelContent}>
          <View style={[styles.userRow, { borderBottomColor: withAlpha(colors.primary, 0.2) }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{user.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {items.map((item) => {
              const danger = item.tone === 'danger';
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.item}
                  onPress={() => {
                    onClose();
                    item.onPress();
                  }}
                >
                  <View
                    style={[
                      styles.itemIcon,
                      {
                        backgroundColor: danger ? colors.errorSoft : withAlpha(colors.primary, 0.14),
                        borderColor: danger ? withAlpha(colors.error, 0.3) : withAlpha(colors.primary, 0.25),
                      },
                    ]}
                  >
                    <MaterialIcons name={item.icon} size={24} color={danger ? colors.error : colors.primary} />
                  </View>
                  <Text style={[styles.itemLabel, { color: colors.text }]} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  panelWrapper: { position: 'absolute', left: 16, right: 16, bottom: 92 },
  panelContent: { padding: 18 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 16, borderBottomWidth: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700' },
  userName: { fontSize: 14, fontWeight: '700' },
  userEmail: { fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  item: { width: '33.333%', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  itemIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 6 },
  itemLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
