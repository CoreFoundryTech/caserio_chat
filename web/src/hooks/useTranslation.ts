import { useLocaleStore } from '../stores/useLocaleStore';

export function useTranslation() {
    const { t, locale, setLocale } = useLocaleStore();
    return { t, locale, setLocale };
}
