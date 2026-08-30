import { Platform } from 'react-native';
import { colors } from './theme/colors';
import { getUpcomingOccurrences } from './frequencyHandlers';

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
      name: 'Medicine reminders',
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
          title: 'Take your medicine in 1 minute',
          body: `In 1 minute, take ${item.quantity} ${item.unit} of ${item.productName}.`,
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
    approaching: `${warning.name} is two doses away from your refill point (${warning.threshold} left). You have ${warning.amount} now. Get more soon.`,
    atThreshold: `${warning.name} is at your refill point (${warning.amount} left). Please get more.`,
    empty: `${warning.name} has none left. Add more to your inventory.`,
  };
  const titles = {
    approaching: 'Your medicine is getting low',
    atThreshold: 'Time to refill your medicine',
    empty: 'Your medicine is empty',
  };
  await Notifications.scheduleNotificationAsync({
    content: content({
      title: titles[warning.level],
      body: bodies[warning.level],
    }),
    trigger: null,
  });
}
