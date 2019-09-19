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

      <b-col cols="12" class="group bordered" @click="showMap = false">
        <router-link to="/dashboard">
          <span class="header">
            <span class="icon"><i class="fa fa-chart-line" /></span>
            <span class="header-title">{{ tr('DASHBOARD') }}</span>
          </span>
        </router-link>
      </b-col>
      
      <b-col cols="6" class="group">
        <span class="header">
          <span class="icon"><i class="fa fa-warehouse-alt" /></span>
          <span class="header-title">{{ tr('INVENTORY') }}</span>
        </span>
        <span class="item" @click="showMap = false">
          <router-link to="/inventory/data-center">{{ tr('DATA_CENTER') }}</router-link>
        </span>
        <span class="item " @click="showMap = false">
          <router-link to="/inventory/server">{{ tr('SERVER') }}</router-link>
        </span>
        <span class="item " @click="showMap = false">
          <router-link to="/inventory/collector">{{ tr('COLLECTOR') }}</router-link>
        </span>
      </b-col>

      <b-col cols="6" class="group">
        <span class="header">
          <span class="icon"><i class="fa fa-address-card" /></span>
          <span class="header-title">{{ tr('IDENTITY') }}</span>
        </span>
        <span class="item " @click="showMap = false">
          <router-link to="/identity/user">{{ tr('USER') }}</router-link>
        </span>
        <span class="item " @click="showMap = false">
          <router-link to="/identity/project">{{ tr('PROJECT') }}</router-link>
        </span>
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
  &:focus {
      box-shadow: none;
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
}

@mixin clickable () {
    cursor: pointer;
    border-radius: 5px;
    display: inline-block;
    width: 100%;
    &:hover {
        background-color: rgba($blueviolet, 0.3);
        color: $navy;
    }
    .header {
        cursor: pointer;
    }
}

.group {
    color: $black;
    cursor: default;
    > a {
        @include clickable();
    }
    .header {
        display: inline-block;
        width: 100%;
        vertical-align: middle;
        font-size: 1.2rem;
        letter-spacing: 0.04rem;
        font-weight: 600;
        cursor: default;
        .header-title {
            display: inline-block;
            padding: 5px 8px;
            vertical-align: middle;
        }
        .icon {
            display: inline-block;
            width: 25px;
            text-align: center;
            vertical-align: baseline;
        }
    }
    .item {
        vertical-align: middle;
        display: inline-block;
        width: 100%;
        > a {
            @include clickable();
            padding: 3px;
            padding-left: 32px;
            font-size: 1.08rem;
            letter-spacing: -0.01rem;
        }
    }
}

.bordered {
    border-bottom: 1px solid $gray;
    padding-bottom: 5px;
    margin-bottom: 10px;
}
</style>
