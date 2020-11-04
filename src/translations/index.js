import Vue from 'vue';
import VueI18n from 'vue-i18n';
import axios from 'axios';


import ko from '@/translations/language-pack/ko.json';
import en from '@/translations/language-pack/en.json';
import ja from '@/translations/language-pack/ja.json';
import componentKO from '@/components/translations/language-pack/ko.json';
import componentEN from '@/components/translations/language-pack/en.json';
import componentJA from '@/components/translations/language-pack/ja.json';


Vue.use(VueI18n);

export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages: { en: { ...en, COMPONENT: componentEN }, ko: { ...ko, COMPONENT: componentKO }, jp: { ...ja, COMPONENT: componentJA } },
});
