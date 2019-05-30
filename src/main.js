// import 'core-js/es6/promise'
// import 'core-js/es6/string'
// import 'core-js/es7/array'
// import cssVars from 'css-vars-ponyfill'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import route from './route'
import { i18n } from '@/setup/i18n'
import { api } from '@/setup/api'
import store from './store'

// todo
// cssVars()

Vue.use(BootstrapVue)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  route,
  i18n,
  api,
  store,
  components: {
    App
  },
  template: '<App/>'
})
