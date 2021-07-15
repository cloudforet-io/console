import dayjs from 'dayjs';
import { store } from '@/store';
import { loadFonts } from '@/styles/fonts';
import { i18n } from '@/translations';
import { dayjsLanguageMap, dayjsLocales, supportedLocales } from '@/lib/site-initializer/dayjs';


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
