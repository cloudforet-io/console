export default {
    namespaced: true,
    state: {
        loadingState: true
    },
    mutations: {
        setLoadingState (state, value) {
            state.loadingState = value;
        }
    },
    getters: {
        isLoading: state => state.loadingState
    },
    actions: {
        endLoading ({ commit }) {
            commit('setLoadingState', false);
        },
        startLoading ({ commit }) {
            commit('setLoadingState', true);
        }
    }
};
