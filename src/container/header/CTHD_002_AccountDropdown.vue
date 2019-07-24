<template>
  <b-dropdown size="sm" right no-caret>
    <template slot="button-content">
      <i class="icon-user" /> &nbsp;
      <span class="name">Username</span>
    </template>
    <b-dropdown-item @click="logout">
      <div class="item">
        <i class="icon fa fa-lock" />
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
      await this.$store.dispatch('auth/logout')
      this.$router.push({ path: '/log-in' })
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  display: flex;
  align-items: center;
  color: $black;
}
</style>
