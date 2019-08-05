<template>
  <b-dropdown size="sm" right no-caret>
    <template slot="button-content">
      <span class="name">{{ $store.state.auth.username }}</span>
    </template>
    <b-dropdown-item @click="logout">
      <div class="item">
        <i class="fal fa-sign-out" />
        <span class="name">Logout</span>
      </div>
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
export default {
    name: 'AccountDropdown',
    components: {
    },
    methods: {
        async logout () {
            await this.$store.dispatch('auth/logout');
            this.$router.push({ path: '/log-in' });
        }
    }
};
</script>

<style lang="scss" scoped>
.icon-user {
  margin-right: 8px;
}
</style>
