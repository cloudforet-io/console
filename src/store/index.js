
import Vue from 'vue'
import Vuex from 'vuex'

import nav from './nav'
import auth from './auth'

Vue.use(Vuex)

// eslint-disable-next-line no-undef
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    auth,
    nav
  },
  strict: debug
  // plugins: debug ? [createLogger()] : []
})
