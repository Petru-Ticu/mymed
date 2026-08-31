import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  accessibilityLabel,
  disabled = false,
  style,
}) {
  const backgroundColor = variant === 'danger'
    ? colors.danger
    : variant === 'secondary'
      ? colors.surface
      : colors.accent;
  const color = variant === 'danger' ? colors.white : colors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: layout.radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
