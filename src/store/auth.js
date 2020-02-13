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
        userType: null,
        timezone: null,
        language: null,
        isLocalType: true,
        isDomainOwner: false,
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
        setIsLocalType(state, val) {
            state.isLocalType = val;
        },
        setIsDomainOwner(state, val) {
            state.isDomainOwner = val;
        },
        signIn(state, {
            userId, userType, language, timezone,
        }) {
            state.isSignedIn = true;
            state.userId = userId;
            state.userType = userType;
            state.language = language;
            state.timezone = timezone;
        },
        signOut(state) {
            state.isSignedIn = false;
            state.userId = null;
            state.userType = null;
            state.timezone = null;
            state.language = null;
        },
    },
    getters: {
        isSignedIn: state => state.isSignedIn,
        userId: state => state.userId,
        userType: state => state.userType,
        timezone: state => state.timezone,
        language: state => state.language,
        nextPath: state => state.nextPath,
        isLocalType: state => state.isLocalType,
        isDomainOwner: state => state.isDomainOwner,
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
        async getUser({
            commit, dispatch, rootGetters, state,
        }, { userParam, url }) {
            try {
                const response = await api.instance.post(url, {
                    domain_id: rootGetters['domain/id'],
                    [state.isDomainOwner ? 'owner_id' : 'user_id']: userParam.userId,
                    // eslint-disable-next-line camelcase
                    user_type: userParam.userType,
                });
                const userInfo = _.get(response, 'data', null);

                if (userInfo) {
                    commit('signIn', {
                        userId: userParam.userId,
                        userType: userParam.userType,
                        language: _.get(userInfo, 'language', 'en'),
                        timezone: _.get(userInfo, 'timezone', 'Asia/Seoul'),
                    });

                    localStorage.userId = userParam.userId;
                    localStorage.userType = userParam.userType;
                    localStorage.language = _.get(userInfo, 'language', 'en');
                    localStorage.timezone = _.get(userInfo, 'timezone', 'UTC');
                }
            } catch {
                console.error(`User select error:${userId}`);
            }
        },

        async signIn({
            dispatch, rootGetters, commit, state,
        }, credentials) {
            const response = await api.instance.post('/identity/token/issue', {
                domain_id: rootGetters['domain/id'],
                credentials,
            });

            api.setAccessToken(response.data.access_token);

            const userParam = {
                userId: response.data.user_id,
                userType: _.get(credentials, 'user_type', 'USER'),
            };

            commit('setIsLocalType', rootGetters['domain/authType'] === 'local');
            commit('setIsDomainOwner', userParam.userType === 'DOMAIN_OWNER');

            const url = state.isDomainOwner ? '/identity/domain-owner/get' : '/identity/user/get';

            await dispatch('getUser', {
                userParam, url,
            });
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
                        userType: localStorage.userType,
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
