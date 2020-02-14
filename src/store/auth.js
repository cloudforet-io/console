import _ from 'lodash';
import VueCookies from 'vue-cookies';
import api from '@/lib/api';
import { Util } from '@/lib/global-util';

export default {
    namespaced: true,
    state: {
        nextPath: '/',
        isSignedIn: localStorage.isSignedIn === 'true',
        userId: localStorage.userId,
        userType: localStorage.userType,
        timezone: localStorage.timezone,
        language: localStorage.language,
        isLocalType: localStorage.isLocalType === 'true',
        isDomainOwner: localStorage.isDomainOwner === 'true',
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
            localStorage.isLocalType = val;
        },
        setIsDomainOwner(state, val) {
            state.isDomainOwner = val;
            localStorage.isDomainOwner = val;
        },
        signIn(state, {
            userId, userType, language, timezone,
        }) {
            state.isSignedIn = true;
            state.userId = userId;
            state.userType = userType;
            state.language = language;
            state.timezone = timezone;
            localStorage.isSignedIn = true;
        },
        signOut(state) {
            state.isSignedIn = false;
            state.userId = null;
            state.userType = null;
            state.timezone = null;
            state.language = null;
            localStorage.removeItem('userId');
            localStorage.removeItem('userType');
            localStorage.removeItem('language');
            localStorage.removeItem('timezone');
            localStorage.removeItem('isSignedIn');
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
                    const user = {
                        userId: userParam.userId,
                        userType: userParam.userType,
                        language: _.get(userInfo, 'language', 'en'),
                        timezone: _.get(userInfo, 'timezone', 'Asia/Seoul'),
                    };
                    localStorage.userId = user.userId;
                    localStorage.userType = user.userType;
                    localStorage.language = user.language;
                    localStorage.timezone = user.timezone;
                    commit('signIn', user);
                }
            } catch {
                console.error(`User select error:${userId}`);
            }
        },

        async signIn({
            dispatch, rootGetters, commit, state,
        }, credentials) {
            console.log('start');
            const response = await api.instance.post('/sign-in', {
                domain_id: rootGetters['domain/id'],
                credentials,
            });
            console.log(response);

            const userParam = {
                userId: credentials.user_id,
                userType: _.get(credentials, 'user_type', 'USER'),
            };

            commit('setIsLocalType', rootGetters['domain/authType'] === 'local');
            commit('setIsDomainOwner', userParam.userType === 'DOMAIN_OWNER');
            const url = state.isDomainOwner ? '/identity/domain-owner/get' : '/identity/user/get';

            await dispatch('getUser', {
                userParam, url,
            });
        },
        async signOut({ commit }) {
            const response = await api.instance.post('/sign-out');
            commit('signOut');
        },


        sync({
            commit, dispatch, getters,
        }) {
            if (getters.userId) return;

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
        },
    },
};
