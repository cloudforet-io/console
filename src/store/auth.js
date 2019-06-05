import { api } from '@/setup/api'
import cookie from 'vue-cookie'

export default {
  namespaced: true,
  state: {
    isLoggedIn: false
  },
  mutations: {
    login (state) {
      state.isLoggedIn = true
    },
    logout (state) {
      state.isLoggedIn = false
    }
  },
  getters: {
    isLoggedIn: state => state.isLoggedIn
  },
  actions: {
    async login ({ commit }, { username, password }) {
      const res = await api.post('/auth/login', {
        user_name: username,
        password: password
      })
      cookie.set('sessionId', res.data, { expires: '30m' })
      commit('login')
    },
    async logout ({ commit }) {
      await api.post('/auth/logout')
      cookie.delete('sessionId')
      commit('logout')
    }
  }
}
