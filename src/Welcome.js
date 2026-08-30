import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Pressable, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import FieldError from './FieldError';
import {
  getWelcomeConfirmPasswordError,
  getWelcomeEmailError,
  getWelcomePasswordError,
} from './utils/inputRules';
import { userAppState, sessionStore } from './userStore';
import { styles } from './Welcome.styles';
import { getLanguageMeta, languageCode, setLanguage, useI18n } from './i18n';

export default function Welcome({ navigation }) {
  const route = useRoute();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    let isValid = true;

    const emailError = getWelcomeEmailError(email);
    const passwordError = getWelcomePasswordError(password);
    const confirmError = getWelcomeConfirmPasswordError(password, confirmPassword);
    setErrorEmail(emailError);
    setErrorPassword(passwordError);
    setErrorConfirmPassword(confirmError);
    if (emailError || passwordError || confirmError) {
      isValid = false;
    }

    if (isValid) {
      sessionStore.save({ email, selectedLanguage, password });
      userAppState.debugLog();
      navigation.navigate('Home', { selectedLanguage, email });
    }
  };

  const onPressHandlerSelectLang = () => {
    navigation.navigate('Language_Selector', { selectedLanguage });
  };

  const onSubmitEmail = () => {
    passwordRef.current.focus();
  };

  const onSubmitPassword = () => {
    confirmPasswordRef.current.focus();
  };

  const validateEmail = (text) => {
    setErrorEmail(getWelcomeEmailError(text));
    setEmail(text);
  };

  const validatePassword = (text) => {
    setErrorPassword(getWelcomePasswordError(text));
    setPassword(text);
  };

  const validateConfirmPassword = (text) => {
    setErrorConfirmPassword(getWelcomeConfirmPasswordError(password, text));
    setConfirmPassword(text);
  };

  useFocusEffect(() => {
    if (route.params?.selectedLanguage) {
      console.log('Selected Language:', route.params.selectedLanguage);
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.body}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.text}>{t('welcome.title')}</Text>
          <View style={{ alignSelf: 'flex-start', marginTop: 20 }}>
            <Text style={styles.textSL}>{t('welcome.signUp')}</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errorEmail ? { borderColor: 'red' } : null,
              ]}
              placeholderTextColor="#000000"
              backgroundColor="#ffffff"
              borderRadius={5}
              ref={emailRef}
              onChangeText={validateEmail}
              value={email}
              placeholder={t('welcome.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={onSubmitEmail}
            />
            {errorEmail ? <FieldError message={errorEmail} style={styles.errorText} /> : null}
            <TextInput
              style={[
                styles.input,
                errorPassword ? { borderColor: 'red' } : null,
              ]}
              placeholderTextColor="#000000"
              backgroundColor="#ffffff"
              borderRadius={5}
              ref={passwordRef}
              onChangeText={validatePassword}
              value={password}
              placeholder={t('welcome.passwordPlaceholder')}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={onSubmitPassword}
            />
            {errorPassword ? <FieldError message={errorPassword} style={styles.errorText} /> : null}
            <TextInput
              style={[
                styles.input,
                errorConfirmPassword ? { borderColor: 'red' } : null,
              ]}
              placeholderTextColor="#000000"
              backgroundColor="#ffffff"
              borderRadius={5}
              ref={confirmPasswordRef}
              onChangeText={validateConfirmPassword}
              value={confirmPassword}
              placeholder={t('welcome.retypePasswordPlaceholder')}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errorConfirmPassword ? <FieldError message={errorConfirmPassword} style={styles.errorText} /> : null}
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flexDirection: 'column' }}>
                <Text style={{ marginRight: 110, marginTop: 10 }}>{t('welcome.selectLanguage')}</Text>
                <TouchableOpacity onPress={onPressHandlerSelectLang} style={styles.selectLangBtn}>
                  <Text>{languageMeta.flag} {t('welcome.press')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ marginTop: 12 }}>{t('welcome.selectFilter')}</Text>
            </View>
            <View>
              <Text style={[{ marginTop: 30 }, { marginBottom: 10 }, { fontWeight: 'bold' }]}>
                {t('welcome.emailProviderHint')}
              </Text>
              <TouchableOpacity style={[styles.emailProvider, styles.appleProvider]}>
                <Text style={[styles.providersTexts, { color: '#000000' }]}>{t('welcome.apple')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.emailProvider, styles.googleProvider]}>
                <Text style={[styles.providersTexts, { color: '#000000' }]}>{t('welcome.google')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.emailProvider, styles.microsoftOutlookProvider]}>
                <Text style={[styles.providersTexts, { color: '#000000' }]}>{t('welcome.microsoft')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.emailProvider, styles.yahooProvider]}>
                <Text style={[styles.providersTexts, { color: '#ffffff' }]}>{t('welcome.yahoo')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.pressableWelcome,
              styles.pressableBackground,
              pressed && styles.pressableBackgroundHovered,
            ]}
            onPress={onPressHandler}
          >
            <Text style={styles.textPressable}>{t('welcome.continue')}</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
