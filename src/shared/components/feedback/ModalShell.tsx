import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { spacing, useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';

interface ModalShellProps {
  visible: boolean;
  onRequestClose: () => void;
  // tocar fuera de la tarjeta cierra (no en formularios, para no perder lo escrito)
  onBackdropPress?: () => void;
  // sube el contenido cuando aparece el teclado
  keyboardAvoiding?: boolean;
  // espacio entre la tarjeta y los bordes de la pantalla
  padding?: number;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const OPEN_MS = 240;
// debe quedar por debajo de los 300 ms que esperan las pantallas antes de abrir otro modal
// (en iOS no se puede abrir un modal mientras otro se está cerrando)
const CLOSE_MS = 170;
const IOS_SAFE_GAP_MS = 300;

// cuándo empezó a cerrarse el último modal: AppAlert espera a que pase el margen de iOS
let lastCloseAt = 0;
export function msUntilModalCanOpen(): number {
  return Math.max(0, lastCloseAt + IOS_SAFE_GAP_MS - Date.now());
}

// base de todos los modales: fondo desenfocado del color del tema y la tarjeta que entra con
// un pequeño zoom. Mientras se cierra sigue mostrando el último contenido para que no
// desaparezca de golpe cuando la pantalla pone sus datos en null.
export function ModalShell({
  visible,
  onRequestClose,
  onBackdropPress,
  keyboardAvoiding = false,
  padding = spacing.lg,
  contentStyle,
  children,
}: ModalShellProps) {
  const { colors, themeName } = useTheme();
  const isDark = themeName === 'greenDark' || themeName === 'pinkDark';
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const wasVisible = useRef(visible);
  const lastChildren = useRef(children);
  if (visible) lastChildren.current = children;

  useEffect(() => {
    const opened = wasVisible.current;
    wasVisible.current = visible;
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: OPEN_MS,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }).start();
    } else {
      if (opened) lastCloseAt = Date.now();
      Animated.timing(progress, {
        toValue: 0,
        duration: CLOSE_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, progress]);

  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });
  const backdropOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' });

  const Container = keyboardAvoiding ? KeyboardAvoidingView : View;

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onRequestClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}>
        <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : withAlpha(colors.text, 0.45) }]} />
      </Animated.View>

      {/* 'padding' también en Android: con edge-to-edge la ventana no se achica con el teclado */}
      <Container style={[styles.center, { padding }]} {...(keyboardAvoiding ? { behavior: 'padding' as const } : {})}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onBackdropPress} disabled={!onBackdropPress} />
        <Animated.View
          style={[styles.content, contentStyle, { opacity: backdropOpacity, transform: [{ translateY }, { scale }] }]}
          pointerEvents={visible ? 'box-none' : 'none'}
        >
          {lastChildren.current}
        </Animated.View>
      </Container>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  // ocupa todo el alto para que los maxHeight en % de las tarjetas sigan funcionando;
  // los toques en el espacio vacío pasan al fondo (box-none)
  content: { flex: 1, justifyContent: 'center' },
});
