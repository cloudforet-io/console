<template>
  <b-dropdown class="dropdown" size="sm" no-caret>
    <template slot="button-content">
      <span>Services</span> &nbsp;
      <i class="down-btn fal fa-angle-down" />
    </template>
    <b-dropdown-item to="/identity/project">
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
    </b-dropdown-item>
  </b-dropdown>
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
            showMenu: false
        };
    },
    methods: {
        toggleShow: function () {
            this.showMenu = !this.showMenu;
        }
    }
};
</script>
<style lang="scss" scoped>
</style>
