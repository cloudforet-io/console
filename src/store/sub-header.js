export default {
  namespaced: true,
  state: {
    navList: []
  },
  mutations: {
    setNavList (state, arr) {
      state.navList = arr;
    }
  },
  getters: {
    subHeaderList: state => state.navList
  },
  actions: {
    setNavList ({ commit }, arr) {
      commit('setNavList', arr);
    }
  }
}
