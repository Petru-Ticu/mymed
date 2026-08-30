import { ERRORS_ACCOUNT_SETTINGS, ERRORS_WELCOME_SCREEN } from '../constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[\W_]).*$/;

export function getWelcomeEmailError(email) {
  if (!email) {
    return ERRORS_WELCOME_SCREEN.emailEmpty;
  }
  if (!email.match(EMAIL_REGEX)) {
    return ERRORS_WELCOME_SCREEN.emailIncorrect;
  }
  return '';
}

export function getWelcomePasswordError(password) {
  if (!password) {
    return ERRORS_WELCOME_SCREEN.passwordEmpty;
  }
  if (password.length < 8) {
    return ERRORS_WELCOME_SCREEN.passwordNotEightCharLong;
  }
  if (!password.match(PASSWORD_REGEX)) {
    return ERRORS_WELCOME_SCREEN.passwordNotUppLetterAndSymbol;
  }
  return '';
}

export function getWelcomeConfirmPasswordError(password, confirmPassword) {
  if (!confirmPassword) {
    return ERRORS_WELCOME_SCREEN.retypePasswordEmpty;
  }
  if (password !== confirmPassword) {
    return ERRORS_WELCOME_SCREEN.passwordsDontMatch;
  }
  return '';
}

const NAME_REGEX = /^[a-zA-Z\s]+$/;

export function getRequiredNameError(value, emptyMessage) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return emptyMessage;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return emptyMessage;
  }
  return '';
}

export function parseBirthDateParts(day, month, year) {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (!d || !m || !y) {
    return null;
  }
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function getBirthDateError(day, month, year) {
  if (!day || !month || !year) {
    return ERRORS_ACCOUNT_SETTINGS.birthDateEmpty;
  }
  const date = parseBirthDateParts(day, month, year);
  if (!date) {
    return ERRORS_ACCOUNT_SETTINGS.birthDateInvalid;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date > today) {
    return ERRORS_ACCOUNT_SETTINGS.birthDateFuture;
  }
  return '';
}

export function getCurrentPasswordError(typed, storedPassword, changing) {
  if (!changing) {
    return '';
  }
  if (!typed) {
    return ERRORS_ACCOUNT_SETTINGS.currentPasswordEmpty;
  }
  if (typed !== storedPassword) {
    return ERRORS_ACCOUNT_SETTINGS.currentPasswordWrong;
  }
  return '';
}

export function getNewPasswordError(password, changing) {
  if (!changing) {
    return '';
  }
  if (!password) {
    return ERRORS_ACCOUNT_SETTINGS.newPasswordEmpty;
  }
  return getWelcomePasswordError(password);
}

export function getRetypeNewPasswordError(password, confirmPassword, changing) {
  if (!changing) {
    return '';
  }
  if (!confirmPassword) {
    return ERRORS_ACCOUNT_SETTINGS.retypeNewPasswordEmpty;
  }
  if (password !== confirmPassword) {
    return ERRORS_WELCOME_SCREEN.passwordsDontMatch;
  }
  return '';
}

export function isEmptyOrLeadingZero(value) {
  return !value || String(value).startsWith('0');
}

export function amountAtOrBelowThreshold(amount, threshold) {
  return Boolean(amount && threshold && parseInt(amount, 10) <= parseInt(threshold, 10));
}

export function amountBelowOther(amount, other) {
  return Boolean(amount && other && parseInt(amount, 10) < parseInt(other, 10));
}

export function isValidNumber(value, lower, upper) {
  const number = parseInt(value, 10);
  return !isNaN(number) && number >= lower && number <= upper;
}

export function isValidHour(hour) {
  return isValidNumber(hour, 0, 23);
}

export function isValidMinute(minute) {
  return isValidNumber(minute, 0, 59);
}

export function sortTimesList(times) {
  return [...times].sort((a, b) => {
    if (a.hour !== b.hour) {
      return parseInt(a.hour, 10) - parseInt(b.hour, 10);
    }
    return parseInt(a.minute, 10) - parseInt(b.minute, 10);
  });
}
