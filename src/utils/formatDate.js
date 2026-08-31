import { getLanguage } from '../i18n';

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatDayLabel(date) {
  if (!date) {
    return '';
  }
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat(getLanguage() || 'en', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(value);
  } catch (error) {
    return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
  }
}
