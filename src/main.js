// import 'core-js/es6/promise'
// import 'core-js/es6/string'
// import 'core-js/es7/array'
// import cssVars from 'css-vars-ponyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import { i18n } from '@/setup/i18n'
import { api } from '@/setup/api'
import store from './store'
import dotenv from 'dotenv'
import VueCookie from 'vue-cookie'
import directive from '@/directives'
import VueInputAutowidth from 'vue-input-autowidth'
import VueAlert from '@vuejs-pt/vue-alert'
import Notifications from 'vue-notification'
import velocity      from 'velocity-animate'

// todo
// cssVars()
dotenv.config()
Vue.use(BootstrapVue)
Vue.use(VueCookie)
Vue.use(VueAlert)
Vue.use(Notifications, { velocity })
Vue.prototype.$http = api
directive(Vue)
Vue.use(VueInputAutowidth)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  api,
  store,
  components: {
    App
  },
  template: '<App/>'
})
