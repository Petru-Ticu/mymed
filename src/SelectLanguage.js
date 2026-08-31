import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme/colors';
import { sessionStore } from './userStore';
import { LANGUAGES, languageCode, setLanguage, useI18n } from './i18n';
import AppButton from './ui/AppButton';

export default function SelectLanguage({ route, navigation }) {
  const { t } = useI18n();
  const initialCode = languageCode(
    route.params?.selectedLanguage || sessionStore.selectedLanguage,
  );
  const [pickedCode, setPickedCode] = useState(initialCode);
  const fromMore = route.params?.from === 'More';

  const handleConfirm = () => {
    const language = LANGUAGES.find((item) => item.code === pickedCode) || LANGUAGES[0];
    sessionStore.save({ selectedLanguage: language.code });
    setLanguage(language.code);
    if (fromMore) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Welcome', { selectedLanguage: language.code });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('language.back')}
          style={styles.back}
        >
          <MaterialIcons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('language.title')}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {LANGUAGES.map((language) => {
          const selected = pickedCode === language.code;
          return (
            <TouchableOpacity
              key={language.code}
              style={[styles.row, selected ? styles.rowSelected : null]}
              onPress={() => setPickedCode(language.code)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={language.name}
            >
              <Text style={styles.flag}>{language.flag}</Text>
              <Text style={styles.name}>{language.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <AppButton label={t('language.confirm')} onPress={handleConfirm} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: colors.accent,
  },
  back: {
    padding: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  row: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  rowSelected: {
    borderLeftColor: colors.accentStrong,
    backgroundColor: colors.surface,
  },
  flag: {
    fontSize: 22,
  },
  name: {
    marginLeft: 16,
    fontSize: 18,
    color: colors.text,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.background,
  },
});
