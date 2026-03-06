import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import en from '../i18n/en';
import vi from '../i18n/vi';
import fil from '../i18n/fil';

const LANGS = { en, vi, fil };
const LANG_META = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
];

const I18nContext = createContext();

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('fruitmd_lang') || 'en');

  const changeLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem('fruitmd_lang', code);
  }, []);

  const strings = useMemo(() => LANGS[lang] || en, [lang]);

  /** Translate by key path: t('auth.login') → "Login" */
  const t = useCallback(
    (key, replacements) => {
      let val = getNestedValue(strings, key);
      if (val === undefined) val = getNestedValue(en, key); // fallback to English
      if (val === undefined) return key; // show raw key as last resort
      if (replacements && typeof val === 'string') {
        Object.entries(replacements).forEach(([k, v]) => {
          val = val.replaceAll(`{${k}}`, v);
        });
      }
      return val;
    },
    [strings],
  );

  /** Get a fruit name: fruitName('apple') → "Apple" / "Táo" / "Mansanas" */
  const fruitName = useCallback((key) => strings.fruits?.[key] || en.fruits?.[key] || key, [strings]);

  /** Get a label name: labelName('Fresh') → "Fresh" / "Tươi" / "Sariwa" */
  const labelName = useCallback((key) => strings.labels?.[key] || en.labels?.[key] || key, [strings]);

  /** Get a grade name */
  const gradeName = useCallback((key) => strings.grades?.[key] || en.grades?.[key] || key, [strings]);

  const value = useMemo(
    () => ({ lang, changeLang, t, fruitName, labelName, gradeName, langs: LANG_META }),
    [lang, changeLang, t, fruitName, labelName, gradeName],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
