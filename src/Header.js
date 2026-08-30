import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppNavigation } from './navigation/useAppNavigation';
import { useNotificationItems } from './notificationItems';
import { accountStore, subscribeUserStore } from './userStore';
import { colors } from './theme/colors';
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
        <Pressable onPress={handleAccountPress} style={styles.accountContainer}>
          <View style={styles.accountIcon}>
            <Ionicons name="person-circle-outline" size={55} color={colors.text} />
            <View style={styles.accountTextContainer}>
              <Text style={styles.accountText}>{t('header.accountSettings')}</Text>
              {headerName ? <Text style={styles.accountText}>{headerName}</Text> : null}
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={handleNotificationsPress}
          style={styles.notificationsButton}
          accessibilityLabel={
            badgeCount > 0
              ? t('header.notificationsBadge', { count: badgeCount })
              : t('header.notifications')
          }
        >
          <Ionicons name="notifications-outline" size={30} color={colors.text} />
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
    backgroundColor: colors.background,
  },
  accountHeader: {
    height: 100,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  accountIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  accountTextContainer: {
    marginLeft: 10,
  },
  accountText: {
    fontSize: 16,
    color: colors.text,
  },
  notificationsButton: {
    padding: 10,
    marginRight: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.text,
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
