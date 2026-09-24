import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../app/theme';

export interface MoreMenuItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  tone?: 'default' | 'danger';
}

interface MoreMenuModalProps {
  visible: boolean;
  onClose: () => void;
  items: MoreMenuItem[];
}

export function MoreMenuModal({ visible, onClose, items }: MoreMenuModalProps) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={[styles.backdrop, { backgroundColor: colors.overlayDark }]} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.handle} />
          <View style={styles.grid}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.item}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <View style={[styles.itemIcon, { backgroundColor: item.tone === 'danger' ? colors.errorSoft : colors.primarySoft }]}>
                  <MaterialIcons name={item.icon} size={22} color={item.tone === 'danger' ? colors.error : colors.primary} />
                </View>
                <Text style={[styles.itemLabel, { color: colors.text }]} numberOfLines={2}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingHorizontal: 20, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#00000022', alignSelf: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  item: { width: '28%', alignItems: 'center', gap: 6 },
  itemIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
