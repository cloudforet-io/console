import type { I18n, I18nOptions } from 'vue-i18n';
import { createI18n } from 'vue-i18n';

import en from '@/translations/language-pack/en.json';
import ja from '@/translations/language-pack/ja.json';
import ko from '@/translations/language-pack/ko.json';

export const supportLanguages = ['en', 'ko', 'ja'] as const;
export type SupportLanguage = typeof supportLanguages[number];

// simple recursive remove keys with empty value
const removeEmpty = (obj: object | any) => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

export const messages: I18nOptions['messages'] = {
    en: removeEmpty({ COMPONENT: en }),
    ko: removeEmpty({ COMPONENT: ko }),
    ja: removeEmpty({ COMPONENT: ja }),
};

export const i18n = createI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages,
    silentFallbackWarn: true,
    legacy: false,
});

export class I18nConnector {
    private static _i18n: I18n;

    static get i18n() {
        return I18nConnector._i18n;
    }

    static set i18n(_i18n: I18n) {
        I18nConnector._i18n = _i18n;
    }
}
