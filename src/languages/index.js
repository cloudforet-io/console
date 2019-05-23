

import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from './locales/en'
import ko from './locales/ko'

Vue.use(VueI18n)

export default new VueI18n({
  locale: 'en',
  messages: {
    en: en,
    ko: ko
  }
})