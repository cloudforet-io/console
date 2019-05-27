<template>
  <div class="app">
    <AppHeader fixed>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand" to="#">
        <!-- <img class="navbar-brand-full" src="img/brand/logo.svg" width="89" height="25" alt="CoreUI Logo">
        <img class="navbar-brand-minimized" src="img/brand/sygnet.svg" width="30" height="30" alt="CoreUI Logo"> -->
        [LOGO]
      </b-link>
      <SidebarToggler class="d-none" display="lg" :defaultOpen="navOpen" ref="sidebarToggler" />
      <b-navbar-nav class="d-md-down-none">
        <b-nav-item class="px-3" to="/dashboard" @click="toggle(false)">Dashboard</b-nav-item>
        <b-nav-item class="px-3" to="/users" @click="toggle(true)" exact>Users</b-nav-item>
        <b-nav-item class="px-3" to="/infra-layers" @click="toggle(true)">Infra Layers</b-nav-item>
        <b-nav-item class="px-3" to="/projects" @click="toggle">Projects</b-nav-item>
        <b-nav-item class="px-3" to="/networks" @click="toggle">Networks</b-nav-item>
        <b-nav-item class="px-3" to="/assets" @click="toggle">Assets</b-nav-item>
        <b-nav-item class="px-3" to="/servers" @click="toggle">Servers</b-nav-item>
        <b-nav-item class="px-3" to="/support-center" @click="toggle">SupportCenter</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item class="d-md-down-none">
          [언어변경]
        </b-nav-item>
        <b-nav-item class="d-md-down-none">
          [더보기]
        </b-nav-item>
        <DefaultHeaderDropdownAccnt/>
      </b-navbar-nav>
    </AppHeader>
    <div class="app-body">
      <AppSidebar fixed>
        <SidebarHeader/>
        <SidebarForm/>
        <SidebarNav :navItems="this.$i18n.messages[this.$i18n.locale][this.$route.name].nav"></SidebarNav>
        <SidebarFooter/>
        <SidebarMinimizer/>
      </AppSidebar>
      <main class="main">
        <Breadcrumb :list="list"/>
        <div class="container-fluid">
          <router-view></router-view>
        </div>
      </main>
    </div>
    <TheFooter>
      <!--footer-->
      <div>
        <a href="https://coreui.io">CoreUI</a>
        <span class="ml-1">&copy; 2018 creativeLabs.</span>
      </div>
      <div class="ml-auto">
        <span class="mr-1">Powered by</span>
        <a href="https://coreui.io">CoreUI for Vue</a>
      </div>
    </TheFooter>
  </div>
</template>

<script>
import { Header as AppHeader, SidebarToggler, Sidebar as AppSidebar, SidebarFooter, SidebarForm, SidebarHeader, SidebarMinimizer, SidebarNav, Footer as TheFooter, Breadcrumb } from '@coreui/vue'
import DefaultHeaderDropdownAccnt from './DefaultHeaderDropdownAccnt'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'DefaultContainer',
  components: {
    AppHeader,
    AppSidebar,
    TheFooter,
    Breadcrumb,
    DefaultHeaderDropdownAccnt,
    SidebarForm,
    SidebarFooter,
    SidebarToggler,
    SidebarHeader,
    SidebarNav,
    SidebarMinimizer
  },
  data () {
    return {
      navOpen: false
    }
  },
  computed: {
    list () {
      return this.$route.matched.filter((route) => route.meta.label)
    },
  },
  methods: {
    toggle: function(shouldOpen) {
      if(shouldOpen != this.navOpen) {
        this.$refs.sidebarToggler.$el.click()
        this.navOpen = !this.navOpen
      }
    },
  },
  mounted() {
    if (this.$route.name === "dashboard") this.navOpen = false
    else this.navOpen = true
  },
}
</script>
