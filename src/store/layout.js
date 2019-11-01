export default {
    namespaced: true,
    state: {
        FNBVisible: true,
        verticalLeftWidth: 200,
    },
    mutations: {
        setFNBVisible(state, value) {
            state.FNBVisible = value;
        },
        setVerticalLeftWidth(state, value) {
            state.verticalLeftWidth = value;
        },
    },
    getters: {
        defaultFNB: state => state.FNBVisible,
        verticalLeftWidth: state => state.verticalLeftWidth,
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
