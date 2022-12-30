import Vue from 'vue';
import type { IVueI18n, LocaleMessageObject } from 'vue-i18n';
import VueI18n from 'vue-i18n';

import { messages } from '@spaceone/design-system';

import en from '@cloudforet/language-pack/en.json';
import ja from '@cloudforet/language-pack/ja.json';
import ko from '@cloudforet/language-pack/ko.json';

import { loadDayjsLocale } from '@/translations/vendors/dayjs';

import { loadFonts } from '@/styles/fonts';

Vue.use(VueI18n);

const componentEN = messages.en;
const componentJA = messages.jp;
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

const supportLanguages = ['en', 'ko', 'jp'] as const;
type SupportLanguage = typeof supportLanguages[number];

const loadLocaleFiles = async (lang: string) => {
    // load necessary files
    await Promise.allSettled([
        loadFonts(lang),
        loadDayjsLocale(lang),
    ]);
};

export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages: {
        en: removeEmpty({ ...en, ...componentEN }),
        ko: removeEmpty({ ...ko, ...componentKO }),
        jp: removeEmpty({ ...ja, ...componentJA }),
    },
    silentTranslationWarn: true,
    silentFallbackWarn: true,
});

export const setI18nLocale = async (_lang: string) => {
    let lang = _lang;
    if (!supportLanguages.includes(lang as SupportLanguage)) {
        console.error(`Not supported language: ${lang}`);
        lang = 'en';
    }
    await loadLocaleFiles(lang);
    i18n.locale = lang as string;
};

/** ******************* */
/** Type Declaration * */
/** ****************** */
declare module 'vue/types/vue' {
    interface Vue {
        readonly $i18n: VueI18n & IVueI18n;
        $t: typeof VueI18n.prototype.t;
        $tc: typeof VueI18n.prototype.tc;
        $te: typeof VueI18n.prototype.te;
        $d: typeof VueI18n.prototype.d;
        $n: typeof VueI18n.prototype.n;
    }
}

declare module 'vue/types/options' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ComponentOptions<V extends Vue> {
        i18n?: {
            messages?: VueI18n.LocaleMessages;
            dateTimeFormats?: VueI18n.DateTimeFormats;
            numberFormats?: VueI18n.NumberFormats;
            sharedMessages?: VueI18n.LocaleMessages;
        };
    }
}
