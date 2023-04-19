export const dayjsLocales: Record<string, () => Promise<any>> = {
    en: () => import('dayjs/locale/en'),
    ko: () => import('dayjs/locale/ko'),
    ja: () => import('dayjs/locale/ja'),
};

const cachedDayjsLocales: Record<string, boolean> = {};

export const loadDayjsLocale = async (lang: string): Promise<void> => {
    if (!cachedDayjsLocales[lang] && dayjsLocales[lang]) {
        await dayjsLocales[lang]();
        cachedDayjsLocales[lang] = true;
    }

    return Promise.resolve();
};
