import Vue from 'vue';

import type { LocaleMessageObject } from 'vue-i18n';
import VueI18n from 'vue-i18n';


import en from '@/translations/language-pack/en.json';
import ja from '@/translations/language-pack/ja.json';
import ko from '@/translations/language-pack/ko.json';

Vue.use(VueI18n);

export const supportLanguages = ['en', 'ko', 'jp'] as const;
export type SupportLanguage = typeof supportLanguages[number];

// simple recursive remove keys with empty value
const removeEmpty = (obj: object | any): LocaleMessageObject => Object.keys(obj)
    .filter((k: string) => obj[k] !== null && obj[k] !== undefined && obj[k] !== '') // Remove undef. and null and empty.string.
    .reduce(
        (newObj, k) => (typeof obj[k] === 'object'
            ? Object.assign(newObj, { [k]: removeEmpty(obj[k]) }) // Recurse.
            : Object.assign(newObj, { [k]: obj[k] })), // Copy value.
        {},
    );

export const messages: Record<SupportLanguage, any> = {
    en: removeEmpty({ COMPONENT: en }),
    ko: removeEmpty({ COMPONENT: ko }),
    jp: removeEmpty({ COMPONENT: ja }),
};

export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages,
    silentFallbackWarn: true,
});

export class I18nConnector {
    private static _i18n: VueI18n;

    static get i18n() {
        return I18nConnector._i18n;
    }

    static set i18n(_i18n: VueI18n) {
        I18nConnector._i18n = _i18n;
    }
}
