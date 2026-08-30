import { noEmojis } from './text';

// Shared 1–99 sanitizer used by frequency fields and the As Needed take box.
// Empty is allowed; values outside 1–99 become '' (or a single extracted 1–9 digit).
export function sanitizeDoseCount(text) {
  const value = text == null ? '' : String(text);
  if (!noEmojis(value)) {
    return { next: null, blocked: true, invalid: false };
  }
  if (value === '') {
    return { next: '', blocked: false, invalid: false };
  }
  if (/^[1-9][0-9]?$/.test(value) && Number(value) <= 99) {
    return { next: value, blocked: false, invalid: false };
  }
  const match = value.match(/[1-9]/g);
  if (match && match.length === 1) {
    return { next: match[0], blocked: false, invalid: false };
  }
  return { next: '', blocked: false, invalid: true };
}
