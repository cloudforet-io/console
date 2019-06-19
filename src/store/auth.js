import { api } from '@/setup/api'
import cookie from 'vue-cookie'
import Vue from 'vue';

export default {
  namespaced: true,
  state: {
    isLoggedIn: false,
    loginErrorCode: null,
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
    nextPath: state => state.nextPath,
  },
  actions: {
    async login ({ commit }, { username, password }) {
      const res = await api.post('/Auth/login', {
        user_name: username,
        password: password
      }).then (res => {
        cookie.set('sessionId', res.data.sessionId, { expires: '30m' })
        commit('login')
      }, err => {
        /*
         * TODO:: Please, create ERR_CODE chart or table to specify its msg and to map error code with msg.
         */
        const error_code = err.response.status;
        const error_msg = err.response.data.message;

        const throwableErrorMsg = JSON.stringify({
          error_code: error_code,
          error_msg: error_msg
        });
        /*
         * TODO:: Please, add each cases for error login author, if any difficulties to handle condition with its response code, Please put notice and update function.
         */
        switch(error_code) {
          case 401: {
            /*Vue.notify({
              group: 'auth',
              title: 'Wrong User name or Password ',
              type: 'g-Error',
              duration: 1000,
              speed: 100,
              text: 'Please, confirm your <b> user Name </b> or <b> Password </b>.'
            })*/
            throw new Error(throwableErrorMsg);
          }
          case 403: {
            throw new Error(throwableErrorMsg);
          }
          default: {
            throw new Error(throwableErrorMsg);
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
