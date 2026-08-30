import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from './theme/colors';
import { sessionStore } from './userStore';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'zh-CN', name: '中文简体', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文繁體', flag: '🇹🇼' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
];

export default function SelectLanguage({ route, navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState(route.params?.selectedLanguage);

  useEffect(() => {
    if (route.params?.selectedLanguage) {
      setSelectedLanguage(route.params.selectedLanguage);
    }
  }, [route.params?.selectedLanguage]);

  const handleLanguageSelect = (language) => {
    sessionStore.save({
      email: sessionStore.email,
      selectedLanguage: language,
    });
    navigation.navigate('Welcome', { selectedLanguage: language });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: colors.background }}>
        {LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderColor: selectedLanguage?.code === language.code ? '#0f0' : 'transparent',
            }}
            onPress={() => handleLanguageSelect(language)}
          >
            <Text>{language.flag}</Text>
            <Text style={{ marginLeft: 16 }}>{language.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
