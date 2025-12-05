import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocaleStore {
    locale: 'en' | 'es';
    translations: Record<string, any>;
    setLocale: (locale: 'en' | 'es') => void;
    t: (key: string, fallback?: string) => string;
}

export const useLocaleStore = create<LocaleStore>()(persist(
    (set, get) => ({
        locale: 'es', // Default to Spanish
        translations: {},

        setLocale: async (locale) => {
            try {
                const response = await fetch(`/locales/${locale}.json`);
                const translations = await response.json();
                set({ locale, translations });
            } catch (error) {
                console.error(`Failed to load locale ${locale}:`, error);
            }
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
