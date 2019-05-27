
import Vue from 'vue'
import Vuex from 'vuex'

import nav from './nav'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    nav,
  },
  strict: debug
 // plugins: debug ? [createLogger()] : []
})