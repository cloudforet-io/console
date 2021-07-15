import { store } from '@/store';
import { loadFonts } from '@/styles/fonts';
import { i18n } from '@/translations';
import dayjs from 'dayjs';

const dayjsLocales: Record<string, () => Promise<any>> = {
    en: () => import('dayjs/locale/en'),
    ko: () => import('dayjs/locale/ko'),
    ja: () => import('dayjs/locale/ja'),
};
const dayjsLanguageMap: Record<string, any> = {};
const supportedLocales = Object.keys(dayjsLocales);

export const initLanguageAndFonts = async () => {
    store.watch(state => state.user.language, async (lang) => {
        const loadPromises: Promise<any>[] = [loadFonts(lang)];
        if (supportedLocales.includes(lang) && !dayjsLanguageMap[lang]) {
            loadPromises.push(dayjsLocales[lang]());
        }
        await Promise.all(loadPromises);

        i18n.locale = lang as string;
        dayjs.locale(lang as string);
    }, { immediate: true });
};
