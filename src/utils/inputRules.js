import { ERRORS_WELCOME_SCREEN } from '../constants';

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
