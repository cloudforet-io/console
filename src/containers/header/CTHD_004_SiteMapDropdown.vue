<template>
  <!-- <b-dropdown class="dropdown" size="sm" no-caret> -->
  <span class="site-map-component">
    <b-button class="btn toggle" @click="toggleShow">
      <span>Services</span> &nbsp;
      <i class="fal fa-angle-down" />
    </b-button>
    <transition name="slide-fade">
      <b-row v-if="showMap" class="map-container">

        <b-col cols="12" class="group">
          <b-row>
            <b-col cols="12" class="header item">
              <i class="fal fa-chart-line" />
              <span class="title">Dashboard</span>
            </b-col>
          </b-row>
        </b-col>
        
        <b-col cols="6" class="group">
          <b-row>
            <b-col cols="12" class="header">
              <i class="fal fa-chart-line" />
              <span class="title">Identity</span>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="11" offset="1" class="item">
              <i class="fal fa-chart-line" />
              <span class="title">User</span>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="11" offset="1" class="item">
              <i class="fal fa-chart-line" />
              <span class="title">Project</span>
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="6" class="group">
          <b-row>
            <b-col cols="12" class="header">
              <i class="fal fa-chart-line" />
              <span class="title">Inventory</span>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="11" offset="1" class="item">
              <i class="fal fa-chart-line" />
              <span class="title">Data Center</span>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="11" offset="1" class="item">
              <i class="fal fa-chart-line" />
              <span class="title">Server</span>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="11" offset="1" class="item">
              <i class="fal fa-chart-line" />
              <span class="title">Settings</span>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </transition>
  <!-- <b-dropdown-item to="/identity/project">
      <div class="item">
        <i class="fal fa-project-diagram" />
        <span class="name">Project</span>
      </div>
    </b-dropdown-item>
    <b-dropdown-item to="/identity/user">
      <div class="item">
        <i class="fal fa-users-class" />
        <span class="name">User</span>
      </div>
    </b-dropdown-item> -->
  <!-- </b-dropdown> -->
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
            service: this.$i18n.t('MSG.DR_SERV'),
            showMap: true
        };
    },
    methods: {
        toggleShow: function () {
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

.slide-fade-enter-active {
  transition: all .4s ease-in-out;
}
.slide-fade-enter {
  transform: translateY(-250px);
  opacity: 0;
}

.map-container {
  @extend %sheet;
  position: absolute;
  // height: 200px;
  width: 500px;
  top: $header-height;
  z-index: 3;
  background-color: $white;
  padding: 20px 15px;
  .group {
    border-bottom: 1px solid $blue;
    padding: 10px 15px;
    .header {
      vertical-align: middle;
      padding: 8px;
      font-size: 1.1rem;
      text-transform: uppercase;
      cursor: default;
      .title {
        padding-left: 10px;
      }
    }
    .item {
      vertical-align: middle;
      padding: 3px;
      font-size: 1.1rem;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        background-color: $skyblue;
      }
      .title {
        padding-left: 10px;
      }
    }
  }
  
}
</style>
