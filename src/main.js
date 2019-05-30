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

// todo
// cssVars()

Vue.use(BootstrapVue)

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
