import _ from 'lodash';
import VueCookies from 'vue-cookies';
import api from '@/lib/api';
import { Util } from '@/lib/global-util';

export default {
    namespaced: true,
    state: {
        nextPath: '/',
        isSignedIn: false,
        userId: null,
        timezone: null,
        language: null,
    },
    mutations: {
        nextPath(state, nextPath) {
            state.nextPath = nextPath;
        },
        setLanguage(state, language) {
            state.language = language;
        },
        setTimezone(state, timezone) {
            state.timezone = timezone;
        },
        signIn(state, { userId, language, timezone }) {
            state.isSignedIn = true;
            state.userId = userId;
            state.language = language;
            state.timezone = timezone;
        },
        signOut(state) {
            state.isSignedIn = false;
            state.userId = null;
            state.timezone = null;
            state.language = null;
        },
    },
    getters: {
        isSignedIn: state => state.isSignedIn,
        userId: state => state.userId,
        timezone: state => state.timezone,
        language: state => state.language,
        nextPath: state => state.nextPath,
    },
    actions: {
        setLanguage({ commit }, language) {
            localStorage.language = language;
            commit('setLanguage', language);
        },

        setTimezone({ commit }, timezone) {
            localStorage.timezone = timezone;
            commit('setTimezone', timezone);
        },

        async getUser({ commit, dispatch, rootGetters }, userId) {
            const response = await api.instance.post('/identity/user/get', {
                domain_id: rootGetters['domain/id'],
                user_id: userId,
            });

            const userInfo = response.data;
            commit('signIn', {
                userId: userInfo.user_id,
                language: userInfo.language,
                timezone: userInfo.timezone,
            });

            localStorage.userId = userInfo.user_id;
            localStorage.language = userInfo.language;
            localStorage.timezone = Util.methods.isEmpty(userInfo.timezone) ?  'Etc/GMT' : userInfo.timezone;
        },

        async signIn({ dispatch, rootGetters }, credentials) {
            const response = await api.instance.post('/identity/token/issue', {
                domain_id: rootGetters['domain/id'],
                credentials,
            });

            api.setAccessToken(response.data.access_token);
            /**
              * Do not proceeds if Auth type is not local
              * * */
            if (_.get(credentials, 'user_type') !== 'DOMAIN_OWNER') {
                /*if (_.get(VueCookies.get('domainInfo'), 'clientId') !== null) {

                } else*/ await dispatch('getUser', response.data.user_id);
            }
        },

        signOut({ commit }) {
            api.removeAccessToken();
            commit('signOut');
            localStorage.removeItem('userId');
            localStorage.removeItem('language');
            localStorage.removeItem('timezone');
        },

        sync({ commit, dispatch, getters }) {
            if (!getters.userId) {
                if (localStorage.userId) {
                    commit('signIn', {
                        userId: localStorage.userId,
                        language: localStorage.language,
                        timezone: localStorage.timezone,
                    });
                } else {
                    dispatch('signOut');
                }
            }
        },
    },
};
