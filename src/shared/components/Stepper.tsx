import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../app/theme';

interface StepperProps {
  currentStep: 1 | 2 | 3;
  totalSteps?: number;
}

// indicador 1-2-3 equivalente a app-stepper en el flujo de recuperación de contraseña
export function Stepper({ currentStep, totalSteps = 3 }: StepperProps) {
  const { colors } = useTheme();
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        const isFilled = isDone || isActive;

        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: isFilled ? colors.primary : colors.itemHover,
                  borderColor: isFilled ? colors.primary : colors.border,
                },
              ]}
            >
              {isDone ? (
                <MaterialIcons name="check" size={14} color="#ffffff" />
              ) : (
                <Text style={[styles.stepNumber, { color: isActive ? '#ffffff' : colors.textSecondary }]}>
                  {step}
                </Text>
              )}
            </View>

            {index < steps.length - 1 && (
              <View style={[styles.line, { backgroundColor: isDone ? colors.primary : colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 36,
    height: 2,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
});
