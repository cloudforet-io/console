
import Vue from 'vue'
import Vuex from 'vuex'

import plugins from './modules/plugins'
import projects from './modules/projects'
import assets from './modules/assets'
import servers from './modules/servers'
import users from './modules/users'
import networks from './modules/networks'
import infraLayers from './modules/infraLayers'
import dashboard from './modules/dashboard'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    plugins,
    projects,
    assets,
    servers,
    users,
    networks,
    infraLayers,
    dashboard
  },
  strict: debug
 // plugins: debug ? [createLogger()] : []
})