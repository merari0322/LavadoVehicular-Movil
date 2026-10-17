import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';

interface InspectionPhotoThumbProps {
  source: ImageSourcePropType;
  size?: number;
  onPress?: () => void;
  // botón para quitarla (fotos aún sin guardar del formulario)
  onRemove?: () => void;
}

// Miniatura de una foto del reporte (como app-inspection-photo en la web): muestra un indicador
// mientras carga y un ícono si la foto ya no existe; al tocarla se abre ampliada
export function InspectionPhotoThumb({ source, size = 76, onPress, onRemove }: InspectionPhotoThumbProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  return (
    <View style={{ width: size, height: size }}>
      <Pressable
        style={[styles.thumb, { width: size, height: size }]}
        onPress={onPress}
        disabled={!onPress || missing}
      >
        {missing ? (
          <MaterialIcons name="broken-image" size={26} color={colors.textMuted} />
        ) : (
          <Image
            source={source}
            style={styles.image}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setMissing(true);
            }}
          />
        )}
        {loading && !missing ? <ActivityIndicator style={StyleSheet.absoluteFill} color={colors.primary} /> : null}
      </Pressable>
      {onRemove ? (
        <Pressable style={styles.remove} onPress={onRemove} hitSlop={8}>
          <MaterialIcons name="close" size={14} color="#ffffff" />
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    thumb: {
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
    },
    image: { width: '100%', height: '100%' },
    remove: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
      backgroundColor: colors.error,
    },
  });
