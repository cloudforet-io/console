
import Vue from 'vue'
import Vuex from 'vuex'

import auth from './auth'
import sidebar from './sidebar'
import modal from './modal'

Vue.use(Vuex)
// eslint-disable-next-line no-undef
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    auth,
    sidebar,
    modal
  },
  strict: debug
  // plugins: debug ? [createLogger()] : []
})
