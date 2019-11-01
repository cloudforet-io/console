import axios from 'axios';

const createAxiosInstance = (baseURL) => {
    const axiosConfig = {
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    return axios.create(axiosConfig);
};

export default {
    namespaced: true,
    state: {
        id: null,
        name: null,
        description: null,
    },
    mutations: {
        setDomainName(state, name) {
            state.name = name;
        },
        setDomainInfo(state, { id, description }) {
            state.id = id;
            state.description = description;
        },
    },
    getters: {
        id: state => state.id,
        name: state => state.name,
        description: state => state.description,
    },
    actions: {
        parseHostname({ commit }) {
            const { hostname } = window.location;
            commit('setDomainName', hostname.split('.')[0]);
        },
        async load({
            commit, dispatch, getters, rootGetters,
        }) {
            try {
                dispatch('parseHostname');
                const instance = createAxiosInstance(rootGetters.config.VUE_APP_API.URL);
                const response = await instance.post('/identity/domain/list', {
                    name: getters.name,
                });

                if (response.data.total_count === 1) {
                    const domainInfo = response.data.results[0];
                    commit('setDomainInfo', {
                        id: domainInfo.domain_id,
                        description: domainInfo.tags.description || null,
                    });
                } else {
                    console.log(`[ERROR] Domain not found. (${window.location.hostname})`);
                }
            } catch (e) {
                console.log('[ERROR] Domain load failed.');
                if (e.response.data.error) {
                    console.log(`[ERROR] ${e.response.status} ${e.response.data.error.message}`);
                } else {
                    console.log(`[ERROR] ${e.response.status} ${e.response.statusText}`);
                }
            }
        },
        sync({ commit, getters }) {
            if (!getters.id) {
                if (localStorage.domain) {
                    commit('setDomainInfo', localStorage.domain);
                }
            }
        },
    },
};
