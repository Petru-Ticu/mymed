import React, { createContext, useContext, useEffect, useState } from 'react';
import en from './en';
import { LANGUAGES } from './languages';
import { localeCatalogs } from './localeMap';
import { sessionStore } from '../userStore';

const listeners = new Set();
let currentLanguage = 'en';

export function flattenMessages(obj, prefix = '') {
  const out = {};
  Object.keys(obj).forEach((key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenMessages(value, path));
    } else {
      out[path] = value;
    }
  });
  return out;
}

const englishFlat = flattenMessages(en);
const flatCatalogs = { en: englishFlat };

Object.keys(localeCatalogs).forEach((code) => {
  flatCatalogs[code] = {
    ...englishFlat,
    ...flattenMessages(localeCatalogs[code]),
  };
});

function notifyI18n() {
  listeners.forEach((listener) => listener(currentLanguage));
}

export function subscribeI18n(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLanguage() {
  return currentLanguage;
}

export function getLanguageMeta(code = currentLanguage) {
  return LANGUAGES.find((item) => item.code === code) || LANGUAGES[0];
}

export function languageCode(value) {
  if (!value) {
    return 'en';
  }
  if (typeof value === 'string') {
    return flatCatalogs[value] ? value : 'en';
  }
  return languageCode(value.code);
}

export function setLanguage(code) {
  const next = languageCode(code);
  if (next === currentLanguage) {
    return next;
  }
  currentLanguage = next;
  notifyI18n();
  return next;
}

export function interpolate(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, name) => (
    vars[name] == null ? `{${name}}` : String(vars[name])
  ));
}

export function t(key, vars) {
  const table = flatCatalogs[currentLanguage] || englishFlat;
  const template = table[key] ?? englishFlat[key] ?? key;
  return interpolate(template, vars);
}

const I18nContext = createContext(0);

export function I18nProvider({ children }) {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    setLanguage(sessionStore.selectedLanguage);
    return subscribeI18n(() => setVersion((n) => n + 1));
  }, []);
  return (
    <I18nContext.Provider value={version}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const version = useContext(I18nContext);
  return {
    t,
    language: currentLanguage,
    setLanguage,
    meta: getLanguageMeta(),
    version,
  };
}

export { LANGUAGES };
