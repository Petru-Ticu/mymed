import React, { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import AppScreen from './layout/AppScreen';
import { colors } from './theme/colors';
import { useI18n, getLanguageMeta } from './i18n';
import { accountStore, sessionStore } from './userStore';
import { useMedicalList } from './MedicalListContext';
import { resetMedicationHistory } from './medicationDoseActions';
import { syncScheduledDoseAlerts } from './phoneAlerts';
import { useAppNavigation } from './navigation/useAppNavigation';

const APP_VERSION = '1.0.0';

export default function More() {
  const { t, language } = useI18n();
  const { navigation } = useAppNavigation();
  const { medicalLists, setMedicalLists } = useMedicalList();
  const [notify, setNotify] = useState(sessionStore.notifyOneMinuteBefore);
  const meta = getLanguageMeta(language);

  useEffect(() => {
    setNotify(sessionStore.notifyOneMinuteBefore);
  }, [language]);

  const onToggleNotify = (value) => {
    setNotify(value);
    sessionStore.save({ notifyOneMinuteBefore: value });
    syncScheduledDoseAlerts(medicalLists);
  };

  const onSignOut = () => {
    Alert.alert(t('more.signOut'), t('more.signOutConfirm'), [
      { text: t('more.cancel'), style: 'cancel' },
      {
        text: t('more.ok'),
        style: 'destructive',
        onPress: () => {
          sessionStore.clearIdentity();
          accountStore.clear();
          setMedicalLists([]);
          resetMedicationHistory();
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('more.title')}</Text>

        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Language_Selector', {
            from: 'More',
            selectedLanguage: language,
          })}
        >
          <Text style={styles.rowTitle}>{t('more.language')}</Text>
          <Text style={styles.rowValue}>{t('more.languageValue', { name: `${meta.flag}  ${meta.name}` })}</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{t('more.notifications')}</Text>
            <Text style={styles.rowValue}>{t('more.notifyOneMinute')}</Text>
          </View>
          <Switch
            value={notify}
            onValueChange={onToggleNotify}
            trackColor={{ false: '#ccc', true: colors.accent }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{t('more.about')}</Text>
            <Text style={styles.rowValue}>{t('more.aboutBody', { version: APP_VERSION })}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOut} onPress={onSignOut}>
          <Text style={styles.signOutText}>{t('more.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 140,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  row: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  rowValue: {
    fontSize: 16,
    color: colors.text,
    marginTop: 4,
  },
  signOut: {
    marginTop: 12,
    backgroundColor: '#E53935',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
