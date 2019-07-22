<template>
  <div>
    <button class="anchor" @click="toggleShow">
      Services
    </button>
    <div v-if="showMenu" class="menu">
      <ul>
        <div class="row">
          <div class="col-sm-6">
            <ul class="multi-column-dropdown">
              <li><a href="#">One more separated link</a></li>
            </ul>
          </div>
          <div class="col-sm-6">
            <ul class="multi-column-dropdown">
              <li><a href="#">Action</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li class="divider" />
              <li><a href="#">Separated link</a></li>
              <li class="divider" />
              <li><a href="#">One more separated link</a></li>
            </ul>
          </div>
        </div>
      </ul>
    </div>
  </div>
  <!-- <div>
    <b-dropdown :text="service" class="sm-1">
      <b-row>
        <b-dropdown-item to="/dashboard" class="col-sm-12">
          <i class="icon-docs" /> Dash Board
        </b-dropdown-item>
        <div class="col-sm-6">
          <b-dropdown-divider />
          <b-dropdown-header tag="div" class="text-lg-left">
            <strong>Identity</strong>
          </b-dropdown-header>
          <b-dropdown-item to="/identity/project">
            <i class="icon-book-open" /> Project
          </b-dropdown-item>
          <b-dropdown-item to="/identity/user">
            <i class="fa fa-users fa-lg" /> User
          </b-dropdown-item>
        </div>
        <div class="col-sm-6">
          <b-dropdown-divider />
          <b-dropdown-header tag="div" class="text-lg-left">
            <strong>Inventory</strong>
          </b-dropdown-header>
          <b-dropdown-item to="/inventory/data-center">
            <i class="fa fa-building fa-lg" /> Data Center
          </b-dropdown-item>
          <b-dropdown-item to="/inventory/server">
            <i class="fa fa-server fa-lg" /> Server
          </b-dropdown-item>
          <b-dropdown-item to="/inventory/collector-plugin">
            <i class="icon-share fa-lg" />Settings(Admin)
          </b-dropdown-item>
        </div>
      </b-row>
    </b-dropdown>
  </div> -->
</template>

<script>
export default {
  props: {
    onClick: {
      type: Function,
      default: () => {}
    }
  },
  data: function () {
    return {
      service: this.$i18n.t('MSG.DR_SERV'),
      showMenu: false
    }
  },
  methods: {
    toggleShow: function () {
      this.showMenu = !this.showMenu
    }
  }
}
</script>
<style lang="scss" scoped>
  .anchor {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    padding: 8px 10px;
    border-radius: 5px;
    // transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    &::after {
      display: inline-block;
      width: 0;
      height: 0;
      margin-left: .5em;
      vertical-align: .255em;
      content: "";
      border-top: .3em solid;
      border-right: .28em solid transparent;
      border-bottom: 0;
      border-left: .28em solid transparent;
    }
    &:hover {
      color: #fff;
      background-color: gray;
      cursor: pointer;
    }
  }

  .menu {
    position: absolute;
    background-color: #fff;
    border-radius: 5px;
    color: #212529;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    list-style: none;
    margin: .125rem 0 0;
    padding: .5rem 0;
    text-align: left;
  }

  .multi-column-dropdown {
    list-style: none;
    margin: 0px;
    padding: 0px;
    li a {
      display: block;
      clear: both;
      line-height: 1.428571429;
      color: #333;
      white-space: normal;

      &:hover {
        text-decoration: none;
        color: #262626;
        background-color: #999;
      }
    }
  }

  // .menu-item {
  //   color: #212529;
  //   padding: .25rem 1.5rem;
  //   transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  // }

  // .menu-item:hover {
  //   background-color: #F4F6F6;
  //   cursor: pointer;
  // }

  // span {
  //   font-weight: bold;
  //   color: #229954;
  //   font-size: 1.25rem;
  // }
  // .dropdown-menu {
  //   min-width: 200px;
  // }
  // .dropdown-menu.columns-2 {
  //   min-width: 400px;
  // }
  // .dropdown-menu.columns-3 {
  //   min-width: 600px;
  // }
  // .dropdown-menu li a {
  //   padding: 5px 15px;
  //   font-weight: 300;
  // }

  @media (max-width: 767px) {
    .dropdown-menu.multi-column {
      min-width: 240px !important;
      overflow-x: hidden;
    }
  }
</style>
