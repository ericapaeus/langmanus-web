"use client";

import { useEffect } from 'react';

import en from './en.json';
import fr from './fr.json';
import ja from './ja.json';
import ko from './ko.json';
import ru from './ru.json';
import { useI18nStore, type LanguageCode } from './store';
import zhs from './zhs.json';
import zht from './zht.json';

const translationsMap = {
  'zhs': zhs,
  'zht': zht,
  'ja': ja,
  'ko': ko,
  'ru': ru,
  'fr': fr,
  'en': en,
};

export const languages: { code: LanguageCode; name: string }[] = [
  { code: 'zhs', name: '简体中文' },
  { code: 'zht', name: '繁體中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ru', name: 'Русский' },
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' }
];

export const useTranslation = () => {
  const {
    lang,
    translations,
    setTranslations,
    isLoading,
    setLoading,
    error,
    setError,
    retry,
    initialize,
  } = useI18nStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const loadTranslations = () => {
      try {
        // setLoading(true);
        setError(null);
        const translations = translationsMap[lang];
        setTranslations(translations);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load translations'));
      } finally {
        setLoading(false);
      }
    };
    loadTranslations();
  }, [lang, setTranslations, setError, setLoading]);

  return {
    t: (key: string) => translations[key] ?? key,
    lang,
    isLoading,
    error,
    retry,
  };
};
