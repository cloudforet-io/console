 const state = {
    mbMenu: false
  }
  const mutations = {
    showMbMenu (state) {
      state.mbMenu = true
    },
    hideMbMenu (state) {
      state.mbMenu = false
    }
  }
  const actions = {
    showMbMenu (context) {
      context.commit("showMbMenu")
    },
    hideMbMenu (context) {
      context.commit("hideMbMenu")
    }
  }
  const getters = {}

  export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }