import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { withAlpha } from '../../../../shared/utils/color';
import { getInitials } from '../../utils/reservationUtils';

interface OperatorAvatarProps {
  name: string;
  size?: number;
}

// Círculo con las iniciales del operario
export function OperatorAvatar({ name, size = 54 }: OperatorAvatarProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(colors.primary, 0.15),
      }}
    >
      <Text style={{ fontSize: size * 0.3, fontWeight: '800', color: colors.primaryHover }}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
