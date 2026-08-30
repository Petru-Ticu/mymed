import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useI18n } from './i18n';
import { colors } from './theme/colors';

export const errorTextStyle = {
  color: colors.error,
  fontSize: 14,
};

export default function FieldError({ message, vars, style }) {
  const { t } = useI18n();
  if (!message) {
    return null;
  }
  return <Text style={[styles.text, style]}>{t(message, vars)}</Text>;
}

const styles = StyleSheet.create({
  text: errorTextStyle,
});
