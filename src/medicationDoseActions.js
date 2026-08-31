import { activityLog } from './userStore';
import { applyTakenDose } from './inventoryAmount';
import { parseFrequencyText, parseStoredDate } from './utils/frequencyParse';
import { t } from './i18n';
import { unitLabel } from './i18n/labels';

const LOG = '[MedicationDose]';

function nowStamp(date = new Date()) {
  return {
    date: date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + '.' + date.getMilliseconds().toString().padStart(3, '0'),
    iso: date.toISOString(),
  };
}

function clockHHMM(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function calendarDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function datesPayload(list) {
  return {
    startDate: list?.startAndEndDatesClass?.startDate || null,
    endDate: list?.startAndEndDatesClass?.endDate || null,
  };
}

export function listSnapshot(list) {
  if (!list) {
    return null;
  }
  const parsed = parseFrequencyText(list.modalFrequency);
  return {
    id: list.id,
    productName: list.productName,
    unit: list.unit,
    frequencyType: parsed.type,
    frequencyLabel: parsed.modalName,
    frequencyContents: list.modalFrequency,
    importantInfo: list.importantInfo,
    startDate: datesPayload(list).startDate,
    endDate: datesPayload(list).endDate,
    createdOn: list.createdOn,
    createdAt: list.createdAt,
  };
}

function fieldRecord(list) {
  const dates = datesPayload(list);
  return {
    productName: list.productName || '',
    unit: list.unit || '',
    frequencyType: parseFrequencyText(list.modalFrequency).type || '',
    frequencyContents: list.modalFrequency || '',
    importantInfo: list.importantInfo || '',
    startDate: dates.startDate || '',
    endDate: dates.endDate || '',
  };
}

const FIELD_LABELS = {
  productName: 'name',
  unit: 'unit',
  frequencyType: 'frequency type',
  frequencyContents: 'frequency content',
  importantInfo: 'important info',
  startDate: 'start date',
  endDate: 'end date',
};

// Plain singleton object (not a class): one JSON-friendly log for the whole app.
export const medicationHistory = {
  lists: {},
  doseEvents: [],
};

const historyListeners = new Set();
const firedScheduledKeys = new Set();

function notifyHistory() {
  historyListeners.forEach((listener) => listener(medicationHistory));
}

export function subscribeMedicationHistory(listener) {
  historyListeners.add(listener);
  return () => historyListeners.delete(listener);
}

export function resetMedicationHistory() {
  medicationHistory.lists = {};
  medicationHistory.doseEvents = [];
  firedScheduledKeys.clear();
  notifyHistory();
}

function logStore(reason) {
  // console.log(`${LOG} ${reason}`);
  // console.log(JSON.stringify(medicationHistory, null, 2));
}

export function extractTimesFromFrequency(modalFrequency) {
  const text = String(modalFrequency || '');
  const slots = [];
  const pattern = /(\d{1,2}):([0-5]\d)\s*-\s*meds:\s*([1-9]\d?)/gi;
  let match;
  let position = 0;
  while ((match = pattern.exec(text))) {
    position += 1;
    slots.push({
      position,
      time: `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`,
      meds: match[3],
    });
  }
  return slots;
}

export function isAsNeededList(list) {
  return parseFrequencyText(list?.modalFrequency).type === 'asNeeded';
}

export function isListActiveOnDate(list, date = new Date()) {
  const start = parseStoredDate(list?.startAndEndDatesClass?.startDate);
  const end = parseStoredDate(list?.startAndEndDatesClass?.endDate);
  const compare = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (start) {
    const startDay = start.toDate ? start.toDate() : start;
    const startCompare = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
    if (compare < startCompare) {
      return false;
    }
  }
  if (end) {
    const endDay = end.toDate ? end.toDate() : end;
    const endCompare = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate());
    if (compare > endCompare) {
      return false;
    }
  }
  return true;
}

// Future frequency types register here. As Needed never auto-fires a clock reminder.
const frequencyDueHandlers = {
  asNeeded: () => [],
  dailyXTimesADay: (list, listIndex, now) => {
    const parsed = parseFrequencyText(list.modalFrequency);
    const slots = (parsed.details?.timesAndMedsRenderedList?.length
      ? parsed.details.timesAndMedsRenderedList
      : extractTimesFromFrequency(list.modalFrequency));
    const hhmm = clockHHMM(now);
    return slots
      .filter((slot) => slot.time === hhmm)
      .map((slot) => ({
        key: `${calendarDay(now)}|${list.id}|${slot.time}|${slot.position || 0}`,
        listId: list.id,
        listIndex,
        productName: list.productName,
        unit: list.unit || '',
        quantity: Number(slot.meds) || 0,
        scheduledTime: slot.time,
        frequencyType: parsed.type,
        list,
      }));
  },
};

export function registerFrequencyDueHandler(type, handler) {
  frequencyDueHandlers[type] = handler;
}

export function collectDueDoses(lists, now = new Date()) {
  const due = [];
  (lists || []).forEach((list, listIndex) => {
    if (!isListActiveOnDate(list, now)) {
      return;
    }
    let type = parseFrequencyText(list.modalFrequency).type;
    if (!type && extractTimesFromFrequency(list.modalFrequency).length) {
      type = 'dailyXTimesADay';
    }
    const handler = type ? frequencyDueHandlers[type] : null;
    if (!handler) {
      return;
    }
    const items = handler(list, listIndex, now);
    items.forEach((item) => {
      if (!firedScheduledKeys.has(item.key)) {
        due.push(item);
      }
    });
  });
  return due;
}

export function markScheduledFired(key) {
  firedScheduledKeys.add(key);
}

export function recordListUpdates(previousLists, nextLists) {
  const prev = previousLists || [];
  const next = nextLists || [];
  const prevById = new Map(prev.filter((list) => list?.id != null).map((list) => [list.id, list]));
  const nextById = new Map(next.filter((list) => list?.id != null).map((list) => [list.id, list]));
  let changed = false;

  nextById.forEach((list, id) => {
    if (!prevById.has(id)) {
      medicationHistory.lists[id] = {
        snapshot: listSnapshot(list),
        created: nowStamp(),
        fieldChanges: [],
      };
      changed = true;
      activityLog.record('medication.created', { id, productName: list.productName });
      // console.log(`${LOG} list created`, listSnapshot(list));
      return;
    }
    const before = fieldRecord(prevById.get(id));
    const after = fieldRecord(list);
    Object.keys(FIELD_LABELS).forEach((field) => {
      if (before[field] === after[field]) {
        return;
      }
      if (!medicationHistory.lists[id]) {
        medicationHistory.lists[id] = {
          snapshot: listSnapshot(list),
          created: { date: list.createdOn, time: list.createdAt, iso: null },
          fieldChanges: [],
        };
      }
      medicationHistory.lists[id].fieldChanges.push({
        field,
        label: FIELD_LABELS[field],
        from: before[field],
        to: after[field],
        at: nowStamp(),
      });
      medicationHistory.lists[id].snapshot = listSnapshot(list);
      changed = true;
      activityLog.record('medication.fieldChanged', {
        id,
        field: FIELD_LABELS[field],
        from: before[field],
        to: after[field],
      });
      // console.log(`${LOG} list field changed`, {
      //   id,
      //   field: FIELD_LABELS[field],
      //   from: before[field],
      //   to: after[field],
      // });
    });
  });

  prevById.forEach((_list, id) => {
    if (!nextById.has(id) && medicationHistory.lists[id]) {
      medicationHistory.lists[id].deletedAt = nowStamp();
      changed = true;
      activityLog.record('medication.deleted', { id });
      // console.log(`${LOG} list deleted`, { id });
    }
  });

  if (changed) {
    notifyHistory();
    logStore('store after list update');
  }
}

function recordDoseEvent(event) {
  medicationHistory.doseEvents.push(event);
  const listId = event.listId;
  if (listId != null && medicationHistory.lists[listId]) {
    medicationHistory.lists[listId].snapshot = listSnapshot(event.listAfter || event.listBefore);
  }
  // console.log(`${LOG} dose action`, event);
  activityLog.record('dose.' + event.kind, {
    listId: event.listId,
    productName: event.productName,
    quantity: event.quantity,
  });
  logStore('store after dose action');
  notifyHistory();
}

export function applyScheduledAnswer(lists, item, tookIt) {
  const index = lists.findIndex((list) => list.id === item.listId);
  const list = index >= 0 ? lists[index] : item.list;
  const stamp = nowStamp();
  let nextLists = lists;
  let inventory = { depleted: false, belowThreshold: false, amount: null };

  if (tookIt && index >= 0) {
    inventory = applyTakenDose(list.modalFrequency, item.quantity);
    nextLists = lists.map((entry, i) => (
      i === index ? { ...entry, modalFrequency: inventory.modalFrequency } : entry
    ));
  }

  recordDoseEvent({
    kind: tookIt ? 'scheduledTaken' : 'scheduledSkipped',
    listId: item.listId,
    productName: item.productName,
    unit: item.unit,
    quantity: item.quantity,
    scheduledTime: item.scheduledTime,
    answeredAt: stamp,
    day: calendarDay(),
    listBefore: listSnapshot(list),
    listAfter: listSnapshot(nextLists[index] || list),
  });

  return {
    nextLists,
    productName: item.productName,
    depleted: tookIt && inventory.depleted,
    belowThreshold: tookIt && inventory.belowThreshold,
  };
}

export function applyAsNeededTake(lists, list, quantity) {
  const index = lists.findIndex((entry) => entry.id === list.id);
  if (index < 0) {
    return { nextLists: lists, depleted: false, belowThreshold: false };
  }
  const inventory = applyTakenDose(lists[index].modalFrequency, quantity);
  const nextLists = lists.map((entry, i) => (
    i === index ? { ...entry, modalFrequency: inventory.modalFrequency } : entry
  ));
  const stamp = nowStamp();
  recordDoseEvent({
    kind: 'asNeededTaken',
    listId: list.id,
    productName: list.productName,
    unit: list.unit,
    quantity: Number(quantity) || 0,
    scheduledTime: null,
    answeredAt: stamp,
    day: calendarDay(),
    listBefore: listSnapshot(list),
    listAfter: listSnapshot(nextLists[index]),
  });
  return {
    nextLists,
    productName: list.productName,
    depleted: inventory.depleted,
    belowThreshold: inventory.belowThreshold,
  };
}

export function getTodayDoseSummary() {
  const day = calendarDay();
  const today = medicationHistory.doseEvents.filter((event) => event.day === day);
  return {
    taken: today.filter((event) => event.kind === 'scheduledTaken' || event.kind === 'asNeededTaken').length,
    skipped: today.filter((event) => event.kind === 'scheduledSkipped').length,
    events: today,
  };
}

export function getRecentDoseEvents(limit = 20) {
  return medicationHistory.doseEvents.slice(-limit).reverse();
}

function eventDateLabel(event) {
  if (event.day && /^\d{4}-\d{2}-\d{2}$/.test(event.day)) {
    const [year, month, day] = event.day.split('-');
    return `${day}/${month}/${year}`;
  }
  return '';
}

export function formatDoseSentence(event) {
  const unit = unitLabel(event.unit || 'unit(s)');
  const when = event.answeredAt?.time ? event.answeredAt.time.slice(0, 5) : '';
  const date = eventDateLabel(event);
  const datePart = date ? t('dose.onDate', { date }) : '';
  if (event.kind === 'scheduledSkipped') {
    return t('dose.skippedSentence', { name: event.productName, time: event.scheduledTime, datePart });
  }
  if (event.kind === 'asNeededTaken') {
    return t('dose.takenAsNeededSentence', {
      quantity: event.quantity,
      unit,
      name: event.productName,
      when,
      datePart,
    });
  }
  return t('dose.takenSentence', {
    quantity: event.quantity,
    unit,
    name: event.productName,
    time: event.scheduledTime,
    datePart,
  });
}
