import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppNavigation } from './navigation/useAppNavigation';
import { useNotificationItems } from './notificationItems';
import { accountStore, subscribeUserStore } from './userStore';
import { colors } from './theme/colors';
import { layout } from './theme/layout';
import { useI18n } from './i18n';

export default function Header() {
  const { handleAccountPress, handleNotificationsPress, email } = useAppNavigation();
  const { badgeCount } = useNotificationItems();
  const { t } = useI18n();
  const [firstName, setFirstName] = useState(accountStore.firstName);

  useEffect(() => subscribeUserStore(() => {
    setFirstName(accountStore.firstName);
  }), []);

  const headerName = firstName || email;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.accountHeader}>
        <Pressable
          onPress={handleAccountPress}
          style={styles.accountContainer}
          accessibilityRole="button"
          accessibilityLabel={t('header.openAccount')}
        >
          <Ionicons name="person-circle-outline" size={36} color={colors.text} />
          <View style={styles.accountTextContainer}>
            <Text style={styles.accountName} numberOfLines={1}>
              {headerName || t('header.account')}
            </Text>
            {headerName ? (
              <Text style={styles.accountHint}>{t('header.account')}</Text>
            ) : null}
          </View>
        </Pressable>
        <Pressable
          onPress={handleNotificationsPress}
          style={styles.notificationsButton}
          accessibilityRole="button"
          accessibilityLabel={
            badgeCount > 0
              ? t('header.notificationsBadge', { count: badgeCount })
              : t('header.notifications')
          }
        >
          <Ionicons name="notifications-outline" size={26} color={colors.text} />
          {badgeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : String(badgeCount)}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.accent,
  },
  accountHeader: {
    height: layout.headerInnerHeight,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  accountContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  accountTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  accountHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  notificationsButton: {
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.text,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
});
