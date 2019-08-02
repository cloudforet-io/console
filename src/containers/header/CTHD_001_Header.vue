<template>
  <transition name="slide-fade">
    <div v-if="show" class="header-container">
      <b-row align-h="between" no-gutters class="main-header">
        <b-col cols="10" class="row no-gutters">
          <b-navbar class="header">
            <b-navbar-nav>
              <b-nav-item>
                <b-link class="nav brand" to="/">
                  <img src="@/asset/images/brand/dcos.png">
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

      <SubHeader />
    </div>
  </transition>
</template>

<script>
import SiteMapDropdown from './CTHD_004_SiteMapDropdown';
import AccountDropdown from './CTHD_002_AccountDropdown';
import LanguageDropdown from './CTHD_003_LanguageDropdown';
import SubHeader from './CTHD_005_SubHeader';

export default {
  name: 'BaseHeader',
  components: {
    LanguageDropdown,
    SiteMapDropdown,
    AccountDropdown,
    SubHeader
  },
  data () {
    return {
      show: false
    };
  },
  mounted() {
    this.show = true;
  }
};
</script>

<style lang="scss" scoped>
.slide-fade-enter-active {
  transition: all .4s ease-in-out;
}
.slide-fade-enter {
  transform: translateY(calc(-#{$header-height}));
  opacity: 0;
}
.header-container {
  // background: $gradient;
}
.main-header {
  // background-color: rgba($white, 0.95);
  background: $gradient;
  box-shadow: 0px 0 10px 0px rgba($black, 0.5);
  height: calc(#{$header-height});
  font-family: $font-big;
  .header {
    padding: 0;
    width: calc(100% - #{$side-pad});
    .navbar-nav .nav-item .nav-link {
      padding: 0;
      vertical-align: middle;
      .nav {
        margin-right: 20px;
        &.brand {
          margin-left: 20px;
          margin-right: 20px;
          padding-top: 6px;
          img {
            max-height: calc(#{$header-height} - 6px);
            filter: sepia(110%) hue-rotate(190deg) saturate(530%);
          }
        }
      }
    }
  }
}
</style>
