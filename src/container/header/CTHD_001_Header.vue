<template>
  <b-row align-h="between" class="header-container no-gutters">
    <b-col cols="10" class="row no-gutters">
      <b-navbar class="header">
        <b-navbar-nav>
          <b-nav-item>
            <b-link class="nav brand" to="/">
              CLOUDONE
            </b-link>
          </b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-nav-item><SiteMapDropdown class="nav" /></b-nav-item>
        </b-navbar-nav>
      </b-navbar>
    </b-col>

    <b-col cols="2" class="row no-gutters justify-content-end">
      <b-navbar class="header">
        <b-navbar-nav class="ml-auto">
          <b-nav-item><LanguageDropdown class="nav" /></b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-nav-item><AccountDropdown class="nav" /></b-nav-item>
        </b-navbar-nav>
      </b-navbar>
    </b-col>
  </b-row>
</template>

<script>
import AccountDropdown from './CTHD_002_AccountDropdown'
import LanguageDropdown from './CTHD_003_LanguageDropdown'
import SiteMapDropdown from './CTHD_004_SiteMapDropdown'

export default {
  name: 'BaseHeader',
  components: {
    LanguageDropdown,
    SiteMapDropdown,
    AccountDropdown
  }
}
</script>

<style lang="scss" scoped>
.header-container {
  background-color: transparent;
  height: $header-height;
  padding: $top-pad $side-pad;
  .row {
    .header {
      @extend %sheet;
      padding: 0;
      width: calc(100% - #{$side-pad});
      .nav {
        &.brand {
          padding: 5px;
          font-weight: 700;
          font-size: 1.2em;
          color: $navy;
        }
      }
    }
  }
}
</style>
