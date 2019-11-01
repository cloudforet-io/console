export default {
    namespaced: true,
    state: {
        test: true
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
