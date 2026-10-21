import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';
import { ModalCloseButton } from './ModalCloseButton';

// niveles de la lupa; el doble toque alterna entre el primero y el tercero
const ZOOM_LEVELS = [1, 1.5, 2, 3];
const DOUBLE_TAP_MS = 300;

interface ImageZoomModalProps {
  visible: boolean;
  uri: string | null;
  title?: string;
  onClose: () => void;
}

// Imagen en pantalla completa con lupa (+/−) y doble toque para ampliar; con zoom se mueve
// arrastrando. Fondo blanco para que un QR se escanee bien desde otro celular. Solo usa
// componentes de React Native (sin gesture-handler ni reanimated) para que llegue por
// actualización por internet a los APK ya instalados.
export function ImageZoomModal({ visible, uri, title, onClose }: ImageZoomModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const [level, setLevel] = useState(0);
  const lastTap = useRef(0);

  // cada vez que se abre empieza sin zoom
  useEffect(() => {
    if (visible) setLevel(0);
  }, [visible]);

  const zoom = ZOOM_LEVELS[level];
  // a 1x la imagen ocupa el ancho de la pantalla sin pasarse de la altura disponible
  const base = Math.min(width - spacing.lg * 2, height * 0.62);
  const size = base * zoom;

  const zoomIn = () => setLevel((current) => Math.min(current + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => setLevel((current) => Math.max(current - 1, 0));
  const onImagePress = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      setLevel((current) => (current === 0 ? 2 : 0));
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.screen, { backgroundColor: '#ffffff' }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title ?? ''}
          </Text>
          <ModalCloseButton onPress={onClose} />
        </View>

        {/* con zoom la imagen es más grande que la pantalla: se recorre en ambos sentidos */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={zoom > 1}>
          <ScrollView horizontal contentContainerStyle={styles.scrollContent} showsHorizontalScrollIndicator={zoom > 1}>
            <Pressable
              onPress={onImagePress}
              accessibilityRole="imagebutton"
              accessibilityLabel={title}
              accessibilityHint={t('IMAGE_ZOOM.DOUBLE_TAP')}
            >
              {uri ? <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="contain" /> : null}
            </Pressable>
          </ScrollView>
        </ScrollView>

        <Text style={[styles.hint, { color: colors.textMuted }]}>{t('IMAGE_ZOOM.HINT')}</Text>

        {/* la lupa */}
        <View style={[styles.toolbar, { backgroundColor: withAlpha(colors.primary, 0.1) }]}>
          <Pressable
            onPress={zoomOut}
            disabled={level === 0}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('IMAGE_ZOOM.ZOOM_OUT')}
            style={[styles.zoomButton, { backgroundColor: colors.primary, opacity: level === 0 ? 0.4 : 1 }]}
          >
            <MaterialIcons name="zoom-out" size={26} color={colors.onPrimary} />
          </Pressable>
          <Text style={[styles.level, { color: colors.text }]}>{Math.round(zoom * 100)}%</Text>
          <Pressable
            onPress={zoomIn}
            disabled={level === ZOOM_LEVELS.length - 1}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={t('IMAGE_ZOOM.ZOOM_IN')}
            style={[
              styles.zoomButton,
              { backgroundColor: colors.primary, opacity: level === ZOOM_LEVELS.length - 1 ? 0.4 : 1 },
            ]}
          >
            <MaterialIcons name="zoom-in" size={26} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { flex: 1, fontSize: fontSize.body, fontWeight: fontWeight.bold },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  hint: { textAlign: 'center', fontSize: fontSize.caption, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  zoomButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  level: { minWidth: 56, textAlign: 'center', fontSize: fontSize.body, fontWeight: fontWeight.bold },
});
