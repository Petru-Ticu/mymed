import React, { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import FieldError from '../FieldError';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';

const AppTextField = forwardRef(function AppTextField({
  label,
  error,
  style,
  multiline = false,
  value,
  ...inputProps
}, ref) {
  const valueProps = value === undefined ? {} : { value };
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        underlineColorAndroid="transparent"
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          error ? styles.inputError : null,
          style,
        ]}
        {...valueProps}
        {...inputProps}
      />
      <FieldError message={error} />
    </View>
  );
});

export default AppTextField;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  inputError: {
    borderColor: colors.error,
  },
});
