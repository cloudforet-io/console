export default {
    namespaced: true,
    state: {
        headerHeight: 50 + 35,
    },
    mutations: {
        setHeaderHeight(state, { headerHeight }) {
            state.headerHeight = headerHeight;
        },
    },
    getters: {
        headerHeight: state => state.headerHeight,
    },
    actions: {
        setHeaderHeight({ commit }, { headerHeight }) {
            commit('setHeaderHeight', { headerHeight });
        },
    },
};
