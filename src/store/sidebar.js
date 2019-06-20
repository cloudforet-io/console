export default {
  namespaced: true,
  state: {
    openState: true
  },
  mutations: {
    setSidebarState (state, val) {
      state.openState = val
    }
  },
  getters: {
    isSidebarOpen: state => state.openState
  },
  actions: {
    showSidebar ({ commit }) {
      commit('setSidebarState', true)
    },
    hideSidebar ({ commit }) {
      commit('setSidebarState', false)
    }
  }
}
