import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../app/theme';
import { withAlpha } from '../../utils/color';

interface GlassSurfaceProps {
  radius: number;
  intensity?: number;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function GlassSurface({
  radius,
  intensity = 50,
  containerStyle,
  contentStyle,
  children,
}: GlassSurfaceProps) {
  const { colors, themeName } = useTheme();
  const isDark = themeName === 'greenDark' || themeName === 'pinkDark';

  return (
    <View
      style={[
        {
          marginTop: -80,
          borderRadius: radius,
          shadowColor: colors.primary,
          shadowOpacity: 0.25,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        },

        containerStyle,
      ]}
    >
       <View
        style={[
          {
            borderRadius: radius,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: withAlpha(colors.primary, 0.25),

            // Fondo blanco translúcido
            backgroundColor: "rgba(249, 246, 246, 0.81)",

          },
          contentStyle,
        ]}
      >
        <BlurView
          intensity={intensity}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    </View>
  );
}
