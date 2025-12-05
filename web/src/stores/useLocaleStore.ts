import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import esTranslations from '../locales/es.json';
import enTranslations from '../locales/en.json';

const LOCALE_FILES = {
    es: esTranslations,
    en: enTranslations
};

interface LocaleStore {
    locale: 'en' | 'es';
    translations: Record<string, any>;
    setLocale: (locale: 'en' | 'es') => void;
    t: (key: string, fallback?: string) => string;
}

export const useLocaleStore = create<LocaleStore>()(persist(
    (set, get) => ({
        locale: 'es', // Default to Spanish
        translations: esTranslations, // ✅ CRITICAL: Load default translations immediately

        setLocale: (locale) => {
            const translations = LOCALE_FILES[locale];
            console.log(`%c[LOCALE] Loading ${locale}:`, 'color: #00ff00', translations);
            set({ locale, translations });
        },

        t: (key, fallback = key) => {
            const { translations } = get();
            const keys = key.split('.');
            let value: any = translations;

            for (const k of keys) {
                if (value && typeof value === 'object') {
                    value = value[k];
                } else {
                    return fallback;
                }
            }

            return typeof value === 'string' ? value : fallback;
        }
    }),
    { name: 'chat-locale' }
));
