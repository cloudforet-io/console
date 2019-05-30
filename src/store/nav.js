export default {
  namespaced: true,
  state: {
    navOpen: true
  },
  mutations: {
    hideNav (state) {
      state.navOpen = false
    },
    showNav (state) {
      state.navOpen = true
    }
  },
  actions: {
    showNav ({ commit }) {
      commit('showNav')
    },
    hideNav ({ commit }) {
      commit('hideNav')
    }
  },
  getters: {

  }
}
