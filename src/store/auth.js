import { getApi } from '@/setup/api';

export default {
    namespaced: true,
    state: {
        client_id: null,
        isLoggedIn: false,
        loginErrorCode: null,
        nextPath: '/',
        userId: '',
        token: null
    },
    mutations: {
        setClientId (state,  ClientId) {
            state.client_id = ClientId;
        },
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
        client_id: state => state.client_id,
        isLoggedIn: state => state.isLoggedIn,
        nextPath: state => state.nextPath
    },
    actions: {
        setUserId ({ commit }, { username }) {
            commit('setUserId', { userId: username });
        },
        setToken ({ commit }, { token }) {
            commit('setToken', { token });
            getApi().defaults.headers.common['Authorization'] = `Bearer ${token}`;
        },

        async login ({ commit }, authObj) {
            let param = {
                domain_id: sessionStorage.getItem('domainId')
            };

            if (authObj.hasOwnProperty('access_token')){
                param['credentials'] = { access_token: authObj.access_token };

            } else {
                if (authObj.hasOwnProperty('user_type')){
                    param['credentials'] = {
                        user_id: authObj.adminUserId,
                        password: authObj.password,
                        user_type: authObj.user_type
                    };
                } else {
                    param['credentials'] = {
                        user_id: authObj.userId,
                        password: authObj.password
                    };
                }
            }

            try {
                const res = await getApi().post('/identity/token/issue', param);
                commit('setUserId', { userId: authObj.userId });
                commit('login', { token: res.data.access_token });

                sessionStorage.setItem('token', res.data.access_token);
                sessionStorage.setItem('userId', authObj.userId);
                getApi().defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;

            } catch (err) {
                console.log('##!!!!!!!!!!!!!!##############', err.code);
                console.log('##!!!!!!!!!!!!!!##############', err.message);

                /*
                 * TODO:: Please, create ERR_CODE charts or table to specify its msg and to map error code with msg.
                 */
                const errorCode = err.response.status;
                const errorMsg = err.response.data.message;
                const throwableErrorMsg = JSON.stringify({
                    error_code: errorCode,
                    error_msg: errorMsg
                });
                console.log('################');
                console.log('err', err);
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
                case 500: {
                        alert('throwableErrorMsg');
                        console.log('throwableErrorMsg',throwableErrorMsg);
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
