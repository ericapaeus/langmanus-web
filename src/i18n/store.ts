"use client";

import { create } from 'zustand';

export type LanguageCode = 'zhs' | 'zht' | 'ja' | 'ko' | 'ru' | 'fr' | 'en';

const LOCAL_STORAGE_KEY = 'langmanus.config.language';

const getSystemLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const systemLang = navigator.language;
  const langMap: Record<string, LanguageCode> = {
    'zh-CN': 'zhs',
    'zh-TW': 'zht',
    'zh-HK': 'zht',
    'zh': 'zhs',
    'ja': 'ja',
    'ja-JP': 'ja',
    'ko': 'ko',
    'ko-KR': 'ko',
    'ru': 'ru',
    'ru-RU': 'ru',
    'fr': 'fr',
    'fr-FR': 'fr',
    'fr-CA': 'fr',
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
  };

  if (langMap[systemLang]) {
    return langMap[systemLang];
  }

  return 'en';
};

interface I18nState {
  lang: LanguageCode;
  translations: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
  setLang: (lang: LanguageCode) => void;
  setTranslations: (translations: Record<string, string>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  retry: () => void;
  initialize: (delay?: number) => void;
}

export const useI18nStore = create<I18nState>((set) => ({
  lang: 'en',
  translations: {},
  isLoading: true,
  error: null,
  retryCount: 0,
  setLang: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lang));
    }
    set({ lang });
  },
  setTranslations: (translations) => set({ translations }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  retry: () => set((state) => ({ retryCount: state.retryCount + 1, error: null })),
  initialize: () => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem(LOCAL_STORAGE_KEY);
      const lang = storedLang ? JSON.parse(storedLang) as LanguageCode : getSystemLanguage();

      set({
        lang,
        // isLoading: false,
        error: null
      });
    }
  },
}));
