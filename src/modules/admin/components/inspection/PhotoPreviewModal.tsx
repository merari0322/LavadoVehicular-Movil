import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageSourcePropType, Modal, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PhotoPreviewModalProps {
  source: ImageSourcePropType | null; // null = cerrado
  onClose: () => void;
}

// Foto ampliada a pantalla completa (el "lightbox" de la web); se cierra tocando fuera o la X
export function PhotoPreviewModal({ source, onClose }: PhotoPreviewModalProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal visible={source !== null} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {source ? <Image source={source} style={styles.image} resizeMode="contain" /> : null}
        <Pressable style={[styles.close, { top: insets.top + 12 }]} onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('COMMON.CLOSE')}>
          <MaterialIcons name="close" size={24} color="#ffffff" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.92)' },
  image: { width: '100%', height: '80%' },
  close: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
});
