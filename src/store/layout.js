export default {
    namespaced: true,
    state: {
        FNBVisible: true,
    },
    mutations: {
        setFNBVisible(state, value) {
            state.FNBVisible = value;
        },
    },
    getters: {
        defaultFNB: state => state.FNBVisible,
    },
    actions: {
        showDefaultFNB({ commit }) {
            commit('setFNBVisible', true);
        },
        hideDefaultFNB({ commit }) {
            commit('setFNBVisible', false);
        },
    },
};
