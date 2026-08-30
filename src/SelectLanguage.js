import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from './theme/colors';
import { sessionStore } from './userStore';
import { LANGUAGES, languageCode, setLanguage, useI18n } from './i18n';

export default function SelectLanguage({ route, navigation }) {
  const { t } = useI18n();
  const selectedCode = languageCode(
    route.params?.selectedLanguage || sessionStore.selectedLanguage,
  );
  const fromMore = route.params?.from === 'More';

  const handleLanguageSelect = (language) => {
    sessionStore.save({ selectedLanguage: language.code });
    setLanguage(language.code);
    if (fromMore) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Welcome', { selectedLanguage: language.code });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.background, paddingTop: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginLeft: 16, marginBottom: 8, color: colors.text }}>
          {t('language.title')}
        </Text>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={{
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: '#ddd',
              borderLeftWidth: 4,
              borderLeftColor: selectedCode === language.code ? '#0f0' : 'transparent',
            }}
            onPress={() => handleLanguageSelect(language)}
          >
            <Text style={{ fontSize: 22 }}>{language.flag}</Text>
            <Text style={{ marginLeft: 16, fontSize: 18, color: colors.text }}>{language.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
