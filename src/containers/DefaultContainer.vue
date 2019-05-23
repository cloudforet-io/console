<template>
  <div class="app">
    <AppHeader fixed>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand" to="#">
        <!-- <img class="navbar-brand-full" src="img/brand/logo.svg" width="89" height="25" alt="CoreUI Logo">
        <img class="navbar-brand-minimized" src="img/brand/sygnet.svg" width="30" height="30" alt="CoreUI Logo"> -->
        [LOGO]
      </b-link>
      <SidebarToggler class="d-md-down-none" display="lg" />
      <b-navbar-nav class="d-md-down-none">
        <b-nav-item class="px-3" to="/dashboard">Dashboard</b-nav-item>
        <b-nav-item class="px-3" to="/users" exact>Users</b-nav-item>
        <b-nav-item class="px-3" to="/infra-layers">Infra Layers</b-nav-item>
        <b-nav-item class="px-3" to="/projects">Projects</b-nav-item>
        <b-nav-item class="px-3" to="/networks">Networks</b-nav-item>
        <b-nav-item class="px-3" to="/assets">Assets</b-nav-item>
        <b-nav-item class="px-3" to="/servers">Servers</b-nav-item>
        <b-nav-item class="px-3" to="/support-center">SupportCenter</b-nav-item>
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
        <SidebarNav v-if="$route.name === 'InfraLayers'" :navItems="infraLayersNav"></SidebarNav>
        <SidebarNav  v-else-if="$route.name === 'Dashboard'" :navItems="dashboardNav"></SidebarNav>
        <SidebarNav  v-else-if="$route.name === 'Users'" :navItems="usersNav"></SidebarNav>
        <SidebarNav  v-else-if="$route.name === 'Projects'" :navItems="projectsNav"></SidebarNav>
        <SidebarNav  v-else-if="$route.name === 'Networks'" :navItems="networksNav"></SidebarNav>
        <SidebarNav  v-else-if="$route.name === 'Servers'" :navItems="serversNav"></SidebarNav>
        <SidebarNav  v-else-if="$route.name === 'Plugins'" :navItems="pluginsNav"></SidebarNav>
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
    }
  },
  computed: {
    list () {
      return this.$route.matched.filter((route) => route.name || route.meta.label)
    },
    ...mapState("dashboard", {
      dashboardNav: state => state.nav,
    }),
    ...mapState("infraLayers", {
      infraLayersNav: state => state.nav,
    }),
    ...mapState("projects", {
      projectsNav: state => state.nav,
    }),
    ...mapState("networks", {
      networksNav: state => state.nav,
    }),
    ...mapState("assets", {
      assetsNav: state => state.nav,
    }),
    ...mapState("servers", {
      serversNav: state => state.nav,
    }),
    ...mapState("plugins", {
      pluginsNav: state => state.nav,
    }),
    ...mapState("users", {
      usersNav: state => state.nav,
    }),
  },
}
</script>
