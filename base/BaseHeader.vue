<template>
  <AppHeader fixed>
    <SidebarToggler class="d-lg-none" display="md" mobile />
    <b-link class="navbar-brand" to="/dashboard">
      <!-- <img class="navbar-brand-full" src="img/brand/logo.svg" width="89" height="25" alt="CoreUI Logo">
      <img class="navbar-brand-minimized" src="img/brand/sygnet.svg" width="30" height="30" alt="CoreUI Logo"> -->
      [LOGO]
    </b-link>
    <SidebarToggler ref="sidebarToggler" class="d-none" display="lg" :default-open="isSidebarOpen" />
    <b-navbar-nav class="d-md-down-none">
      <SiteMapDropdown />
      <!-- <b-nav-item class="px-3" to="/identity">
        Identity
      </b-nav-item>
      <b-nav-item class="px-3" to="/inventory">
        Inventory
      </b-nav-item>
      <b-nav-item class="px-3" to="/plugin">
        Plugin
      </b-nav-item> -->
    </b-navbar-nav>

    <b-navbar-nav class="ml-auto">
      <LanguageDropdown /> &nbsp;&nbsp;&nbsp;
      <AccountDropdown />
    </b-navbar-nav>
  </AppHeader>
</template>

<script>
import { Header as AppHeader, SidebarToggler } from '@coreui/vue'
import SiteMapDropdown from '@/components/dropdown/DPO_001_SiteMapDropdown'
import AccountDropdown from '@/components/dropdown/DPO_002_AccountDropdown'
import LanguageDropdown from '@/components/dropdown/DPO_003_LanguageDropdown'
import { mapState } from 'vuex'

export default {
  name: 'BaseHeader',
  components: {
    AppHeader,
    SidebarToggler,
    LanguageDropdown,
    SiteMapDropdown,
    AccountDropdown
  },
  computed: {
    ...mapGetters('sidebar', [
      'isSidebarOpen'
    ])
  },
  watch: {
    isSidebarOpen () {
      this.$refs.sidebarToggler.$el.click()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
