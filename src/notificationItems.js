import { useEffect, useMemo, useState } from 'react';
import { classifyInventory, getDueOccurrences, getUpcomingOccurrences } from './frequencyHandlers';
import { useMedicalList } from './MedicalListContext';
import { medicationHistory, subscribeMedicationHistory } from './medicationDoseActions';

function calendarDay(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayLabel(date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

export function formatCountdown(ms) {
  if (ms <= 0) {
    return 'now';
  }
  const total = Math.floor(ms / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts = [];
  if (hours) {
    parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  }
  if (minutes || hours) {
    parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  }
  parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);
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
        title: 'Time to take your medicine',
        body: `${item.scheduledTime}  ·  ${item.productName}\nTake ${item.quantity} ${item.unit} now.`,
        hint: 'Tap here to take it or skip it.',
        countdownMs: 0,
        doseItem: doseItemFromOccurrence(item, listIndex),
      });
    });

    const upcoming = getUpcomingOccurrences(list, now, 3);
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
        body: `Next dose at ${item.scheduledTime} on ${dayLabel(item.at)}.\nTake ${item.quantity} ${item.unit}.\nIn ${formatCountdown(remaining)}.`,
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
        title: 'None left',
        body: `${warning.name} has 0 left.\nPlease add more to your inventory.`,
        hint: 'Tap to open My Meds.',
        goToMeds: true,
      });
    } else if (warning.level === 'atThreshold') {
      items.push({
        id: `low-${list.id}`,
        kind: 'low',
        needsAttention: true,
        sortKey: `3-${warning.name}`,
        title: 'Refill point reached',
        body: `${warning.name} is down to ${warning.amount}.\nYour refill point is ${warning.threshold}. Please get more.`,
        hint: 'Tap to open My Meds.',
        goToMeds: true,
      });
    } else if (warning.level === 'approaching') {
      items.push({
        id: `near-${list.id}`,
        kind: 'approaching',
        needsAttention: true,
        sortKey: `4-${warning.name}`,
        title: 'Two doses from refill',
        body: `${warning.name} has ${warning.amount} left.\nAfter two more doses you will hit your refill point of ${warning.threshold}.`,
        hint: 'Tap to open My Meds.',
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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => subscribeMedicationHistory(() => setNow(new Date())), []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const items = useMemo(
    () => getNotificationItems(medicalLists, now),
    [medicalLists, now],
  );

  return {
    items,
    now,
    soonest: getSoonestUpcoming(medicalLists, now),
    badgeCount: items.filter((item) => item.needsAttention || item.kind === 'upcoming').length,
  };
}
