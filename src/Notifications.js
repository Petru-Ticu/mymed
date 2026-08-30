import React from 'react';
import { ScrollView, Text, Pressable, View } from 'react-native';
import AppScreen from './layout/AppScreen';
import { useAppNavigation } from './navigation/useAppNavigation';
import { useDoseActions } from './DoseReminderHost';
import { useNotificationItems } from './notificationItems';
import { styles } from './Notifications.styles';
import { useI18n } from './i18n';

const CARD_STYLE = {
  due: styles.cardDue,
  upcoming: styles.cardUpcoming,
  approaching: styles.cardApproaching,
  empty: styles.cardEmpty,
  low: styles.cardLow,
};

export default function Notifications() {
  const { items } = useNotificationItems();
  const { handleMyMedsPress } = useAppNavigation();
  const { promptScheduledDose } = useDoseActions();
  const { t } = useI18n();

  const onPressItem = (item) => {
    if (item.kind === 'due' && item.doseItem) {
      promptScheduledDose(item.doseItem);
      return;
    }
    if (item.goToMeds) {
      handleMyMedsPress();
    }
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        <Text style={styles.subtitle}>{t('notifications.subtitle')}</Text>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
          </View>
        ) : (
          items.map((item) => {
            const clickable = item.kind === 'due' || item.goToMeds;
            const Card = clickable ? Pressable : View;
            return (
              <Card
                key={item.id}
                {...(clickable
                  ? { onPress: () => onPressItem(item), accessibilityRole: 'button' }
                  : {})}
                style={[styles.card, CARD_STYLE[item.kind]]}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>
                {item.hint ? <Text style={styles.cardHint}>{item.hint}</Text> : null}
              </Card>
            );
          })
        )}
      </ScrollView>
    </AppScreen>
  );
}
