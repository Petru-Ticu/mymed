import { Platform } from 'react-native';
import { colors } from './theme/colors';
import { getUpcomingOccurrences } from './frequencyHandlers';
import { t } from './i18n';
import { unitLabel } from './i18n/labels';
import { sessionStore } from './userStore';
import { runningInExpoGo } from './utils/runtime';

const ANDROID_CHANNEL = 'medicine-reminders';
const skipNativeNotifications = runningInExpoGo();

let Notifications = null;
let loadAttempted = false;
let permissionAsked = false;

function loadNotifications() {
  if (skipNativeNotifications || loadAttempted) {
    return Notifications;
  }
  loadAttempted = true;
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler?.({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch {
    Notifications = null;
  }
  return Notifications;
}

function dateTrigger(date) {
  const types = Notifications?.SchedulableTriggerInputTypes;
  if (types?.DATE) {
    return { type: types.DATE, date };
  }
  return date;
}

async function ensureReady() {
  const module = loadNotifications();
  if (!module) {
    return false;
  }
  try {
    if (Platform.OS === 'android' && module.setNotificationChannelAsync) {
      await module.setNotificationChannelAsync(ANDROID_CHANNEL, {
        name: t('phone.channelName'),
        importance: module.AndroidImportance?.HIGH ?? 4,
        color: colors.accent,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: colors.accent,
      });
    }
    if (!permissionAsked) {
      permissionAsked = true;
      const current = await module.getPermissionsAsync();
      if (current.status !== 'granted') {
        await module.requestPermissionsAsync();
      }
    }
    const finalStatus = await module.getPermissionsAsync();
    return finalStatus.status === 'granted';
  } catch {
    return false;
  }
}

function content({ title, body }) {
  return {
    title,
    body,
    sound: true,
    color: colors.accent,
    data: { source: 'mymed' },
    ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL } : {}),
  };
}

export async function syncScheduledDoseAlerts(lists, now = new Date()) {
  try {
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
          trigger: dateTrigger(oneMinuteBefore),
        });
      }
    }
  } catch {
    // In-app DoseReminderHost still shows reminders when OS alerts are unavailable.
  }
}

export async function notifyInventoryOnPhone(warning) {
  try {
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
  } catch {
    // Same as above: skip OS notification, keep in-app alerts.
  }
}
