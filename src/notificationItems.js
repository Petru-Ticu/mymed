import { useEffect, useMemo, useState } from 'react';
import { classifyInventory, getDueOccurrences, getInboxUpcomingOccurrences, getUpcomingOccurrences } from './frequencyHandlers';
import { useMedicalList } from './MedicalListContext';
import { medicationHistory, subscribeMedicationHistory } from './medicationDoseActions';
import { t, useI18n } from './i18n';
import { unitLabel } from './i18n/labels';

function calendarDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayLabel(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export function formatCountdown(ms) {
  if (ms <= 0) {
    return t('notifications.now');
  }
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts = [];
  if (hours) {
    parts.push(hours === 1 ? t('notifications.hour', { count: hours }) : t('notifications.hours', { count: hours }));
  }
  if (minutes || hours) {
    parts.push(minutes === 1 ? t('notifications.minute', { count: minutes }) : t('notifications.minutes', { count: minutes }));
  }
  parts.push(seconds === 1 ? t('notifications.second', { count: seconds }) : t('notifications.seconds', { count: seconds }));
  return parts.join(', ');
}

export function lastAsNeededStep(listId) {
  const events = medicationHistory.doseEvents || [];
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.listId === listId && event.kind === 'asNeededTaken' && Number(event.quantity) > 0) {
      return Number(event.quantity);
    }
  }
  return 1;
}

function eventMatchesSlot(event, listId, time, day) {
  return (
    event.listId === listId
    && event.day === day
    && event.scheduledTime === time
    && (event.kind === 'scheduledTaken' || event.kind === 'scheduledSkipped')
  );
}

function doseItemFromOccurrence(item, listIndex) {
  const day = calendarDay(item.at);
  return {
    key: `${day}|${item.listId}|${item.scheduledTime}|${item.position || 0}`,
    listId: item.listId,
    listIndex,
    productName: item.productName,
    unit: item.unit,
    quantity: item.quantity,
    scheduledTime: item.scheduledTime,
    list: item.list,
  };
}

export function getNotificationItems(lists, now = new Date()) {
  const day = calendarDay(now);
  const events = medicationHistory.doseEvents || [];
  const items = [];

  (lists || []).forEach((list, listIndex) => {
    if (!list?.id) {
      return;
    }
    const asNeededStep = lastAsNeededStep(list.id);
    const due = getDueOccurrences(list, now);
    due.forEach((item) => {
      if (events.find((event) => eventMatchesSlot(event, list.id, item.scheduledTime, day))) {
        return;
      }
      items.push({
        id: `due-${list.id}-${item.scheduledTime}-${item.position || 0}`,
        kind: 'due',
        needsAttention: true,
        sortKey: `0-${item.at.toISOString()}`,
        title: t('notifications.dueTitle'),
        body: t('notifications.dueBody', {
          time: item.scheduledTime,
          name: item.productName,
          quantity: item.quantity,
          unit: unitLabel(item.unit),
        }),
        hint: t('notifications.dueHint'),
        countdownMs: 0,
        doseItem: doseItemFromOccurrence(item, listIndex),
      });
    });

    const upcoming = getInboxUpcomingOccurrences(list, now);
    upcoming.forEach((item) => {
      const remaining = item.at.getTime() - now.getTime();
      if (remaining <= 0) {
        return;
      }
      items.push({
        id: `up-${list.id}-${item.at.toISOString()}`,
        kind: 'upcoming',
        needsAttention: remaining <= 15 * 60 * 1000,
        sortKey: `1-${item.at.toISOString()}`,
        title: item.productName,
        body: t('notifications.upcomingBody', {
          time: item.scheduledTime,
          date: dayLabel(item.at),
          quantity: item.quantity,
          unit: unitLabel(item.unit),
          countdown: formatCountdown(remaining),
        }),
        countdownMs: remaining,
        occurrence: item,
      });
    });

    const warning = classifyInventory(list, now, asNeededStep);
    if (!warning) {
      return;
    }
    if (warning.level === 'empty') {
      items.push({
        id: `empty-${list.id}`,
        kind: 'empty',
        needsAttention: true,
        sortKey: `2-${warning.name}`,
        title: t('notifications.emptyTitle'),
        body: t('notifications.emptyBody', { name: warning.name }),
        hint: t('notifications.openMedsHint'),
        goToMeds: true,
      });
    } else if (warning.level === 'atThreshold') {
      items.push({
        id: `low-${list.id}`,
        kind: 'low',
        needsAttention: true,
        sortKey: `3-${warning.name}`,
        title: t('notifications.lowTitle'),
        body: t('notifications.lowBody', {
          name: warning.name,
          amount: warning.amount,
          threshold: warning.threshold,
        }),
        hint: t('notifications.openMedsHint'),
        goToMeds: true,
      });
    } else if (warning.level === 'approaching') {
      items.push({
        id: `near-${list.id}`,
        kind: 'approaching',
        needsAttention: true,
        sortKey: `4-${warning.name}`,
        title: t('notifications.approachingTitle'),
        body: t('notifications.approachingBody', {
          name: warning.name,
          amount: warning.amount,
          threshold: warning.threshold,
        }),
        hint: t('notifications.openMedsHint'),
        goToMeds: true,
      });
    }
  });

  items.sort((a, b) => {
    if (a.sortKey < b.sortKey) {
      return -1;
    }
    if (a.sortKey > b.sortKey) {
      return 1;
    }
    return 0;
  });
  return items;
}

export function getSoonestUpcoming(lists, now = new Date()) {
  let soonest = null;
  (lists || []).forEach((list) => {
    getUpcomingOccurrences(list, now, 1).forEach((item) => {
      if (!soonest || item.at < soonest.at) {
        soonest = item;
      }
    });
  });
  return soonest;
}

export function useNotificationItems() {
  const { medicalLists } = useMedicalList();
  const { language } = useI18n();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => subscribeMedicationHistory(() => setNow(new Date())), []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const items = useMemo(
    () => getNotificationItems(medicalLists, now),
    [medicalLists, now, language],
  );

  return {
    items,
    now,
    soonest: getSoonestUpcoming(medicalLists, now),
    badgeCount: items.filter((item) => item.needsAttention || item.kind === 'upcoming').length,
  };
}
