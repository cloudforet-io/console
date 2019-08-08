export default {
    namespaced: true,
    state: {
        headerList: [],
        headerGroup: {}
    },
    mutations: {
        setSubHeader (state, { headerGroup, headerList }) {
            state.headerGroup = headerGroup;
            state.headerList = headerList;
        }
    },
    getters: {
        subHeaderList: state => state.headerList,
        subHeaderGroup: state => state.headerGroup
    },
    actions: {
        setSubHeader ({ commit }, { headerGroup, headerList }) {
            commit('setSubHeader', { headerGroup, headerList });
        }
    }
};
