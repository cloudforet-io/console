import { api } from '@/setup/api'
import cookie from 'vue-cookie'

export default {
  namespaced: true,
  state: {
    isLoggedIn: false,
    nextPath: '/'
  },
  mutations: {
    login (state) {
      state.isLoggedIn = true
    },
    logout (state) {
      state.isLoggedIn = false
    },
    setNextPath (state, { nextPath }) {
      state.nextPath = nextPath
    }
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn,
    nextPath: state => state.nextPath
  },
  actions: {
    async login (context, { username, password }) {
      try {
        const res = await api.post('/auth/login', {
          user_name: username,
          password: password
        })
        cookie.set('sessionId', res.data.sessionId, { expires: '30m' })
        context.commit('login')
      } catch (e) {
        console.error(e)
      }
    },
    async logout ({ commit }) {
      await api.post('/auth/logout')
      cookie.delete('sessionId')
      commit('logout')
    },
    setNextPath ({ commit }, { nextPath }) {
      commit('setNextPath', { nextPath })
    }
  }
}
