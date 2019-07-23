<template>
  <AppHeader fixed>
    <b-row no-gutters align-h="between" class="header-container">
      <b-col cols="10" class="header row no-gutters">
        <b-row no-gutters class="content">
          <SidebarToggler class="d-lg-none" display="md" mobile />
          <b-link class="navbar-brand" to="/">
            <img class="navbar-brand-full" src="@/asset/img/brand/logo.svg" width="89" height="25" alt="CoreUI Logo">
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
        </b-row>
      </b-col>
      <b-col cols="2" class="header row no-gutters justify-content-end">
        <b-row no-gutters class="content">
          <b-navbar-nav class="ml-auto">
            <LanguageDropdown /> &nbsp;&nbsp;&nbsp;
            <AccountDropdown class="account-dropdown" />
          </b-navbar-nav>
        </b-row>
      </b-col>
    </b-row>
  </AppHeader>
</template>

<script>
import { Header as AppHeader, SidebarToggler } from '@coreui/vue'
import AccountDropdown from './CTHD_002_AccountDropdown'
import LanguageDropdown from './CTHD_003_LanguageDropdown'
import SiteMapDropdown from './CTHD_004_SiteMapDropdown'
import { mapGetters } from 'vuex'

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
.header-container {
  background-color: transparent;
  width: 100%;
  margin: 0;
  padding: 10px;
  .header {
    .content {
      width: calc(100% - 10px);
      border-radius: 10px;
      box-shadow: 0px 0 20px 0px rgba($black, 0.1);
    }
  }
}
img {
  filter: opacity(0.5) drop-shadow(0 0 0 $blue);
}
.account-dropdown {
  margin-left: 10px;
  margin-right: 30px;
}
</style>
