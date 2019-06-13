export default {
  namespaced: true,
  state: {
    openState: false, // trigger
    isShown: false
  },
  mutations: {
    setOpenState (state, openState) {
      state.openState = openState
    },
    setIsShown (state, isShown) {
      state.isShown = isShown
    }
  },
  getters: {
    isModalShown: state => state.isShown,
    openState: state => state.openState
  },
  actions: {
    openModal ({ commit }) {
      commit('setOpenState', true)
      commit('setIsShown', true)
    },
    closeModal ({ commit }) {
      commit('setOpenState', false)
    },
    modalHidden ({ commit }) {
      commit('setIsShown', false)
      commit('setOpenState', false) // in case of hidden by backdrop click
    }
  }
}
