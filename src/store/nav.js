export default {
  namespaced: true,
  state: {
    navOpen: true
  },
  mutations: {
    hideNav (state) {
      state.navOpen = false;
    },
    showNav (state) {
      state.navOpen = true;
    }
  },
  actions: {
    showNav (context) {
      context.commit('showNav')
    },
    hideNav (context) {
      context.commit('hideNav')
    },
  },
  getters: {

  }
}

// toggle: function(shouldOpen) {
//   if(shouldOpen != this.navOpen) {
//     this.$refs.sidebarToggler.$el.click()
//     this.navOpen = !this.navOpen
//   }
// },