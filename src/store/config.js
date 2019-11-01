import axios from 'axios';

const AXIOS_CONFIG = {
    baseURL: '/config',
    headers: {
        'Cache-Control': 'no-cache',
    },
};

export default {
    state: {
        isLoaded: false,
        config: {},
    },
    mutations: {
        updateConfigState(state) {
            state.isLoaded = true;
        },
        setConfig(state, newConfig) {
            state.config = { ...state.config, ...newConfig };
        },
    },
    getters: {
        isConfigLoaded: state => state.isLoaded,
        config: state => state.config,
    },
    actions: {
        async getConfig({ commit }, url) {
            try {
                const instance = axios.create(AXIOS_CONFIG);
                const response = await instance.get(url);
                commit('setConfig', response.data);
            } catch (e) {}
        },
        async loadConfig({ commit, dispatch, getters }) {
            if (!getters.isConfigLoaded) {
                await dispatch('getConfig', '/default.json');
                await dispatch('getConfig', `/${process.env.NODE_ENV}.json`);
                commit('updateConfigState');
            }
        },
    },
};
