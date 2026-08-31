import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

export default function AppCard({
  children,
  style,
  onPress,
  accessibilityLabel,
  accessibilityRole,
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.card, style, pressed ? styles.pressed : null]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]} accessibilityRole={accessibilityRole}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  pressed: {
    opacity: 0.88,
  },
});
