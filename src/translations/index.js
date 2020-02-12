import Vue from 'vue';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import { en } from '@/translations/language-pack/en';
import { ko } from '@/translations/language-pack/ko';

Vue.use(VueI18n);

export const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    messages: {
        en,
        ko,
    },
});

const loadedLanguages = ['en', 'ko']; // our default language that is preloaded

function setI18nLanguage(lang) {
    i18n.locale = lang;
    axios.defaults.headers.common['Accept-Language'] = lang;
    document.querySelector('html').setAttribute('lang', lang);
    return lang;
}

export async function loadLanguageAsync(lang) {
    if (i18n.locale !== lang) {
        if (!loadedLanguages.includes(lang)) {
        // const url = `${baseURL}/${route.param}/${lang}.json`
            const msgs = await axios.get('http://webconsole-front-static.s3-website.ap-northeast-2.amazonaws.com/languages/en.json');
            i18n.setLocaleMessage(lang, msgs.data);
            // const msgs =  import(`@/translations/${lang}.json`);
            // i18n.setLocaleMessage(lang, msgs);
            loadedLanguages.push(lang);
            return setI18nLanguage(lang);
        }
        return Promise.resolve(setI18nLanguage(lang));
    }
    return Promise.resolve(lang);
}
