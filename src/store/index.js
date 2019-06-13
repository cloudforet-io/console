
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import nav from './nav'
import modal from './modal'

Vue.use(Vuex)

// eslint-disable-next-line no-undef
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    auth,
    nav,
    modal
  },
  strict: debug
  // plugins: debug ? [createLogger()] : []
})
