import en from '@cloudforet/language-pack/en.json';
import ja from '@cloudforet/language-pack/ja.json';
import ko from '@cloudforet/language-pack/ko.json';
import { messages } from '@spaceone/design-system';
import type { LocaleMessages } from 'vue-i18n';
import { createI18n } from 'vue-i18n';



import { loadDayjsLocale } from '@/translations/vendors/dayjs';

import { loadFonts } from '@/styles/fonts';

const componentEN = messages.en;
const componentJA = messages.ja;
const componentKO = messages.ko;

// simple recursive remove keys with empty value
// TODO: find appropriate type and refactor
const removeEmpty = (obj: any): LocaleMessages<string> => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

const supportLanguages = ['en', 'ko', 'ja'] as const;
type SupportLanguage = typeof supportLanguages[number];

const loadLocaleFiles = async (lang: string) => {
    // load necessary files
    await Promise.allSettled([
        loadFonts(lang),
        loadDayjsLocale(lang),
    ]);
};

export const i18n = createI18n({
    legacy: false,
    locale: 'en', // set locale
    // TODO: decide whether to use global instance methods (ex $t, ...)
    // allowComposition: true,
    fallbackLocale: 'en',
    messages: {
        en: removeEmpty({ ...en, ...componentEN }),
        ko: removeEmpty({ ...ko, ...componentKO }),
        ja: removeEmpty({ ...ja, ...componentJA }),
    },
    silentTranslationWarn: true,
    silentFallbackWarn: true,
});

export const setI18nLocale = async (_lang: SupportLanguage) => {
    let lang = _lang;
    if (!supportLanguages.includes(lang as SupportLanguage)) {
        console.error(`Not supported language: ${lang}`);
        lang = 'en';
    }
    await loadLocaleFiles(lang);
    i18n.global.locale.value = lang;
};
//
// /** ******************* */
// /** Type Declaration * */
// /** ****************** */
// declare module 'vue/types/vue' {
//     interface Vue {
//         readonly $i18n: VueI18n & IVueI18n;
//         $t: typeof VueI18n.prototype.t;
//         $tc: typeof VueI18n.prototype.tc;
//         $te: typeof VueI18n.prototype.te;
//         $d: typeof VueI18n.prototype.d;
//         $n: typeof VueI18n.prototype.n;
//     }
// }
//
// declare module 'vue/types/options' {
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     interface ComponentOptions<V extends Vue> {
//         i18n?: {
//             messages?: VueI18n.LocaleMessages;
//             dateTimeFormats?: VueI18n.DateTimeFormats;
//             numberFormats?: VueI18n.NumberFormats;
//             sharedMessages?: VueI18n.LocaleMessages;
//         };
//     }
// }
