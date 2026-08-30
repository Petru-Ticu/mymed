import React, { useMemo, useRef, useState } from 'react';
import { View, Text, KeyboardAvoidingView, ScrollView, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AppScreen from './layout/AppScreen';
import { useAppNavigation } from './navigation/useAppNavigation';
import { styles } from './Accountsettings.styles';
import { accountStore, sessionStore, userAppState } from './userStore';
import FieldError from './FieldError';
import { ERRORS_ACCOUNT_SETTINGS } from './constants';
import { colors } from './theme/colors';
import {
  getBirthDateError,
  getCurrentPasswordError,
  getNewPasswordError,
  getRequiredNameError,
  getRetypeNewPasswordError,
} from './utils/inputRules';
import { useI18n } from './i18n';

const NAME_LIMIT = 36;
const NAME_CHARS = /^[a-zA-Z\s]*$/;
const GENDERS = [
  { value: 'Male', key: 'account.male' },
  { value: 'Female', key: 'account.female' },
  { value: 'Other', key: 'account.other' },
];
const FOCUS = '#32CD32';

function splitBirthDate(text) {
  const parts = String(text || '').split('/');
  if (parts.length !== 3) {
    return { day: '', month: '', year: '' };
  }
  return { day: parts[0], month: parts[1], year: parts[2] };
}

function paperTheme(focused) {
  return {
    colors: {
      primary: focused ? FOCUS : undefined,
      text: colors.text,
      placeholder: colors.text,
    },
  };
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

  const [firstName, setFirstName] = useState(accountStore.firstName);
  const [lastName, setLastName] = useState(accountStore.lastName);
  const [gender, setGender] = useState(accountStore.gender);
  const [birthDate, setBirthDate] = useState(savedBirth);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [errors, setErrors] = useState({});
  const [focus, setFocus] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [birthOpen, setBirthOpen] = useState(false);
  const [pickedDay, setPickedDay] = useState(savedBirth.day || '1');
  const [pickedMonth, setPickedMonth] = useState(savedBirth.month || '1');
  const [pickedYear, setPickedYear] = useState(savedBirth.year || String(new Date().getFullYear() - 18));
  const [pickerSize, setPickerSize] = useState({ width: 40, height: 40 });

  const refs = {
    firstName: useRef(null),
    lastName: useRef(null),
    currentPassword: useRef(null),
    newPassword: useRef(null),
    retypePassword: useRef(null),
  };

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), []);
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: now - 1900 }, (_, i) => String(now - i));
  }, []);

  const blurAll = () => {
    Object.values(refs).forEach((ref) => ref.current?.blur?.());
  };

  const onNameChange = (setter) => (text) => {
    if (NAME_CHARS.test(text) && text.length <= NAME_LIMIT) {
      setter(text);
    }
  };

  const changingPassword = Boolean(currentPassword || newPassword || retypePassword);

  const collectErrors = () => ({
    firstName: getRequiredNameError(firstName, ERRORS_ACCOUNT_SETTINGS.firstNameEmpty),
    lastName: getRequiredNameError(lastName, ERRORS_ACCOUNT_SETTINGS.lastNameEmpty),
    gender: gender ? '' : ERRORS_ACCOUNT_SETTINGS.genderEmpty,
    birthDate: getBirthDateError(birthDate.day, birthDate.month, birthDate.year),
    currentPassword: getCurrentPasswordError(currentPassword, sessionStore.password, changingPassword),
    newPassword: getNewPasswordError(newPassword, changingPassword),
    retypePassword: getRetypeNewPasswordError(newPassword, retypePassword, changingPassword),
  });

  const handleSave = () => {
    const nextErrors = collectErrors();
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }
    const birthDateText = `${birthDate.day}/${birthDate.month}/${birthDate.year}`;
    accountStore.save({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      birthDate: birthDateText,
      passwordTyped: changingPassword ? newPassword : undefined,
    });
    if (changingPassword) {
      sessionStore.save({
        email: sessionStore.email,
        selectedLanguage: sessionStore.selectedLanguage,
        password: newPassword,
      });
    }
    userAppState.debugLog();
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home', { email: sessionStore.email });
    }
  };

  const outline = (key) => (focus === key ? FOCUS : colors.text);

  const nameProps = (key, value, setter, extra = {}) => ({
    style: [styles.accountInputs, { width: 320, borderColor: outline(key) }],
    value,
    mode: 'outlined',
    maxLength: NAME_LIMIT,
    autoCorrect: false,
    autoCapitalize: 'none',
    ref: refs[key],
    theme: paperTheme(focus === key),
    onFocus: () => setFocus(key),
    onBlur: () => setFocus(''),
    outlineColor: outline(key),
    onChangeText: extra.onChangeText || onNameChange(setter),
    placeholder: extra.placeholder,
    secureTextEntry: extra.secureTextEntry,
  });

  const genderDisplay = gender === 'Male' ? t('account.male')
    : gender === 'Female' ? t('account.female')
    : gender === 'Other' ? t('account.other')
    : gender;

  const birthLabel = birthDate.day && birthDate.month && birthDate.year
    ? `${birthDate.day}/${birthDate.month}/${birthDate.year}`
    : '';

  return (
    <AppScreen>
      <KeyboardAvoidingView behavior="padding" style={styles.body}>
        <ScrollView
          contentContainerStyle={[styles.bodyContent, { justifyContent: 'flex-start', width: windowWidth }]}
          showsVerticalScrollIndicator={false}
        >
          <AccountField label={t('account.firstName')} error={errors.firstName}>
            <TextInput {...nameProps('firstName', firstName, setFirstName, { placeholder: t('account.firstNamePlaceholder') })} />
          </AccountField>
          <AccountField label={t('account.lastName')} error={errors.lastName}>
            <TextInput {...nameProps('lastName', lastName, setLastName, { placeholder: t('account.lastNamePlaceholder') })} />
          </AccountField>
          <AccountField label={t('account.gender')} error={errors.gender}>
            <View style={styles.genderPanelOrdering}>
              <TextInput
                style={[styles.accountInputs, styles.centeredText, { width: 172.5 }]}
                value={genderDisplay}
                mode="outlined"
                placeholder={t('account.genderPlaceholder')}
                editable={false}
                onLayout={(event) => {
                  const { height } = event.nativeEvent.layout;
                  setPickerSize({ width: height, height });
                }}
                outlineColor={colors.text}
              />
              <TouchableOpacity
                style={[styles.genderButton, pickerSize]}
                onPress={() => {
                  blurAll();
                  setGenderOpen(true);
                }}
              >
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
            </View>
          </AccountField>
          <AccountField label={t('account.birthDate')} error={errors.birthDate}>
            <View style={styles.genderPanelOrdering}>
              <TextInput
                style={[styles.accountInputs, styles.centeredText, { width: 172.5 }]}
                mode="outlined"
                placeholder={t('account.birthPlaceholder')}
                value={birthLabel}
                editable={false}
                outlineColor={colors.text}
              />
              <TouchableOpacity
                style={[styles.birthDateButton, pickerSize]}
                onPress={() => {
                  blurAll();
                  setBirthOpen(true);
                }}
              >
                <Text style={styles.arrow}>▲</Text>
              </TouchableOpacity>
            </View>
          </AccountField>
          <AccountField label={t('account.typePassword')} error={errors.currentPassword}>
            <TextInput
              {...nameProps('currentPassword', currentPassword, setCurrentPassword, {
                placeholder: t('account.currentPasswordPlaceholder'),
                secureTextEntry: true,
                onChangeText: setCurrentPassword,
              })}
            />
          </AccountField>
          <AccountField label={t('account.newPassword')} error={errors.newPassword}>
            <TextInput
              {...nameProps('newPassword', newPassword, setNewPassword, {
                placeholder: t('account.newPasswordPlaceholder'),
                secureTextEntry: true,
                onChangeText: setNewPassword,
              })}
            />
          </AccountField>
          <AccountField label={t('account.retypePassword')} error={errors.retypePassword}>
            <TextInput
              {...nameProps('retypePassword', retypePassword, setRetypePassword, {
                placeholder: t('account.retypePasswordPlaceholder'),
                secureTextEntry: true,
                onChangeText: setRetypePassword,
              })}
            />
          </AccountField>
          <View style={styles.accountPanels}>
            <TouchableOpacity
              style={[styles.saveButton, { marginLeft: (windowWidth - 315) / 2, marginRight: (windowWidth - 315) / 2 }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t('account.save')}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginBottom: 180 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal transparent visible={genderOpen} animationType="slide" onRequestClose={() => setGenderOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setGenderOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContentGender}>
                <Text style={styles.modalTitle}>{t('account.genderTitle')}</Text>
                {GENDERS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.modalButton}
                    onPress={() => {
                      setGender(option.value);
                      setGenderOpen(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>{t(option.key)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal transparent visible={birthOpen} animationType="slide" onRequestClose={() => setBirthOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBirthDate}>
            <Text style={styles.modalTitle}>{t('account.birthTitle')}</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={pickedDay} style={styles.picker} onValueChange={setPickedDay}>
                {days.map((day) => <Picker.Item key={day} label={day} value={day} />)}
              </Picker>
              <Picker selectedValue={pickedMonth} style={styles.picker} onValueChange={setPickedMonth}>
                {months.map((month) => <Picker.Item key={month} label={month} value={month} />)}
              </Picker>
              <Picker selectedValue={pickedYear} style={styles.picker} onValueChange={setPickedYear}>
                {years.map((year) => <Picker.Item key={year} label={year} value={year} />)}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.modalButtonBirthDate}
              onPress={() => {
                setBirthDate({ day: pickedDay, month: pickedMonth, year: pickedYear });
                setBirthOpen(false);
              }}
            >
              <Text style={styles.modalButtonTextBirthDate}>{t('account.confirmBirth')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}
