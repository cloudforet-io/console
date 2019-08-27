<template>
  <span class="site-map-component">
    <b-button class="btn toggle" @click.stop="toggleShow">
      <span>{{ tr('DR_SERV') }}</span> &nbsp;
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

      <b-col cols="12" class="group">
        <b-row>
          <b-col cols="12" class="header clickable bordered">
            <span class="icon"><i class="fa fa-chart-line" /></span>
            <span class="title" @click="showMap = false">
              <router-link to="/dashboard">Dashboard</router-link>
            </span>
          </b-col>
        </b-row>
      </b-col>
      
      <b-col cols="6" class="group">
        <b-row>
          <b-col cols="12" class="header">
            <span class="icon"><i class="fa fa-warehouse-alt" /></span>
            <span class="title">Inventory</span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title " @click="showMap = false">
              <router-link to="/inventory/data-center">Data Center</router-link>
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title " @click="showMap = false">
              <router-link to="/inventory/server">Server</router-link>
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title " @click="showMap = false">
              <router-link to="/inventory/settings">Settings</router-link>
            </span>
          </b-col>
        </b-row>
      </b-col>

      <b-col cols="6" class="group">
        <b-row>
          <b-col cols="12" class="header">
            <span class="icon"><i class="fa fa-address-card" /></span>
            <span class="title">Identity</span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title " @click="showMap = false">
              <router-link to="/identity/user">User</router-link>
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="11" offset="1" class="item">
            <span class="title " @click="showMap = false">
              <router-link to="/identity/project">Project</router-link>
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
  border-radius: 3px;
  box-shadow: 0px 15px 20px 2px rgba($black, 0.5);;
  position: absolute;
  z-index: 11;
  width: 400px;
  top: calc(#{$header-height} - 7px);
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
      background-color: rgba($blueviolet, 0.3);
      font-weight: 600;
      color: $navy;
    }
  }

  .group {
    color: $black;
    .header {
      vertical-align: middle;
      padding: 8px;
      font-size: 1.2rem;
    //   text-transform: uppercase;
      letter-spacing: 0.04rem;
      font-weight: 600;
      cursor: default;
      .title {
        padding-left: 10px;
        vertical-align: middle;
      }
      .icon {
          display: inline-block;
          width: 25px;
          text-align: center;
          vertical-align: baseline;
      }
      &.clickable {
        @extend %click-item;
      }
    }
    .item {
      @extend %click-item;
      vertical-align: middle;
      padding: 3px;
      padding-left: 18px;
      font-size: 1.08rem;
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

    .bordered {
        border-bottom: 1px solid $gray;
        margin-bottom: 10px;
    }
  
}
</style>
