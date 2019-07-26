<template>
  <b-row align-h="between" class="header-container no-gutters">
    <b-col cols="10" class="row no-gutters">
      <b-navbar class="header">
        <b-navbar-nav>
          <b-nav-item>
            <b-link class="nav brand" to="/">
              <img src="@/asset/img/brand/dcos.png">
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
import AccountDropdown from './CTHD_002_AccountDropdown';
import LanguageDropdown from './CTHD_003_LanguageDropdown';
import SiteMapDropdown from './CTHD_004_SiteMapDropdown';

export default {
  name: 'BaseHeader',
  components: {
    LanguageDropdown,
    SiteMapDropdown,
    AccountDropdown
  }
};
</script>

<style lang="scss" scoped>
$mb: 10px;
.header-container {
  background-color: rgba($white, 0.95);
  height: calc(#{$header-height} - #{$mb});
  box-shadow: 0px 0 5px 0px rgba($black, 0.3);
  margin-bottom: $mb;
  .row {
    height: 100%;
    .header {
      height: 100%;
      padding: 0;
      width: calc(100% - #{$side-pad});
      overflow: hidden;
      .navbar-nav {
        max-height: 100%;
        .nav-item {
          max-height: 100%;
          button.dropdown-toggle {
            background-color: transparent;
            border-color: transparent;
            font-size: 1.1rem;
            font-weight: 400;
            color: darken($darkgray, 20%);
            &:active, &.active, &[aria-expanded="true"] {
              background-color: transparent;
              border-color: $gray;
              color: $black;
            }
          }
          .nav-link {
            max-height: 100%;
            padding: 0;
            .nav {
              max-height: 100%;
              margin-right: 20px;
              &.brand {
                margin-left: 20px;
                padding: 5px;
                font-weight: 700;
                font-size: 1.5em;
                color: lighten($navy, 13%);
                text-shadow: 3px 2px 3px $darkgray;
                img {
                  height: calc(#{$header-height} - #{$mb} - 20px);
                  filter: sepia(110%) hue-rotate(190deg) saturate(530%);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
