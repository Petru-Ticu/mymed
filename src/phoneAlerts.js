import { Platform } from 'react-native';
import { colors } from './theme/colors';
import { getUpcomingOccurrences } from './frequencyHandlers';
import { t } from './i18n';
import { unitLabel } from './i18n/labels';
import { sessionStore } from './userStore';

let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  Notifications = null;
}

const ANDROID_CHANNEL = 'medicine-reminders';
let permissionAsked = false;

if (Notifications?.setNotificationHandler) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

async function ensureReady() {
  if (!Notifications) {
    return false;
  }
  if (Platform.OS === 'android' && Notifications.setNotificationChannelAsync) {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: t('phone.channelName'),
      importance: Notifications.AndroidImportance?.HIGH ?? 4,
      color: colors.accent,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.accent,
    });
  }
  if (!permissionAsked) {
    permissionAsked = true;
    const current = await Notifications.getPermissionsAsync();
    if (current.status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
  }
  const finalStatus = await Notifications.getPermissionsAsync();
  return finalStatus.status === 'granted';
}

function content({ title, body }) {
  return {
    title,
    body,
    sound: true,
    color: colors.accent,
    data: { source: 'app_doidoicinci' },
    ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL } : {}),
  };
}

export async function syncScheduledDoseAlerts(lists, now = new Date()) {
  if (!(await ensureReady())) {
    return;
  }
  await Notifications.dismissAllNotificationsAsync?.();
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!sessionStore.notifyOneMinuteBefore) {
    return;
  }
  const horizon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  for (const list of lists || []) {
    const upcoming = getUpcomingOccurrences(list, now, 20);
    for (const item of upcoming) {
      if (item.at > horizon) {
        continue;
      }
      const oneMinuteBefore = new Date(item.at.getTime() - 60 * 1000);
      if (oneMinuteBefore <= now) {
        continue;
      }
      await Notifications.scheduleNotificationAsync({
        content: content({
          title: t('phone.inOneMinuteTitle'),
          body: t('phone.inOneMinuteBody', {
            quantity: item.quantity,
            unit: unitLabel(item.unit),
            name: item.productName,
          }),
        }),
        trigger: oneMinuteBefore,
      });
    }
  }
}

export async function notifyInventoryOnPhone(warning) {
  if (!warning || !(await ensureReady())) {
    return;
  }
  const bodies = {
    approaching: t('phone.approachingBody', {
      name: warning.name,
      threshold: warning.threshold,
      amount: warning.amount,
    }),
    atThreshold: t('phone.atThresholdBody', {
      name: warning.name,
      amount: warning.amount,
    }),
    empty: t('phone.emptyBody', { name: warning.name }),
  };
  const titles = {
    approaching: t('phone.approachingTitle'),
    atThreshold: t('phone.atThresholdTitle'),
    empty: t('phone.emptyTitle'),
  };
  await Notifications.scheduleNotificationAsync({
    content: content({
      title: titles[warning.level],
      body: bodies[warning.level],
    }),
    trigger: null,
  });
}
