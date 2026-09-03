import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../../app/theme';

// equivalente al shared/components/back-button de la web (usa el router directamente)
export function BackButton() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  if (!navigation.canGoBack()) {
    return null;
  }

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={10}
      style={[styles.button, { backgroundColor: colors.itemHover }]}
    >
      <MaterialIcons name="chevron-left" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
});
