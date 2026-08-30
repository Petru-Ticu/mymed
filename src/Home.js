import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import AppScreen from './layout/AppScreen';
import { useAppNavigation } from './navigation/useAppNavigation';
import { useDoseActions } from './DoseReminderHost';
import { formatCountdown, useNotificationItems } from './notificationItems';
import { unitLabel } from './i18n/labels';
import { useI18n } from './i18n';
import { styles } from './Home.styles';

function dayLabel(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function timedItems(items) {
  return (items || []).filter((item) => item.kind === 'due' || item.kind === 'upcoming');
}

export default function Home() {
  const { t } = useI18n();
  const { items, now } = useNotificationItems();
  const { handleMyMedsPress } = useAppNavigation();
  const { promptScheduledDose } = useDoseActions();
  const doses = timedItems(items);
  const due = doses.filter((item) => item.kind === 'due');
  const upcoming = doses.filter((item) => item.kind === 'upcoming');

  const onPressDue = (item) => {
    if (item.doseItem) {
      promptScheduledDose(item.doseItem);
    }
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('home.title')}</Text>
        <Text style={styles.today}>{t('home.today', { date: dayLabel(now) })}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

        {doses.length === 0 ? (
          <Pressable
            style={styles.emptyCard}
            onPress={handleMyMedsPress}
            accessibilityRole="button"
            accessibilityLabel={t('home.openMeds')}
          >
            <Text style={styles.emptyText}>{t('home.empty')}</Text>
            <Text style={styles.emptyAction}>{t('home.openMeds')}</Text>
          </Pressable>
        ) : (
          <>
            {due.length > 0 ? (
              <View>
                <Text style={styles.section}>{t('home.sectionDue')}</Text>
                {due.map((item) => {
                  const dose = item.doseItem;
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.card, styles.cardDue]}
                      onPress={() => onPressDue(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`${dose?.productName}. ${t('home.dueHint')}`}
                    >
                      <Text style={styles.name}>{dose?.productName}</Text>
                      <Text style={styles.time}>{t('home.atTime', { time: dose?.scheduledTime })}</Text>
                      <Text style={styles.take}>
                        {t('home.takeLine', {
                          quantity: dose?.quantity,
                          unit: unitLabel(dose?.unit),
                        })}
                      </Text>
                      <Text style={styles.hint}>{t('home.dueHint')}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {upcoming.length > 0 ? (
              <View>
                <Text style={styles.section}>{t('home.sectionUpcoming')}</Text>
                {upcoming.map((item) => {
                  const occurrence = item.occurrence;
                  return (
                    <View key={item.id} style={[styles.card, styles.cardUpcoming]}>
                      <Text style={styles.name}>{occurrence?.productName}</Text>
                      <Text style={styles.time}>
                        {t('home.nextAt', {
                          time: occurrence?.scheduledTime,
                          date: occurrence?.at ? dayLabel(occurrence.at) : '',
                        })}
                      </Text>
                      <Text style={styles.take}>
                        {t('home.takeLine', {
                          quantity: occurrence?.quantity,
                          unit: unitLabel(occurrence?.unit),
                        })}
                      </Text>
                      <Text style={styles.countdown}>
                        {t('home.countdown', { countdown: formatCountdown(item.countdownMs) })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}
