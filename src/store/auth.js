import { api } from '@/setup/api';

export default {
    namespaced: true,
    state: {
        isLoggedIn: false,
        loginErrorCode: null,
        nextPath: '/',
        username: '',
        token: null
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
        },
        setToken (state, { token }) {
            state.token = token;
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
        setToken ({ commit }, { token }) {
            commit('setToken', { token });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        },

        async login ({ commit }, { username, password, domainId }) {
            try {

                const res = await api.post('/identity/token/issue', {
                    'user_id': username,
                    'password': password,
                    'domain_id': domainId
                });

                commit('setUsername', { username: username });
                commit('login', { token: res.data.access_token });

                sessionStorage.setItem('token', res.data.access_token);
                sessionStorage.setItem('username', username);
                api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;

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
                /************************************************************
                 * TODO:: Please, add each cases for error login author,
                 * if any difficulties to handle condition with its response code, Please put notice and update function.
                 ************************************************************/
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
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('token');
            commit('logout');
        },
        setNextPath ({ commit }, { nextPath }) {

            commit('setNextPath', { nextPath });
        }
    }
};
