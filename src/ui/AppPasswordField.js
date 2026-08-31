import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import AppTextField from './AppTextField';

const AppPasswordField = forwardRef(function AppPasswordField({
  label,
  error,
  placeholder,
  style,
  onSubmitEditing,
  returnKeyType,
  onChangeText,
  mask = true,
}, ref) {
  const inputRef = useRef(null);
  const textRef = useRef('');

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus?.(),
    blur: () => inputRef.current?.blur?.(),
    getValue: () => textRef.current,
    clear: () => {
      textRef.current = '';
      inputRef.current?.clear?.();
    },
  }));

  return (
    <AppTextField
      ref={inputRef}
      label={label}
      error={error}
      placeholder={placeholder}
      style={style}
      defaultValue=""
      onChangeText={(text) => {
        textRef.current = text;
        onChangeText?.(text);
      }}
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
      autoCorrect={false}
      autoCapitalize="none"
      spellCheck={false}
      autoComplete="off"
      textContentType="none"
      secureTextEntry={mask}
    />
  );
});

export default AppPasswordField;
