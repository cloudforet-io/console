<template>
  <!--<div>
    <button @click='toggleShow' class='anchor'>Services</button>
    <div v-if='showMenu' class='menu'>
      <ul>
        <div class="row">
          <div class="col-sm-6">
            <ul class="multi-column-dropdown">
              <li><a href="#">Action</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here that's extra long so we can see how it looks</a></li>
              <li class="divider"></li>
              <li><a href="#">Separated link</a></li>
              <li class="divider"></li>
              <li><a href="#">One more separated link</a></li>
            </ul>
          </div>
          <div class="col-sm-6">
            <ul class="multi-column-dropdown">
              <li><a href="#">Action</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li class="divider"></li>
              <li><a href="#">Separated link</a></li>
              <li class="divider"></li>
              <li><a href="#">One more separated link</a></li>
            </ul>
          </div>
        </div>
      </ul>
    </div>
  </div>-->
  <div>
    <b-dropdown id="DPO_001_SERVICE" split split-variant="outline-primary" variant="primary"  style='margin-left:10px;' v-bind:text="service" class="sm-1">
      <div class="row" style="width:50vw">
        <b-dropdown-item to="/dashboard" class="col-sm-12">
          <i class="icon-docs" /> Dash Board
        </b-dropdown-item>
        <div class="col-sm-6">
        <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-header tag="div" class="text-lg-left">
            <strong>Identity</strong>
          </b-dropdown-header>
          <!--<b-dropdown-item to="/identity/domain">
            <i class="icon-docs" /> Domain
          </b-dropdown-item>-->
          <b-dropdown-item to="/identity/project">
            <i class="icon-book-open" /> Project
          </b-dropdown-item>
          <b-dropdown-item to="/identity/user">
            <i class="fa fa-users fa-lg" /> User
          </b-dropdown-item>
          <!--<b-dropdown-item to="/identity/api-key">
            <i class="icon-key" /> API Key
          </b-dropdown-item>-->
        </div>
        <div class="col-sm-6">
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-header tag="div" class="text-lg-left">
            <strong>Inventory</strong>
          </b-dropdown-header>
          <b-dropdown-item to="/inventory/data-center">
            <i class="fa fa-building fa-lg"/> Data Center
          </b-dropdown-item>
          <b-dropdown-item to="/inventory/server">
            <i class="fa fa-server fa-lg" /> Server
          </b-dropdown-item>
          <b-dropdown-item to="/inventory/network">
            <i class="icon-share fa-lg"></i>Network
          </b-dropdown-item>
        </div>
      </div>
      <div class="row" style="width:50vw">
        <div class="col-sm-6">
          <b-dropdown-header tag="div" class="text-lg-left">
            <strong>Plugin</strong>
          </b-dropdown-header>
          <b-dropdown-item to="/plugin/plugin-manager">
            <i class="fa fa-plug fa-lg" /> Plugin Manager
          </b-dropdown-item>
          <b-dropdown-item to="/plugin/plugin">
            <i class="icon-present fa-lg" /> Plugin
          </b-dropdown-item>
        </div>
        <div class="col-sm-6">
        </div>
      </div>
    </b-dropdown>
  </div>


</template>

<script>
  export default {
    data: function() {
      return {
        service: this.$i18n.t('MSG.DR_SERV'),
        showMenu: false
      }
    },
    props: {
      onClick: 'function',
    },
    methods: {
      toggleShow: function() {
        this.showMenu = !this.showMenu;
      },
    }
  }
</script>
<style lang="scss" scoped>
  .anchor {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    padding: .75rem 2rem;
    font-size: 1rem;
    border-radius: .25rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    color: #fff;
    background-color: #27AE60;
    border-color: #27AE60;
  }

  .anchor::after {
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

  .anchor:hover {
    color: #fff;
    background-color: #229954;
    border-color: #229954;
    cursor: pointer;
  }

  .menu {
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,.15);
    border-radius: .25rem;
    color: #212529;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    font-size: 1rem;
    list-style: none;
    margin: .125rem 0 0;
    padding: .5rem 0;
    position: absolute;
    text-align: left;
  }

  .menu-item {
    color: #212529;
    padding: .25rem 1.5rem;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  }

  .menu-item:hover {
    background-color: #F4F6F6;
    cursor: pointer;
  }

  span {
    font-weight: bold;
    color: #229954;
    font-size: 1.25rem;
  }
  .dropdown-menu {
    min-width: 200px;
  }
  .dropdown-menu.columns-2 {
    min-width: 400px;
  }
  .dropdown-menu.columns-3 {
    min-width: 600px;
  }
  .dropdown-menu li a {
    padding: 5px 15px;
    font-weight: 300;
  }
  .multi-column-dropdown {
    list-style: none;
    margin: 0px;
    padding: 0px;
  }
  .multi-column-dropdown li a {
    display: block;
    clear: both;
    line-height: 1.428571429;
    color: #333;
    white-space: normal;
  }
  .multi-column-dropdown li a:hover {
    text-decoration: none;
    color: #262626;
    background-color: #999;
  }

  @media (max-width: 767px) {
    .dropdown-menu.multi-column {
      min-width: 240px !important;
      overflow-x: hidden;
    }
  }
</style>


