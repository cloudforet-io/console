import { api } from '@/setup/api';

export default {
    namespaced: true,
    state: {
        isLoggedIn: false,
        loginErrorCode: null,
        nextPath: '/',
        userId: '',
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
        setUserId (state, { userId }) {
            state.userId = userId;
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
        setUserId ({ commit }, { username }) {
            commit('setUserId', { userId: username });
        },

        setToken ({ commit }, { token }) {
            commit('setToken', { token });
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        },

        async login ({ commit }, { userId, password, domainId }) {
            try {

                const res = await api.post('/identity/token/issue', {
                    credentials:{
                        // access_token: 'ya29.Glt0B1F9aOXkZLqKgjBGuMPKeDpinR7YW1s24YZFDKHzucw5t0KqNIb-COixm7kiSr9yqbw0FzD5xfvkJ8PrnZkrKDn6sJwW5llXAmqDID08aRkRektABovXWBHO'
                        'user_id': userId,
                        'password': password
                    },
                    'domain_id': domainId
                    // 'domain_id': 'domain-2fba0c6a4a94'
                });

                commit('setUserId', { userId: userId });
                commit('login', { token: res.data.access_token });

                sessionStorage.setItem('token', res.data.access_token);
                sessionStorage.setItem('userId', userId);
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
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('token');
            commit('logout');
        },
        setNextPath ({ commit }, { nextPath }) {

            commit('setNextPath', { nextPath });
        }
    }
};
