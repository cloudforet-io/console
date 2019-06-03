import { api } from '@/setup/api'

export default {
  namespaced: true,
  state: {
    accessToken: null
  },
  mutations: {
    login (state, { accessToken }) {
      state.accessToken = accessToken
    },
    logout (state) {
      state.accessToken = null
    }
  },
  actions: {
    login ({ commit }, { username, password }) {
      // api.post('/auth/register', )
      commit('login')
    },
    logout ({ commit }) {
      commit('logout')
    }
  },
  getters: {

  }
}
