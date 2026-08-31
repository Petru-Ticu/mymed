import React, { useState, useEffect, useRef } from 'react';
import { Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import {
  getWelcomeConfirmPasswordError,
  getWelcomeEmailError,
  getWelcomePasswordError,
} from './utils/inputRules';
import { sessionStore } from './userStore';
import { styles } from './Welcome.styles';
import { getLanguageMeta, languageCode, setLanguage, useI18n } from './i18n';
import AppTextField from './ui/AppTextField';
import AppPasswordField from './ui/AppPasswordField';
import AppButton from './ui/AppButton';

export default function Welcome({ navigation }) {
  const route = useRoute();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState('');

  const selectedLanguage = languageCode(
    route.params?.selectedLanguage || sessionStore.selectedLanguage || 'en',
  );
  const languageMeta = getLanguageMeta(selectedLanguage);

  useEffect(() => {
    if (route.params?.selectedLanguage) {
      const code = languageCode(route.params.selectedLanguage);
      setLanguage(code);
      sessionStore.save({ selectedLanguage: code });
    }
  }, [route.params?.selectedLanguage]);

  const onPressHandler = () => {
    const password = passwordRef.current?.getValue?.() || '';
    const confirmPassword = confirmPasswordRef.current?.getValue?.() || '';
    const emailError = getWelcomeEmailError(email);
    const passwordError = getWelcomePasswordError(password);
    const confirmError = getWelcomeConfirmPasswordError(password, confirmPassword);
    setErrorEmail(emailError);
    setErrorPassword(passwordError);
    setErrorConfirmPassword(confirmError);
    if (emailError || passwordError || confirmError) {
      return;
    }

    sessionStore.save({ email, selectedLanguage, password });
    navigation.navigate('Home', { selectedLanguage, email });
  };

  return (
    <SafeAreaView style={styles.body} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.welcomeContainer}>
            <Text style={styles.text}>{t('welcome.title')}</Text>
            <View style={{ alignSelf: 'flex-start', width: '86%' }}>
              <Text style={styles.textSL}>{t('welcome.signUp')}</Text>
            </View>
            <View style={styles.inputContainer}>
              <AppTextField
                ref={emailRef}
                error={errorEmail}
                onChangeText={(text) => {
                  setErrorEmail(getWelcomeEmailError(text));
                  setEmail(text);
                }}
                value={email}
                placeholder={t('welcome.emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={() => passwordRef.current?.focus?.()}
                returnKeyType="next"
              />
              <AppPasswordField
                ref={passwordRef}
                error={errorPassword}
                placeholder={t('welcome.passwordPlaceholder')}
                mask
                onChangeText={(text) => {
                  setErrorPassword(getWelcomePasswordError(text));
                  setErrorConfirmPassword(
                    getWelcomeConfirmPasswordError(text, confirmPasswordRef.current?.getValue?.() || ''),
                  );
                }}
                onSubmitEditing={() => confirmPasswordRef.current?.focus?.()}
                returnKeyType="next"
              />
              <AppPasswordField
                ref={confirmPasswordRef}
                error={errorConfirmPassword}
                placeholder={t('welcome.retypePasswordPlaceholder')}
                mask
                onChangeText={(text) => {
                  setErrorConfirmPassword(
                    getWelcomeConfirmPasswordError(passwordRef.current?.getValue?.() || '', text),
                  );
                }}
              />
              <View style={styles.languageRow}>
                <Text style={styles.languageLabel}>{t('welcome.selectLanguage')}</Text>
                <AppButton
                  variant="secondary"
                  label={t('welcome.languageValue', {
                    flag: languageMeta.flag,
                    name: languageMeta.name,
                  })}
                  onPress={() => navigation.navigate('Language_Selector', { selectedLanguage })}
                  accessibilityLabel={t('welcome.selectLanguage')}
                />
              </View>
              <Text style={styles.hint}>{t('welcome.sessionHint')}</Text>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <AppButton
              style={styles.continue}
              label={t('welcome.continue')}
              onPress={onPressHandler}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
