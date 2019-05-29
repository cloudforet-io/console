<template>
  <div class="app">
    <AppHeader fixed>
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand" to="/dashboard">
        <!-- <img class="navbar-brand-full" src="img/brand/logo.svg" width="89" height="25" alt="CoreUI Logo">
        <img class="navbar-brand-minimized" src="img/brand/sygnet.svg" width="30" height="30" alt="CoreUI Logo"> -->
        [LOGO]
      </b-link>
      <SidebarToggler class="d-none" display="lg" :defaultOpen="navOpen" ref="sidebarToggler" />

      <b-navbar-nav class="d-md-down-none">
        <b-nav-item class="px-3" to="/users" exact>Users</b-nav-item>
        <b-nav-item class="px-3" to="/infra-layers" >Infra Layers</b-nav-item>
        <b-nav-item class="px-3" to="/projects" >Projects</b-nav-item>
        <b-nav-item class="px-3" to="/networks" >Networks</b-nav-item>
        <b-nav-item class="px-3" to="/assets" >Assets</b-nav-item>
        <b-nav-item class="px-3" to="/servers" >Servers</b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto">
        <LanguageDropdown/>
        <SiteMenuDropdown/>
        <DefaultHeaderDropdownAccnt/>
      </b-navbar-nav>
    </AppHeader>

    <div class="app-body">
      <DefaultSidebar />

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
import { Header as AppHeader, SidebarToggler, Footer as TheFooter, Breadcrumb } from '@coreui/vue'
import LanguageDropdown from './LanguageDropdown'
import SiteMenuDropdown from './SiteMenuDropdown'
import DefaultHeaderDropdownAccnt from './DefaultHeaderDropdownAccnt'
import DefaultSidebar from './DefaultSidebar'
import { mapState } from 'vuex'

export default {
  name: 'DefaultContainer',
  components: {
    AppHeader,
    DefaultSidebar,
    SidebarToggler,
    TheFooter,
    Breadcrumb,
    LanguageDropdown,
    SiteMenuDropdown,
    DefaultHeaderDropdownAccnt,
  },
  data () {
    return {
    }
  },
  computed: {
    list () {
      return this.$route.matched.filter((route) => route.meta.label)
    },
    ...mapState('nav', {
      navOpen: state => state.navOpen,
    }),
  },
  watch: {
    navOpen () {
      this.$refs.sidebarToggler.$el.click()
    }
  },
}
</script>
