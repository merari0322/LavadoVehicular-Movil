import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';

interface CardLinkProps {
  label: string;
  onPress: () => void;
}

// enlace "Ver ... →" al pie de las tarjetas del inicio (link de la web)
export function CardLink({ label, onPress }: CardLinkProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => pressed && { opacity: 0.6 }}>
        <Text style={[styles.text, { color: colors.primary }]}>{label} →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: 1, marginTop: 6, paddingTop: 12, alignItems: 'center' },
  text: { fontSize: 13, fontWeight: '700' },
});
