<template>
  <AppHeaderDropdown right no-caret>
    <template slot="header">
      <span class="user">
        <i class="icon-user" />
        <span>{이름}</span>
      </span>
    </template>
    <template slot="dropdown">
      <b-dropdown-item @click="logout">
        <div class="item">
          <i class="icon fa fa-lock" />
          <span class="name">Logout</span>
        </div>
      </b-dropdown-item>
    </template>
  </AppHeaderDropdown>
</template>

<script>
import { HeaderDropdown as AppHeaderDropdown } from '@coreui/vue'

export default {
  name: 'AccountDropdown',
  components: {
    AppHeaderDropdown
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
