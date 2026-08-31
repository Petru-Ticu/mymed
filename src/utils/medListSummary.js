import { getDueOccurrences, getUpcomingOccurrences } from '../frequencyHandlers';
import { isAsNeededList } from '../medicationDoseActions';
import { parseInventoryAmount } from '../inventoryAmount';

export function getMedListSummary(list, now = new Date()) {
  const asNeeded = isAsNeededList(list);
  const due = asNeeded ? [] : getDueOccurrences(list, now);
  const next = asNeeded ? [] : getUpcomingOccurrences(list, now, 1);
  const occurrence = due[0] || next[0];
  return {
    asNeeded,
    due: Boolean(due[0]),
    time: occurrence?.scheduledTime || '',
    quantity: occurrence?.quantity,
    unit: list?.unit || '',
    amount: parseInventoryAmount(list?.modalFrequency),
  };
}
