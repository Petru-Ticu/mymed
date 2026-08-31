import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AppScreen from './layout/AppScreen';
import { useAppNavigation } from './navigation/useAppNavigation';
import { styles } from './Accountsettings.styles';
import { accountStore, sessionStore } from './userStore';
import FieldError from './FieldError';
import { ERRORS_ACCOUNT_SETTINGS } from './constants';
import { colors } from './theme/colors';
import {
  getBirthDateError,
  getCurrentPasswordError,
  getNewPasswordError,
  getRequiredNameError,
  getRetypeNewPasswordError,
  NAME_CHAR_FILTER,
} from './utils/inputRules';
import { useI18n } from './i18n';
import AppButton from './ui/AppButton';
import AppTextField from './ui/AppTextField';
import AppPasswordField from './ui/AppPasswordField';

const NAME_LIMIT = 36;
const GENDERS = [
  { value: 'Male', key: 'account.male' },
  { value: 'Female', key: 'account.female' },
  { value: 'Other', key: 'account.other' },
];

function splitBirthDate(text) {
  const parts = String(text || '').split('/');
  if (parts.length !== 3) {
    return { day: '', month: '', year: '' };
  }
  return { day: parts[0], month: parts[1], year: parts[2] };
}

function WheelColumn({ values, selected, onSelect }) {
  return (
    <ScrollView
      style={styles.datePickerColumn}
      contentContainerStyle={styles.datePickerColumnContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      {values.map((value) => (
        <TouchableOpacity
          key={value}
          style={[styles.datePickerItem, selected === value ? styles.datePickerItemSelected : null]}
          onPress={() => onSelect(value)}
        >
          <Text style={styles.datePickerText}>{value}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function AccountField({ label, error, children }) {
  return (
    <View style={styles.accountPanels}>
      <Text style={styles.text}>{label}</Text>
      {children}
      <FieldError message={error} />
    </View>
  );
}

export default function Accountsettings() {
  const { navigation, windowWidth } = useAppNavigation();
  const { t } = useI18n();
  const savedBirth = splitBirthDate(accountStore.birthDate);
  const fieldWidth = Math.min(320, windowWidth - 48);

  const [firstName, setFirstName] = useState(accountStore.firstName);
  const [lastName, setLastName] = useState(accountStore.lastName);
  const [gender, setGender] = useState(accountStore.gender);
  const [birthDate, setBirthDate] = useState(savedBirth);
  const [errors, setErrors] = useState({});
  const [genderOpen, setGenderOpen] = useState(false);
  const [birthOpen, setBirthOpen] = useState(false);
  const [pickedDay, setPickedDay] = useState(savedBirth.day || '1');
  const [pickedMonth, setPickedMonth] = useState(savedBirth.month || '1');
  const [pickedYear, setPickedYear] = useState(savedBirth.year || String(new Date().getFullYear() - 18));
  const [saved, setSaved] = useState(false);
  const [inputsLocked, setInputsLocked] = useState(false);

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const retypePasswordRef = useRef(null);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), []);
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: now - 1900 }, (_, i) => String(now - i));
  }, []);

  const blurAll = () => {
    firstNameRef.current?.blur?.();
    lastNameRef.current?.blur?.();
    currentPasswordRef.current?.blur?.();
    newPasswordRef.current?.blur?.();
    retypePasswordRef.current?.blur?.();
  };

  const lockTimer = useRef(null);

  const lockInputsBriefly = () => {
    setInputsLocked(true);
    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
    }
    lockTimer.current = setTimeout(() => setInputsLocked(false), 400);
  };

  useEffect(() => () => {
    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
    }
  }, []);

  const closeGender = (value) => {
    if (value) {
      setGender(value);
      setSaved(false);
    }
    Keyboard.dismiss();
    setGenderOpen(false);
    lockInputsBriefly();
  };

  const confirmBirth = () => {
    Keyboard.dismiss();
    setBirthDate({ day: pickedDay, month: pickedMonth, year: pickedYear });
    setSaved(false);
    setBirthOpen(false);
    lockInputsBriefly();
  };

  const onNameChange = (setter) => (text) => {
    if (NAME_CHAR_FILTER.test(text) && text.length <= NAME_LIMIT) {
      setter(text);
      setSaved(false);
    }
  };

  const readPasswords = () => ({
    currentPassword: currentPasswordRef.current?.getValue?.() || '',
    newPassword: newPasswordRef.current?.getValue?.() || '',
    retypePassword: retypePasswordRef.current?.getValue?.() || '',
  });

  const collectErrors = () => {
    const { currentPassword, newPassword, retypePassword } = readPasswords();
    const changingPassword = Boolean(currentPassword || newPassword || retypePassword);
    return {
      firstName: getRequiredNameError(firstName, ERRORS_ACCOUNT_SETTINGS.firstNameEmpty),
      lastName: getRequiredNameError(lastName, ERRORS_ACCOUNT_SETTINGS.lastNameEmpty),
      gender: gender ? '' : ERRORS_ACCOUNT_SETTINGS.genderEmpty,
      birthDate: getBirthDateError(birthDate.day, birthDate.month, birthDate.year),
      currentPassword: getCurrentPasswordError(currentPassword, sessionStore.password, changingPassword),
      newPassword: getNewPasswordError(newPassword, changingPassword),
      retypePassword: getRetypeNewPasswordError(newPassword, retypePassword, changingPassword),
    };
  };

  const handleSave = () => {
    const { newPassword } = readPasswords();
    const nextErrors = collectErrors();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    Keyboard.dismiss();
    blurAll();
    const changingPassword = Boolean(newPassword);
    const birthDateText = `${birthDate.day}/${birthDate.month}/${birthDate.year}`;
    try {
      accountStore.save({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        birthDate: birthDateText,
        passwordTyped: changingPassword ? newPassword : undefined,
      });
      if (changingPassword) {
        sessionStore.save({ password: newPassword });
      }
      currentPasswordRef.current?.clear?.();
      newPasswordRef.current?.clear?.();
      retypePasswordRef.current?.clear?.();
      setSaved(true);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home', { email: sessionStore.email });
      }
    } catch {
      setSaved(false);
    }
  };

  const genderDisplay = gender === 'Male' ? t('account.male')
    : gender === 'Female' ? t('account.female')
    : gender === 'Other' ? t('account.other')
    : gender;

  const birthLabel = birthDate.day && birthDate.month && birthDate.year
    ? `${birthDate.day}/${birthDate.month}/${birthDate.year}`
    : '';

  const nameField = (key, value, setter, ref) => (
    <AppTextField
      ref={ref}
      label={t(`account.${key}`)}
      error={errors[key]}
      value={value}
      maxLength={NAME_LIMIT}
      autoCorrect={false}
      autoCapitalize="none"
      placeholder={t(`account.${key}Placeholder`)}
      onChangeText={onNameChange(setter)}
      style={{ width: fieldWidth }}
    />
  );

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.body}
      >
        <ScrollView
          contentContainerStyle={[styles.bodyContent, { justifyContent: 'flex-start', width: windowWidth }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {nameField('firstName', firstName, setFirstName, firstNameRef)}
          {nameField('lastName', lastName, setLastName, lastNameRef)}

          <AccountField label={t('account.gender')} error={errors.gender}>
            <View style={styles.genderPanelOrdering}>
              <View style={[styles.readOnlyValue, { width: Math.min(200, windowWidth - 140) }]}>
                <Text style={styles.readOnlyValueText}>
                  {genderDisplay || t('account.genderPlaceholder')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.genderButton}
                onPress={() => {
                  blurAll();
                  setGenderOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={t('account.openGender')}
              >
                <MaterialIcons name="expand-more" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>
          </AccountField>

          <AccountField label={t('account.birthDate')} error={errors.birthDate}>
            <View style={styles.genderPanelOrdering}>
              <View style={[styles.readOnlyValue, { width: Math.min(200, windowWidth - 140) }]}>
                <Text style={styles.readOnlyValueText}>
                  {birthLabel || t('account.birthPlaceholder')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.birthDateButton}
                onPress={() => {
                  blurAll();
                  setBirthOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={t('account.openBirth')}
              >
                <MaterialIcons name="expand-more" size={26} color={colors.text} />
              </TouchableOpacity>
            </View>
          </AccountField>

          <View pointerEvents={inputsLocked ? 'none' : 'auto'} style={{ width: '100%' }}>
            <AppPasswordField
              ref={currentPasswordRef}
              label={t('account.typePassword')}
              error={errors.currentPassword}
              placeholder={t('account.currentPasswordPlaceholder')}
              style={{ width: fieldWidth }}
            />
            <AppPasswordField
              ref={newPasswordRef}
              label={t('account.newPassword')}
              error={errors.newPassword}
              placeholder={t('account.newPasswordPlaceholder')}
              style={{ width: fieldWidth }}
            />
            <AppPasswordField
              ref={retypePasswordRef}
              label={t('account.retypePassword')}
              error={errors.retypePassword}
              placeholder={t('account.retypePasswordPlaceholder')}
              style={{ width: fieldWidth }}
            />
          </View>

          <View style={styles.accountPanels}>
            <AppButton label={t('account.save')} onPress={handleSave} />
            {saved ? <Text style={styles.savedHint}>{t('account.saved')}</Text> : null}
          </View>
          <View style={{ marginBottom: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {genderOpen ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => closeGender()}>
          <TouchableWithoutFeedback onPress={() => closeGender()}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContentGender}>
                  <Text style={styles.modalTitle}>{t('account.genderTitle')}</Text>
                  {GENDERS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={styles.modalButton}
                      onPress={() => closeGender(option.value)}
                    >
                      <Text style={styles.modalButtonText}>{t(option.key)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : null}

      {birthOpen ? (
        <Modal transparent visible animationType="fade" onRequestClose={() => { setBirthOpen(false); lockInputsBriefly(); }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentBirthDate}>
              <Text style={styles.modalTitle}>{t('account.birthTitle')}</Text>
              <View style={styles.pickerContainer}>
                <WheelColumn values={days} selected={pickedDay} onSelect={setPickedDay} />
                <WheelColumn values={months} selected={pickedMonth} onSelect={setPickedMonth} />
                <WheelColumn values={years} selected={pickedYear} onSelect={setPickedYear} />
              </View>
              <TouchableOpacity style={styles.modalButtonBirthDate} onPress={confirmBirth}>
                <Text style={styles.modalButtonTextBirthDate}>{t('account.confirmBirth')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : null}
    </AppScreen>
  );
}
