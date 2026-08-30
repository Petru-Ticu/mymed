// Parses Amount / Threshold out of the stored frequency string and applies a taken dose.
const AMOUNT_PATTERN = /Amount:\s*(Null|-?\d+)/i;
const THRESHOLD_PATTERN = /Threshold:\s*(Null|-?\d+)/i;

export function parseInventoryAmount(modalFrequency) {
  if (typeof modalFrequency !== 'string') {
    return null;
  }

  const match = modalFrequency.match(AMOUNT_PATTERN);
  if (!match || /^null$/i.test(match[1])) {
    return null;
  }

  const amount = parseInt(match[1], 10);
  return Number.isNaN(amount) ? null : amount;
}

export function parseInventoryThreshold(modalFrequency) {
  if (typeof modalFrequency !== 'string') {
    return null;
  }

  const match = modalFrequency.match(THRESHOLD_PATTERN);
  if (!match || /^null$/i.test(match[1])) {
    return null;
  }

  const threshold = parseInt(match[1], 10);
  return Number.isNaN(threshold) ? null : threshold;
}

export function replaceInventoryAmount(modalFrequency, nextAmount) {
  if (typeof modalFrequency !== 'string' || !AMOUNT_PATTERN.test(modalFrequency)) {
    return modalFrequency;
  }

  return modalFrequency.replace(AMOUNT_PATTERN, `Amount: ${nextAmount}`);
}

export function applyTakenDose(modalFrequency, medsTaken) {
  const amount = parseInventoryAmount(modalFrequency);
  if (amount == null) {
    return {
      modalFrequency,
      amount: null,
      depleted: false,
      belowThreshold: false,
    };
  }

  const dose = Number(medsTaken) || 0;
  const nextAmount = Math.max(0, amount - dose);
  const updatedFrequency = replaceInventoryAmount(modalFrequency, nextAmount);
  const threshold = parseInventoryThreshold(updatedFrequency);
  const depleted = nextAmount <= 0;
  const belowThreshold =
    !depleted && threshold != null && nextAmount <= threshold;

  return {
    modalFrequency: updatedFrequency,
    amount: nextAmount,
    depleted,
    belowThreshold,
  };
}
