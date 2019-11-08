import VueCookies from 'vue-cookies';
import _ from 'lodash';
import api from '@/lib/api';

export default {
    namespaced: true,
    state: {
        id: null,
        name: null,
        description: null,
        authType: 'local',
    },
    mutations: {
        setDomainName(state, name) {
            state.name = name;
        },
        setDomainInfo(state, { id, description, authType }) {
            state.id = id;
            state.description = description;
            state.authType = authType;
        },
    },
    getters: {
        id: state => state.id,
        name: state => state.name,
        description: state => state.description,
        authType: state => state.authType,
    },
    actions: {
        parseHostname({ commit }) {
            const { hostname } = window.location;
            commit('setDomainName', hostname.split('.')[0]);
        },
        async load({ commit, dispatch, getters }) {
            dispatch('parseHostname');

            const response = await api.instance.post('/identity/domain/list', {
                name: getters.name,
            });

            if (response.data.total_count === 1) {
                const domainInfo = response.data.results[0];

                commit('setDomainInfo', {
                    id: domainInfo.domain_id,
                    description: _.get(domainInfo, 'tags.description', null),
                    authType: _.get(domainInfo, 'plugin_info.options.auth_type', 'local'),
                });

                VueCookies.set('domainInfo', {
                    id: getters.id,
                    name: getters.name,
                    description: getters.description,
                    authType: getters.authType,
                });
            } else {
                throw new Error(`Domain not found. (${window.location.hostname})`);
            }
        },
        sync({ commit, getters }) {
            if (!getters.id) {
                const domainInfo = VueCookies.get('domainInfo');
                if (domainInfo) {
                    commit('setDomainInfo', domainInfo);
                }
            }
        },
    },
};
