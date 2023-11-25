import Vue from 'vue';
import VueI18n from 'vue-i18n';
import type { LocaleMessageObject } from 'vue-i18n';

import { messages } from '@spaceone/design-system';

import { loadFonts } from '@/styles/fonts';

Vue.use(VueI18n);

const componentEN = messages.en;
const componentJA = messages.ja;
const componentKO = messages.ko;

// simple recursive remove keys with empty value
const removeEmpty = (obj: any): LocaleMessageObject => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

const loadLocaleFiles = async (lang: string) => {
    // load necessary files
    await Promise.allSettled([
        loadFonts(lang),
    ]);
};

const supportLanguages = ['en', 'ko', 'ja'] as const;
type SupportLanguage = typeof supportLanguages[number];
export const setI18nLocale = async (_lang: string) => {
    let lang = _lang;
    if (!supportLanguages.includes(lang as SupportLanguage)) {
        console.error(`Not supported language: ${lang}`);
        lang = 'en';
    }
    await loadLocaleFiles(lang);
    i18n.locale = lang as string;
};

export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages: {
        en: removeEmpty({ ...componentEN }),
        ko: removeEmpty({ ...componentKO }),
        ja: removeEmpty({ ...componentJA }),
    },
    silentTranslationWarn: true,
    silentFallbackWarn: true,
});

setI18nLocale('en');
