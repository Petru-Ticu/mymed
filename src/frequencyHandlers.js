import { parseInventoryAmount, parseInventoryThreshold } from './inventoryAmount';
import { parseFrequencyText, parseStoredDate } from './utils/frequencyParse';

const SLOT_PATTERN = /(\d{1,2}):([0-5]\d)\s*-\s*meds:\s*([1-9]\d?)/gi;

function pad2(value) {
  return String(value).padStart(2, '0');
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toMomentDate(value) {
  if (!value) {
    return null;
  }
  return value.toDate ? value.toDate() : value;
}

export function getFrequencyType(list) {
  const parsed = parseFrequencyText(list?.modalFrequency);
  if (parsed.type) {
    return parsed.type;
  }
  if (getTimedSlotsFromText(list?.modalFrequency).length) {
    return 'dailyXTimesADay';
  }
  return null;
}

function getTimedSlotsFromText(modalFrequency) {
  const text = String(modalFrequency || '');
  const slots = [];
  SLOT_PATTERN.lastIndex = 0;
  let match;
  let position = 0;
  while ((match = SLOT_PATTERN.exec(text))) {
    position += 1;
    slots.push({
      position,
      time: `${pad2(Number(match[1]))}:${match[2]}`,
      quantity: Number(match[3]) || 0,
    });
  }
  return slots;
}

function defaultGetTimedSlots(list) {
  const parsed = parseFrequencyText(list?.modalFrequency);
  const rendered = parsed.details?.timesAndMedsRenderedList;
  if (rendered?.length) {
    return rendered.map((slot) => ({
      position: slot.position || 0,
      time: slot.time,
      quantity: Number(slot.meds) || 0,
    }));
  }
  return getTimedSlotsFromText(list?.modalFrequency);
}

export function getListRange(list) {
  const startRaw = toMomentDate(parseStoredDate(list?.startAndEndDatesClass?.startDate));
  const endRaw = toMomentDate(parseStoredDate(list?.startAndEndDatesClass?.endDate));
  return {
    start: startRaw ? startOfDay(startRaw) : null,
    end: endRaw ? startOfDay(endRaw) : null,
  };
}

export function isDateInListRange(list, date) {
  const day = startOfDay(date);
  const { start, end } = getListRange(list);
  if (start && day < start) {
    return false;
  }
  if (end && day > end) {
    return false;
  }
  return true;
}

function combineDateAndTime(day, hhmm) {
  const [hours, minutes] = String(hhmm).split(':').map((part) => Number(part));
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes, 0, 0);
}

const frequencyHandlers = {};

export function registerFrequencyHandler(type, handler) {
  frequencyHandlers[type] = handler;
}

function resolveHandler(list) {
  const type = getFrequencyType(list);
  return type ? frequencyHandlers[type] || null : null;
}

function walkTimedOccurrences(list, now, limit, onlyFuture) {
  const handler = resolveHandler(list);
  const getSlots = handler?.getTimedSlots || defaultGetTimedSlots;
  const slots = getSlots(list);
  if (!slots.length) {
    return [];
  }
  const { start, end } = getListRange(list);
  let day = startOfDay(now);
  if (start && start > day) {
    day = start;
  }
  const last = end || addDays(day, 62);
  const found = [];
  while (day <= last && found.length < limit) {
    if (isDateInListRange(list, day)) {
      slots.forEach((slot) => {
        if (found.length >= limit || !slot.time) {
          return;
        }
        const at = combineDateAndTime(day, slot.time);
        if (onlyFuture && at <= now) {
          return;
        }
        found.push({
          listId: list.id,
          productName: list.productName,
          unit: list.unit || 'unit(s)',
          quantity: slot.quantity,
          scheduledTime: slot.time,
          position: slot.position || 0,
          at,
          list,
        });
      });
    }
    day = addDays(day, 1);
  }
  found.sort((a, b) => a.at - b.at);
  return found.slice(0, limit);
}

export function getUpcomingOccurrences(list, now = new Date(), limit = 8) {
  const handler = resolveHandler(list);
  if (handler?.getUpcomingOccurrences) {
    return handler.getUpcomingOccurrences(list, now, limit);
  }
  if (handler?.getTimedSlots || defaultGetTimedSlots(list).length) {
    return walkTimedOccurrences(list, now, limit, true);
  }
  return [];
}

export function getDueOccurrences(list, now = new Date()) {
  const handler = resolveHandler(list);
  if (handler?.getDueOccurrences) {
    return handler.getDueOccurrences(list, now);
  }
  if (!(handler?.getTimedSlots || defaultGetTimedSlots(list).length)) {
    return [];
  }
  if (!isDateInListRange(list, now)) {
    return [];
  }
  return walkTimedOccurrences(list, startOfDay(now), 48, false).filter((item) => {
    const sameDay = startOfDay(item.at).getTime() === startOfDay(now).getTime();
    return sameDay && item.at <= now;
  });
}

export function getUpcomingDoseSizes(list, now = new Date(), count = 2, asNeededStep = 1) {
  const handler = resolveHandler(list);
  if (handler?.getUpcomingDoseSizes) {
    return handler.getUpcomingDoseSizes(list, now, count, asNeededStep);
  }
  const upcoming = getUpcomingOccurrences(list, now, count);
  const sizes = upcoming.map((item) => item.quantity).filter((qty) => qty > 0);
  const slots = (handler?.getTimedSlots || defaultGetTimedSlots)(list);
  let guard = 0;
  while (sizes.length < count && guard < 20) {
    guard += 1;
    if (slots.length) {
      slots.forEach((slot) => {
        if (sizes.length < count && slot.quantity > 0) {
          sizes.push(slot.quantity);
        }
      });
    } else {
      sizes.push(asNeededStep);
    }
  }
  while (sizes.length < count) {
    sizes.push(asNeededStep);
  }
  return sizes.slice(0, count);
}

export function classifyInventory(list, now = new Date(), asNeededStep = 1) {
  const amount = parseInventoryAmount(list?.modalFrequency);
  if (amount == null) {
    return null;
  }
  const threshold = parseInventoryThreshold(list?.modalFrequency);
  const name = list.productName || 'This medicine';
  if (amount <= 0) {
    return { level: 'empty', amount, threshold, name, list };
  }
  if (threshold == null) {
    return null;
  }
  if (amount <= threshold) {
    return { level: 'atThreshold', amount, threshold, name, list };
  }
  const steps = getUpcomingDoseSizes(list, now, 2, asNeededStep);
  const afterTwo = amount - (steps[0] || 0) - (steps[1] || 0);
  if (afterTwo <= threshold) {
    return {
      level: 'approaching',
      amount,
      threshold,
      name,
      list,
      steps,
    };
  }
  return null;
}

registerFrequencyHandler('dailyXTimesADay', {
  getTimedSlots: defaultGetTimedSlots,
});

registerFrequencyHandler('asNeeded', {
  getTimedSlots: () => [],
  getUpcomingOccurrences: () => [],
  getDueOccurrences: () => [],
  getUpcomingDoseSizes: (_list, _now, count, asNeededStep) => (
    Array.from({ length: count }, () => asNeededStep || 1)
  ),
});

// Stub: wire getTimedSlots / getUpcomingOccurrences when this frequency is built.
registerFrequencyHandler('dailyEveryXHours', {
  getTimedSlots: () => [],
  getUpcomingOccurrences: () => [],
  getDueOccurrences: () => [],
  getUpcomingDoseSizes: (_list, _now, count, asNeededStep) => (
    Array.from({ length: count }, () => asNeededStep || 1)
  ),
});
