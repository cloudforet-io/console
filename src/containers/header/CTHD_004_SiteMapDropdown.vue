<template>
  <span class="site-map-component">
    <b-button class="btn toggle" @click.stop="toggleShow">
      <span>{{ $i18n.t('MSG.DR_SERV') }}</span> &nbsp;
      <i v-if="showMap" class="fal fa-angle-up" />
      <i v-else class="fal fa-angle-down" />
    </b-button>
    <transition name="fade">
      <div v-if="showMap" class="backdrop" @click="showMap = false" />
    </transition>
    <b-row class="map-container" 
           :class="{ 'slide-fade-in': showMap,
                     'slide-fade-out': !showMap }"
    >

      <b-col cols="6" class="group">
        <b-row>
          <b-col cols="12" class="header clickable">
            <i class="fal fa-chart-line" />
            <span class="title" @click="showMap = false">
              <router-link to="/dashboard">Dashboard</router-link>
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="12" class="header">
            <i class="fal fa-address-card" />
            <span class="title">Identity</span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title" @click="showMap = false">
              <router-link to="/identity/user">User</router-link>
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title" @click="showMap = false">
              <router-link to="/identity/project">Project</router-link>
            </span>
          </b-col>
        </b-row>
      </b-col>
      
      <b-col cols="6" class="group">
        <b-row>
          <b-col cols="12" class="header">
            <i class="fal fa-warehouse-alt" />
            <span class="title">Inventory</span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title" @click="showMap = false">
              <router-link to="/inventory/data-center">Data Center</router-link>
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title" @click="showMap = false">
              <router-link to="/inventory/server">Server</router-link>
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title" @click="showMap = false">
              <router-link to="/inventory/settings">Settings</router-link>
            </span>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </span>
</template>

<script>
export default {
    name: 'SiteMapDropdown',
    components: {
    },
    props: {
        onClick: {
            type: Function,
            default: () => {}
        }
    },
    data: function () {
        return {
            showMap: false
        };
    },
    methods: {
        toggleShow () {
            this.showMap = !this.showMap;
        }
    }
};
</script>
<style lang="scss" scoped>
.btn.toggle {
  background-color: transparent;
  border-color: transparent;
  font-size: 1rem;
  font-weight: 400;
  color: darken($darkgray, 20%);
  color: $white;
  &:active, &.active, &[aria-expanded="true"] {
    background-color: transparent;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: all .3s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.backdrop {
  position: fixed;
  height: 100vh;
  width: 100vw;
  z-index: 10;
  left: 0;
  top: $header-height;
  background-color: rgba($black, 0.3);
}
.map-container {
  @extend %sheet;
  position: absolute;
  z-index: 11;
  width: 400px;
  top: $header-height;
  background-color: $white;
  padding: 20px 30px;

  opacity: 0;
  transform: scaleY(0);
  transform-origin: top;
  &.slide-fade-in {
    transform: scaleY(1);
    transform-origin: top;
    opacity: 1;
    transition: all .3s ease-in;
  }
  &.slide-fade-out {
    transition: all .3s ease-out;
    opacity: 0;
  }

  %click-item {
    cursor: pointer;
    border-radius: 5px;
    &:hover {
      background-color: $skyblue;
    }
  }

  .group {
    color: $black;
    .header {
      vertical-align: middle;
      padding: 8px;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.04rem;
      font-weight: 500;
      cursor: default;
      .title {
        padding-left: 10px;
      }
      &.clickable {
        @extend %click-item;
      }
    }
    .item {
      @extend %click-item;
      vertical-align: middle;
      padding: 3px;
      padding-left: 15px;
      font-size: 1rem;
      letter-spacing: -0.01rem;
      .title {
        padding-left: 10px;
        display: inline-block;
        width: 100%;
        a {
          display: inline-block;
          width: 100%;
        }
      }
    }
  }
  
}
</style>
