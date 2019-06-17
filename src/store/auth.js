import { api } from '@/setup/api'
import cookie from 'vue-cookie'
import Vue from 'vue';

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
    async login ({ commit }, { username, password }) {
      const res = await api.post('/auth/login', {
        user_name: username,
        password: password
      }).then (res => {
        cookie.set('sessionId', res.data.sessionId, { expires: '30m' })
        commit('login')
      }, err => {
        const error_code = err.response.status;
        switch(error_code) {
          case 401: {
            Vue.notify({
              group: 'auth',
              title: 'Wrong User name or Password ',
              type: 'g-Error',
              duration: 1000,
              speed: 100,
              text: 'Please, confirm your <b> user Name </b> or <b> Password </b>.'
            })
            break;
          }
          case 403: {
            break;
          }
          default: {
            break;
          }
        }
      })
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
