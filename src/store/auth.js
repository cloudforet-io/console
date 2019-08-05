import { api } from '@/setup/api';
import cookie from 'vue-cookie';

export default {
    namespaced: true,
    state: {
        isLoggedIn: false,
        loginErrorCode: null,
        nextPath: '/',
        username: ''
    },
    mutations: {
        login (state) {
            state.isLoggedIn = true;
        },
        logout (state) {
            state.isLoggedIn = false;
        },
        setNextPath (state, { nextPath }) {
            state.nextPath = nextPath;
        },
        setUsername (state, { username }) {
            state.username = username;
        }
    },
    getters: {
        isLoggedIn: state => state.isLoggedIn,
        nextPath: state => state.nextPath
    },
    actions: {
        setUsername ({ commit }, { username }) {
            commit('setUsername', { username: username });
        },
        async login ({ commit }, { username, password }) {
            try {
                const res = await api.post('/auth/login', {
                    user_name: username,
                    password: password
                });
                cookie.set('sessionId', res.data.sessionId, { expires: '30m' });
                cookie.set('username', username, { expires: '30m' });
                commit('setUsername', { username: username });
                commit('login');
            } catch (err) {
        /*
         * TODO:: Please, create ERR_CODE charts or table to specify its msg and to map error code with msg.
         */
                const errorCode = err.response.status;
                const errorMsg = err.response.data.message;

                const throwableErrorMsg = JSON.stringify({
                    error_code: errorCode,
                    error_msg: errorMsg
                });
        /*
         * TODO:: Please, add each cases for error login author, if any difficulties to handle condition with its response code, Please put notice and update function.
         */
                switch (errorCode) {
                case 401: {
              /* Vue.notify({
                group: 'auth',
                title: 'Wrong User name or Password ',
                type: 'g-Error',
                duration: 1000,
                speed: 100,
                text: 'Please, confirm your <b> user Name </b> or <b> Password </b>.'
              }) */
                    throw new Error(throwableErrorMsg);
                }
                case 403: {
                    throw new Error(throwableErrorMsg);
                }
                default: {
                    throw new Error(throwableErrorMsg);
                }
                }
            }
        },
        async logout ({ commit }) {
            await api.post('/auth/logout');
            cookie.delete('sessionId');
            cookie.delete('username');
            commit('logout');
        },
        setNextPath ({ commit }, { nextPath }) {
            commit('setNextPath', { nextPath });
        }
    }
};
